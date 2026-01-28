
'use client';

import { useState, useMemo, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollabCard } from '@/components/cards/CollabCard';
import { CollabModal } from '@/components/modals/CollabModal';
import { NewCollabModal } from '@/components/modals/NewCollabModal';
import { EditCollabModal } from '@/components/modals/EditCollabModal';
import { RatingModal } from '@/components/modals/RatingModal';
import { DemoState, Collab as CollabType, loadState, saveState, Club, Application } from '@/data/demoData';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default function CollabPage() {
    const { data: session } = useSession();
    const [state, setState] = useState<DemoState | null>(null);

    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('all');
    const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        setState(loadState());
    }, []);

    const updateState = (newState: DemoState) => {
        setState(newState);
        saveState(newState);
    };

    // Derived state
    const myClub = useMemo(() => {
        if (!session?.user || !state) return null;
        // Simple matching logic: find club by "leader name" matching user name or just pick first one for demo if not found
        // Or users can be linked to clubs. For this demo, let's assume the user IS the leader of 'PRAGMATISM' (c1) if name matches, or just fallback to c1 for testing if logged in.
        // Ideally we should have user.clubId.
        // Let's assume user.name matches leader name for strictness, or just default to 'PRAGMATISM' for demo purposes as requested ("logistical - gathered smth").

        // For specific user "justc/mor", maybe we can find a club?
        // Let's look for a club where formatted email matches or something. 
        // Fallback: If logged in, assume they are 'PRAGMATISM' (c1) for full demo capabilities unless they match another leader.
        return state.clubs.find(c => c.leader === session.user?.name) || state.clubs[0];
    }, [session, state]);

    const types = useMemo(() => state ? [...new Set(state.collabs.map(x => x.type))] : [], [state]);
    const regions = useMemo(() => state ? [...new Set(state.collabs.map(x => x.region))] : [], [state]);

    const filtered = useMemo(() => {
        if (!state) return [];
        const term = query.toLowerCase();
        return state.collabs.filter(p => {
            const hay = `${p.title} ${p.type} ${p.region}`.toLowerCase();
            if (term && !hay.includes(term)) return false;
            if (typeFilter !== 'all' && p.type !== typeFilter) return false;
            if (regionFilter !== 'all' && p.region !== regionFilter) return false;
            return true;
        });
    }, [state, query, typeFilter, regionFilter]);

    if (!state) return <div className="p-8">Loading...</div>;

    const selectedCollab = state.collabs.find(c => c.id === selectedCollabId) || null;
    const collabClub = selectedCollab ? state.clubs.find(c => c.id === selectedCollab.club_id) : undefined;
    const isOwnCollab = selectedCollab && myClub && selectedCollab.club_id === myClub.id;

    // Notifications
    const myNotifications = (() => {
        if (!myClub) return [];
        const applications = state.applications || [];
        const myCollabIds = state.collabs.filter(c => c.club_id === myClub.id).map(c => c.id);
        return applications.filter(app => myCollabIds.includes(app.collab_id) && app.status === 'pending');
    })();

    // Handlers
    const handleAddCollab = (data: Omit<CollabType, 'id'>) => {
        const newCollab = { ...data, id: uuidv4() };
        updateState({
            ...state,
            collabs: [newCollab, ...state.collabs]
        });
    };

    const handleUpdateCollab = (collabId: string, updates: Partial<CollabType>) => {
        updateState({
            ...state,
            collabs: state.collabs.map(c => c.id === collabId ? { ...c, ...updates } : c)
        });
        setShowEditModal(false);
        setSelectedCollabId(null);
    };

    const handleAddApplication = (app: Omit<Application, 'id'>) => {
        updateState({
            ...state,
            applications: [...state.applications, { ...app, id: uuidv4() }]
        });
        setSelectedCollabId(null);
    };

    const handleAddRating = (collab_id: string, rated_club_id: string, rating: number) => {
        updateState({
            ...state,
            ratings: [...state.ratings, { collab_id, rated_club_id, rating, rated_at: new Date().toISOString() }]
        });
    };

    const getApplicantClubs = (): Club[] => {
        if (!selectedCollab) return [];
        const applications = state.applications || [];
        const applicantIds = applications
            .filter(app => app.collab_id === selectedCollab.id && app.status === 'accepted')
            .map(app => app.applicant_club_id);
        return state.clubs.filter(c => applicantIds.includes(c.id));
    };


    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <div className="container py-8 animate-fade-in relative z-10">
                {/* New Header Layout matching Dashboard */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">협업 모집</h1>
                            <p className="text-muted-foreground text-sm">
                                모집 공고 → 지원/연락 → 프로젝트 룸 생성
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            {session?.user && myNotifications.length > 0 && (
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
                                                        <div key={app.id} className="p-2 rounded-lg bg-muted/50 text-sm">
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
                            <Button onClick={() => setShowNewModal(true)} className="rounded-full shadow-md font-semibold">
                                모집 올리기
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 pb-2">
                        <Input
                            className="w-full sm:w-[300px] h-10 bg-background"
                            placeholder="검색: 제목/유형/지역"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[120px] h-10 bg-background">
                                <SelectValue placeholder="유형 전체" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">유형 전체</SelectItem>
                                {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={regionFilter} onValueChange={setRegionFilter}>
                            <SelectTrigger className="w-[120px] h-10 bg-background">
                                <SelectValue placeholder="지역 전체" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">지역 전체</SelectItem>
                                {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <div className="ml-auto flex items-center text-sm text-muted-foreground">
                            결과 {filtered.length}개
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
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

                <CollabModal
                    collab={selectedCollab}
                    club={collabClub}
                    open={!!selectedCollabId && !showEditModal && !showRatingModal}
                    onOpenChange={(open) => !open && setSelectedCollabId(null)}
                    onApply={() => {
                        if (!myClub) {
                            alert('로그인이 필요하거나 동아리 정보가 없습니다.');
                            return;
                        }
                        // Check if already applied
                        const alreadyApplied = state.applications?.some(
                            app => app.collab_id === selectedCollab!.id && app.applicant_club_id === myClub.id
                        );
                        if (alreadyApplied) {
                            alert('이미 지원한 협업입니다.');
                            return;
                        }

                        handleAddApplication({
                            collab_id: selectedCollab!.id,
                            applicant_club_id: myClub.id,
                            applied_at: new Date().toISOString(),
                            status: 'pending',
                        });
                        alert('지원 완료');
                    }}
                    onCreateRoom={() => isOwnCollab ? setShowRatingModal(true) : alert('프로젝트 룸 생성 (Demo)')}
                    isOwnCollab={!!isOwnCollab}
                    onEdit={() => setShowEditModal(true)}
                />

                <NewCollabModal
                    open={showNewModal}
                    onOpenChange={setShowNewModal}
                    onSubmit={(data) => {
                        if (!myClub) return alert('동아리 정보가 없습니다.');
                        handleAddCollab({
                            club_id: myClub.id,
                            ...data,
                            budget: '협의',
                            status: 'open'
                        });
                        alert('등록 완료');
                    }}
                />

                {selectedCollab && (
                    <>
                        <EditCollabModal
                            collab={selectedCollab}
                            open={showEditModal}
                            onOpenChange={setShowEditModal}
                            onSubmit={(data) => handleUpdateCollab(selectedCollab.id, data)}
                        />

                        <RatingModal
                            collab={selectedCollab}
                            clubs={getApplicantClubs()}
                            open={showRatingModal}
                            onOpenChange={setShowRatingModal}
                            onSubmitRatings={(ratings) => {
                                ratings.forEach(r => handleAddRating(selectedCollab.id, r.clubId, r.rating));
                                setShowRatingModal(false);
                                setSelectedCollabId(null);
                                alert('평가 완료');
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
