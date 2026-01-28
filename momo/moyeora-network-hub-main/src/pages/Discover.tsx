import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ClubCard } from '@/components/cards/ClubCard';
import { ClubModal } from '@/components/modals/ClubModal';
import { ProposalEmailModal } from '@/components/modals/ProposalEmailModal';
import { DemoState, Club } from '@/data/demoData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface DiscoverProps {
  state: DemoState;
}

export function Discover({ state }: DiscoverProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [trustFilter, setTrustFilter] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [proposalClub, setProposalClub] = useState<Club | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const regions = useMemo(() => [...new Set(state.clubs.map(c => c.region))], [state.clubs]);
  const tags = useMemo(() => [...new Set(state.clubs.flatMap(c => c.tags))], [state.clubs]);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    const tr = trustFilter ? Number(trustFilter) : null;

    return state.clubs.filter(c => {
      const hay = `${c.name} ${c.school} ${c.region} ${c.tags.join(' ')}`.toLowerCase();
      if (term && !hay.includes(term)) return false;
      if (regionFilter && c.region !== regionFilter) return false;
      if (tagFilter && !c.tags.includes(tagFilter)) return false;
      if (tr && c.trust < tr) return false;
      return true;
    });
  }, [state.clubs, query, regionFilter, tagFilter, trustFilter]);

  const selectedClub = state.clubs.find(c => c.id === selectedClubId) || null;

  const handlePropose = () => {
    if (!selectedClub) return;
    
    // Send alert to the club (in a real app, this would be a notification)
    toast({
      title: '알림 전송됨',
      description: `${selectedClub.name}에게 협업 제안 알림이 전송되었습니다.`
    });
    
    // Open email composition modal
    setProposalClub(selectedClub);
    setSelectedClubId(null);
    setShowProposalModal(true);
  };

  return (
    <div className="container py-4 animate-fade-in">
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="font-extrabold">동아리 탐색</div>
            <div className="text-sm text-muted-foreground mt-1.5">
              필터링으로 원하는 동아리를 찾아보세요
            </div>
          </div>
          <Badge variant="ghost">{filtered.length}개 동아리</Badge>
        </div>
        
        <div className="panel-body space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2.5 items-center justify-between">
            <div className="flex flex-wrap gap-2.5 items-center">
              <input
                type="text"
                className="glass-input w-48"
                placeholder="검색: 동아리/학교/분야"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="glass-input"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="">지역 전체</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                className="glass-input"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="">분야 전체</option>
                {tags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                className="glass-input"
                value={trustFilter}
                onChange={(e) => setTrustFilter(e.target.value)}
              >
                <option value="">신뢰 점수</option>
                <option value="80">80+만</option>
                <option value="70">70+만</option>
              </select>
            </div>
          </div>

          {/* Club List */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(club => (
              <ClubCard
                key={club.id}
                club={club}
                onClick={() => setSelectedClubId(club.id)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              조건에 맞는 동아리가 없습니다.
            </div>
          )}
        </div>
      </section>

      <ClubModal
        club={selectedClub}
        open={!!selectedClubId}
        onOpenChange={(open) => !open && setSelectedClubId(null)}
        onPropose={handlePropose}
      />

      <ProposalEmailModal
        open={showProposalModal}
        onOpenChange={setShowProposalModal}
        targetClub={proposalClub}
        senderName={user?.name}
        senderEmail={user?.email}
      />
    </div>
  );
}
