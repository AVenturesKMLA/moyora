import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LoginModal } from '@/components/modals/LoginModal';
import { Home } from './Home';
import { Landing } from './Landing';
import { Discover } from './Discover';
import { Collab } from './Collab';
import { Projects } from './Projects';
import { MyPage } from './MyPage';
import { useDemo } from '@/hooks/useDemo';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { state, reset, addCollab, updateCollab, addProject, addArtifact, addApplication, addRating, updateClub, addClubJoinRequest } = useDemo();
  const { user, signOut, tryDemo, isGuest } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'signup'>('login');

  const handleClubJoinRequest = (clubId: string) => {
    if (!user) return;
    addClubJoinRequest({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      club_id: clubId,
      requested_at: new Date().toISOString(),
      status: 'pending',
    });
  };

  const handleLogin = () => {
    setLoginModalMode('login');
    setShowLoginModal(true);
  };

  const handleSignup = () => {
    setLoginModalMode('signup');
    setShowLoginModal(true);
  };

  const handleTryDemo = () => {
    tryDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onReset={reset} 
        onLogin={handleLogin}
        onSignup={handleSignup}
        user={user}
        onLogout={signOut}
        isGuest={isGuest}
      />

      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              user 
                ? <Home state={state} onAddProject={addProject} />
                : <Landing onSignup={handleSignup} onTryDemo={handleTryDemo} />
            } 
          />
          <Route path="/discover" element={<Discover state={state} />} />
          <Route 
            path="/collab" 
            element={
              <Collab 
                state={state} 
                user={user}
                onAddCollab={addCollab} 
                onUpdateCollab={updateCollab}
                onAddProject={addProject} 
                onAddApplication={addApplication}
                onAddRating={addRating}
              />
            } 
          />
          <Route path="/projects" element={<Projects state={state} onAddArtifact={addArtifact} />} />
          <Route path="/mypage" element={<MyPage user={user} state={state} onUpdateClub={updateClub} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal} 
        clubs={state.clubs}
        onClubJoinRequest={handleClubJoinRequest}
        initialMode={loginModalMode}
        onAuthSuccess={() => navigate('/mypage')}
      />
    </div>
  );
}
