import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DemoUser } from '@/hooks/useAuth';
import { User } from 'lucide-react';
import logo from '@/assets/logo.png';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  onReset: () => void;
  onLogin: () => void;
  onSignup: () => void;
  user?: DemoUser | null;
  onLogout?: () => void;
  isGuest?: boolean;
}

const navItems = [
  { path: '/', label: '홈', requiresAuth: false },
  { path: '/discover', label: '탐색', requiresAuth: true },
  { path: '/collab', label: '협업모집', requiresAuth: true },
  { path: '/projects', label: '진행중', requiresAuth: true },
];

export function Header({ onReset, onLogin, onSignup, user, onLogout, isGuest }: HeaderProps) {
  const location = useLocation();

  const handleRestrictedClick = (e: React.MouseEvent, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      e.preventDefault();
      toast({
        title: '로그인 필요',
        description: '회원가입 후 이용하세요!',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 topbar-glass border-b border-border">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="모여라" 
            className="h-9 w-auto"
          />
          <div>
            <div className="font-extrabold tracking-tight text-foreground">모여라</div>
            <div className="text-xs text-muted-foreground">동아리 협업 네트워크</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const isDisabled = item.requiresAuth && !user;
            
            return (
              <Button
                key={item.path}
                asChild
                variant={isActive ? 'navActive' : 'nav'}
                size="sm"
                className={isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
              >
                <Link 
                  to={isDisabled ? '#' : item.path}
                  onClick={(e) => handleRestrictedClick(e, item.requiresAuth)}
                >
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            데모 리셋
          </Button>
          
          {user ? (
            isGuest ? (
              <>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                  체험 모드
                </span>
                <Button variant="outline" size="sm" onClick={onSignup}>
                  회원가입
                </Button>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  나가기
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/mypage">
                    <User className="w-4 h-4" />
                    마이페이지
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  로그아웃
                </Button>
              </>
            )
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onLogin}>
                로그인
              </Button>
              <Button variant="primary" size="sm" onClick={onSignup}>
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
