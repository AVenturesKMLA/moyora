import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClubCard } from '@/components/cards/ClubCard';
import { CollabCard } from '@/components/cards/CollabCard';
import { ClubModal } from '@/components/modals/ClubModal';
import { CollabModal } from '@/components/modals/CollabModal';
import { DemoState } from '@/data/demoData';

interface HomeProps {
  state: DemoState;
  onAddProject: (project: { title: string; members: string[]; progress: number; artifacts: string[]; next: string }) => void;
}

export function Home({ state, onAddProject }: HomeProps) {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);

  const clubCount = state.clubs.length;
  const collabCompleted = state.collabs.filter(x => x.status === 'closed').length;
  const userCount = 128; // Mock user count for demo

  const selectedClub = state.clubs.find(c => c.id === selectedClubId) || null;
  const selectedCollab = state.collabs.find(c => c.id === selectedCollabId) || null;
  const collabClub = selectedCollab ? state.clubs.find(c => c.id === selectedCollab.club_id) : undefined;

  const handleCreateRoom = () => {
    if (selectedCollab && collabClub) {
      onAddProject({
        title: selectedCollab.title,
        members: [collabClub.name, 'Your Club'],
        progress: 5,
        artifacts: ['초기 브리프'],
        next: '역할 확정 + 일정 확정',
      });
      setSelectedCollabId(null);
    }
  };

  // Get ongoing collaborations (not closed)
  const ongoingCollabs = state.collabs.filter(x => x.status !== 'closed');

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      {/* Hero Section */}
      <section className="panel">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-foreground">
            동아리 활동의 새로운 차원
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent">
              <div className="text-sm text-muted-foreground font-medium">모여라 회원</div>
              <div className="text-3xl font-black mt-3 text-primary">{userCount}</div>
              <div className="text-xs text-muted-foreground mt-1">명이 함께하고 있어요</div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-secondary/5 to-transparent">
              <div className="text-sm text-muted-foreground font-medium">함께하는 동아리</div>
              <div className="text-3xl font-black mt-3 text-primary">{clubCount}</div>
              <div className="text-xs text-muted-foreground mt-1">개의 동아리가 등록됨</div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-accent/10 to-transparent">
              <div className="text-sm text-muted-foreground font-medium">성사된 교류</div>
              <div className="text-3xl font-black mt-3 text-primary">{collabCompleted}</div>
              <div className="text-xs text-muted-foreground mt-1">건의 협업이 완료됨</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Collaborations */}
      <section className="panel">
        <div className="panel-header">
          <div className="font-extrabold text-foreground">진행중</div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/collab">전체 보기</Link>
          </Button>
        </div>
        <div className="panel-body">
          <div className="grid md:grid-cols-2 gap-3">
            {ongoingCollabs.slice(0, 4).map(collab => {
              const club = state.clubs.find(c => c.id === collab.club_id);
              return (
                <CollabCard
                  key={collab.id}
                  collab={collab}
                  club={club}
                  onClick={() => setSelectedCollabId(collab.id)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Clubs */}
      <section className="panel">
        <div className="panel-header">
          <div className="font-extrabold text-foreground">최근 등록 동아리</div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/discover">전체 보기</Link>
          </Button>
        </div>
        <div className="panel-body">
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {state.clubs.map(club => (
              <ClubCard
                key={club.id}
                club={club}
                onClick={() => setSelectedClubId(club.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Hot Collabs */}
      <section className="panel">
        <div className="panel-header">
          <div className="font-extrabold text-foreground">오늘 뜨는 협업</div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/collab">전체 보기</Link>
          </Button>
        </div>
        <div className="panel-body">
          <div className="grid md:grid-cols-2 gap-3">
            {state.collabs.slice(0, 4).map(collab => {
              const club = state.clubs.find(c => c.id === collab.club_id);
              return (
                <CollabCard
                  key={collab.id}
                  collab={collab}
                  club={club}
                  onClick={() => setSelectedCollabId(collab.id)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Modals */}
      <ClubModal
        club={selectedClub}
        open={!!selectedClubId}
        onOpenChange={(open) => !open && setSelectedClubId(null)}
      />

      <CollabModal
        collab={selectedCollab}
        club={collabClub}
        open={!!selectedCollabId}
        onOpenChange={(open) => !open && setSelectedCollabId(null)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}
