import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CollabCard } from '@/components/cards/CollabCard';
import { CollabModal } from '@/components/modals/CollabModal';
import { NewCollabModal } from '@/components/modals/NewCollabModal';
import { EditCollabModal } from '@/components/modals/EditCollabModal';
import { RatingModal } from '@/components/modals/RatingModal';
import { DemoState, Collab as CollabType, Application, Club } from '@/data/demoData';
import { DemoUser } from '@/hooks/useAuth';
import { Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CollabProps {
  state: DemoState;
  user: DemoUser | null;
  onAddCollab: (collab: Omit<CollabType, 'id'>) => void;
  onUpdateCollab: (collabId: string, updates: Partial<CollabType>) => void;
  onAddProject: (project: { title: string; members: string[]; progress: number; artifacts: string[]; next: string }) => void;
  onAddApplication: (application: Omit<Application, 'id'>) => void;
  onAddRating: (collab_id: string, rated_club_id: string, rating: number) => void;
}

export function Collab({ state, user, onAddCollab, onUpdateCollab, onAddProject, onAddApplication, onAddRating }: CollabProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get user's club
  const myClub = useMemo(() => {
    if (!user) return null;
    return state.clubs.find(c => c.name === user.clubName || c.school === user.school) || null;
  }, [user, state.clubs]);

  const types = useMemo(() => [...new Set(state.collabs.map(x => x.type))], [state.collabs]);
  const regions = useMemo(() => [...new Set(state.collabs.map(x => x.region))], [state.collabs]);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return state.collabs.filter(p => {
      const hay = `${p.title} ${p.type} ${p.region}`.toLowerCase();
      if (term && !hay.includes(term)) return false;
      if (typeFilter && p.type !== typeFilter) return false;
      if (regionFilter && p.region !== regionFilter) return false;
      return true;
    });
  }, [state.collabs, query, typeFilter, regionFilter]);

  const selectedCollab = state.collabs.find(c => c.id === selectedCollabId) || null;
  const collabClub = selectedCollab ? state.clubs.find(c => c.id === selectedCollab.club_id) : undefined;
  const isOwnCollab = selectedCollab && myClub && selectedCollab.club_id === myClub.id;

  // Get notifications: applications to my collabs
  const myNotifications = useMemo(() => {
    if (!myClub) return [];
    const applications = state.applications || [];
    const myCollabIds = state.collabs.filter(c => c.club_id === myClub.id).map(c => c.id);
    return applications.filter(app => myCollabIds.includes(app.collab_id) && app.status === 'pending');
  }, [myClub, state.collabs, state.applications]);

  const handleSubmitCollab = (data: {
    title: string;
    type: string;
    dateStart: string;
    dateEnd?: string;
    time?: string;
    method: 'offline' | 'online';
    address?: string;
    onlineInfo?: string;
    region: string;
    notes?: string;
  }) => {
    if (!myClub) {
      toast({ title: '오류', description: '동아리 정보가 없습니다.', variant: 'destructive' });
      return;
    }
    onAddCollab({
      club_id: myClub.id,
      type: data.type,
      title: data.title,
      dateStart: data.dateStart,
      dateEnd: data.dateEnd,
      time: data.time,
      method: data.method,
      address: data.address,
      onlineInfo: data.onlineInfo,
      region: data.region,
      budget: '협의',
      notes: data.notes,
      status: 'open',
    });
    toast({ title: '등록 완료', description: '협업 모집이 등록되었습니다.' });
  };

  const handleUpdateCollab = (data: {
    title: string;
    type: string;
    dateStart: string;
    dateEnd?: string;
    time?: string;
    method: 'offline' | 'online';
    address?: string;
    onlineInfo?: string;
    region: string;
    notes?: string;
  }) => {
    if (selectedCollabId) {
      onUpdateCollab(selectedCollabId, data);
      setShowEditModal(false);
      setSelectedCollabId(null);
      toast({ title: '수정 완료', description: '협업 정보가 수정되었습니다.' });
    }
  };

  const handleApply = () => {
    if (!myClub) {
      toast({ title: '오류', description: '로그인이 필요합니다.', variant: 'destructive' });
      return;
    }
    if (!selectedCollab) return;

    const applications = state.applications || [];
    
    // Check if already applied
    const alreadyApplied = applications.some(
      app => app.collab_id === selectedCollab.id && app.applicant_club_id === myClub.id
    );
    if (alreadyApplied) {
      toast({ title: '알림', description: '이미 지원한 협업입니다.' });
      return;
    }
    
    onAddApplication({
      collab_id: selectedCollab.id,
      applicant_club_id: myClub.id,
      applied_at: new Date().toISOString(),
      status: 'pending',
    });
    toast({ title: '지원 완료', description: '협업에 지원하였습니다. 모집자에게 알림이 전송됩니다.' });
    setSelectedCollabId(null);
  };

  const handleCreateRoom = () => {
    if (selectedCollab && collabClub) {
      onAddProject({
        title: selectedCollab.title,
        members: [collabClub.name, myClub?.name || 'Your Club'],
        progress: 5,
        artifacts: ['초기 브리프'],
        next: '역할 확정 + 일정 확정',
      });
      setSelectedCollabId(null);
      toast({ title: '프로젝트 룸 생성', description: '프로젝트가 생성되었습니다.' });
    }
  };

  const handleOpenEdit = () => {
    setShowEditModal(true);
  };

  const handleOpenRating = () => {
    setShowRatingModal(true);
  };

  // Get applicants for rating modal
  const getApplicantClubs = (): Club[] => {
    if (!selectedCollab) return [];
    const applications = state.applications || [];
    const applicantIds = applications
      .filter(app => app.collab_id === selectedCollab.id && app.status === 'accepted')
      .map(app => app.applicant_club_id);
    return state.clubs.filter(c => applicantIds.includes(c.id));
  };

  return (
    <div className="container py-4 animate-fade-in">
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="font-extrabold text-foreground">협업 모집</div>
            <div className="text-sm text-muted-foreground mt-1.5">
              모집 공고 → 지원/연락 → 프로젝트 룸 생성
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {user && myNotifications.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {myNotifications.length}
                  </span>
                </Button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-lg z-50 p-3">
                    <div className="font-bold text-sm mb-2 text-foreground">새 지원 알림</div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {myNotifications.map(app => {
                        const applicantClub = state.clubs.find(c => c.id === app.applicant_club_id);
                        const collab = state.collabs.find(c => c.id === app.collab_id);
                        return (
                          <div key={app.id} className="p-2 rounded-lg bg-muted/30 text-sm">
                            <div className="font-medium text-foreground">{applicantClub?.name || '알 수 없음'}</div>
                            <div className="text-muted-foreground text-xs">
                              "{collab?.title}"에 지원
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Button variant="primary" size="sm" onClick={() => setShowNewModal(true)}>
              모집 올리기
            </Button>
          </div>
        </div>
        
        <div className="panel-body space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2.5 items-center justify-between">
            <div className="flex flex-wrap gap-2.5 items-center">
              <input
                type="text"
                className="glass-input w-48"
                placeholder="검색: 제목/유형/지역"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="glass-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">유형 전체</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                className="glass-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="">지역 전체</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">결과 {filtered.length}개</div>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(collab => {
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

      <CollabModal
        collab={selectedCollab}
        club={collabClub}
        open={!!selectedCollabId && !showEditModal && !showRatingModal}
        onOpenChange={(open) => !open && setSelectedCollabId(null)}
        onApply={handleApply}
        onCreateRoom={isOwnCollab ? handleOpenRating : handleCreateRoom}
        isOwnCollab={!!isOwnCollab}
        onEdit={handleOpenEdit}
      />

      <NewCollabModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        onSubmit={handleSubmitCollab}
      />

      {selectedCollab && (
        <>
          <EditCollabModal
            collab={selectedCollab}
            open={showEditModal}
            onOpenChange={setShowEditModal}
            onSubmit={handleUpdateCollab}
          />
          
          <RatingModal
            collab={selectedCollab}
            clubs={getApplicantClubs()}
            open={showRatingModal}
            onOpenChange={setShowRatingModal}
            onSubmitRatings={(ratings) => {
              ratings.forEach(r => onAddRating(selectedCollab.id, r.clubId, r.rating));
              toast({ title: '평가 완료', description: '참가자 평가가 저장되었습니다.' });
              setShowRatingModal(false);
              setSelectedCollabId(null);
            }}
          />
        </>
      )}
    </div>
  );
}
