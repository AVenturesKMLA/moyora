'use client';

import { useState, useMemo, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CollabCard } from '@/components/cards/CollabCard';
import { CollabModal } from '@/components/modals/CollabModal';
// import { NewCollabModal } from '@/components/modals/NewCollabModal';
import { EditCollabModal } from '@/components/modals/EditCollabModal';
import { RatingModal } from '@/components/modals/RatingModal';
import { DemoState, Collab as CollabType, loadState, saveState, Club, Application } from '@/data/demoData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, School } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Bell, Calendar as CalendarIcon, List as ListIcon, ChevronRight, Briefcase } from 'lucide-react';
import { ProjectListCard } from '@/components/cards/ProjectListCard';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default function CollabPage() {
    const { data: session } = useSession();
    const [state, setState] = useState<DemoState | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('all');
    const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
    // const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [myEvents, setMyEvents] = useState<any[]>([]);
    const [selectedEventForApplicants, setSelectedEventForApplicants] = useState<any | null>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [isFetchingApplicants, setIsFetchingApplicants] = useState(false);

    const [activeTab, setActiveTab] = useState('cards');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab) setActiveTab(tab);
        }
    }, []);

    useEffect(() => {
        const fetchCollabs = async () => {
            const demo = loadState();
            setState(demo);

            try {
                const res = await fetch('/api/collab');
                const data = await res.json();
                if (data.success && data.collabs) {
                    // Update state with real collabs prepended
                    setState(prev => {
                        if (!prev) return demo;

                        // Avoid duplicates if any, though unlikely since real have OID
                        const realIds = new Set(data.collabs.map((c: any) => c.id));
                        const uniqueDemoCollabs = demo.collabs.filter(c => !realIds.has(c.id));

                        return {
                            ...prev,
                            collabs: [...data.collabs, ...uniqueDemoCollabs]
                        };
                    });
                }
            } catch (err) {
                console.error('Failed to fetch real collabs:', err);
            }
        };

        const fetchMyEvents = async () => {
            if (!session?.user) return;
            try {
                const res = await fetch('/api/events/my-events');
                const data = await res.json();
                if (data.success) {
                    setMyEvents(data.events);
                }
            } catch (err) {
                console.error('Failed to fetch my events:', err);
            }
        };

        fetchCollabs();
        fetchMyEvents();
    }, [session]);

    const fetchApplicants = async (event: any) => {
        setSelectedEventForApplicants(event);
        setIsFetchingApplicants(true);
        try {
            const res = await fetch(`/api/collab/applicants?eventId=${event._id}&eventType=${event.eventType}`);
            const data = await res.json();
            if (data.success) {
                setApplicants(data.participants);
            }
        } catch (err) {
            console.error('Failed to fetch applicants:', err);
        } finally {
            setIsFetchingApplicants(false);
        }
    };

    const handleUpdateStatus = async (appId: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch(`/api/participate/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                // Update local state
                setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
                alert(`지원자가 ${status === 'approved' ? '승인' : '거절'}되었습니다.`);
            } else {
                alert(data.message || '상태 변경 중 오류가 발생했습니다.');
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('시스템 오류가 발생했습니다.');
        }
    };

    const updateState = (newState: DemoState) => {
        setState(newState);
        saveState(newState);
    };

    // Derived state
    const myClub = useMemo(() => {
        if (!session?.user || !state) return null;
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
                            <Button className="rounded-full shadow-md font-semibold" asChild>
                                <a href="/collab/new">모집 올리기</a>
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

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between md:justify-end mb-4">
                        <TabsList>
                            <TabsTrigger value="cards" className="flex gap-2">
                                <ListIcon className="w-4 h-4" /> 모집 공고
                            </TabsTrigger>
                            <TabsTrigger value="schedule" className="flex gap-2">
                                <CalendarIcon className="w-4 h-4" /> 일정
                            </TabsTrigger>
                            <TabsTrigger value="projects" className="flex gap-2">
                                <Briefcase className="w-4 h-4" /> 내 프로젝트
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="cards" className="animate-fade-in">
                        {/* Cards Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filtered.map(collab => {
                                const club = state.clubs.find(c => c.id === collab.club_id);
                                return (
                                    <CollabCard
                                        key={collab.id}
                                        collab={collab}
                                        club={club || (collab as any).virtualClub}
                                        onClick={() => setSelectedCollabId(collab.id)}
                                    />
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="animate-fade-in">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <Card className="p-4 border-border/60 shadow-sm inline-block">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        className="rounded-md border"
                                        modifiers={{
                                            hasEvent: (date) => state?.collabs.some(c => {
                                                const d = new Date(c.dateStart);
                                                return d.getDate() === date.getDate() &&
                                                    d.getMonth() === date.getMonth() &&
                                                    d.getFullYear() === date.getFullYear();
                                            }) || false
                                        }}
                                        modifiersClassNames={{
                                            hasEvent: "font-bold text-primary underline decoration-primary decoration-2 underline-offset-4"
                                        }}
                                    />
                                </Card>
                            </div>

                            <div className="flex-1 space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    {selectedDate ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 일정` : '일정 선택'}
                                </h3>

                                {(() => {
                                    if (!selectedDate || !state) return <div>날짜를 선택해주세요.</div>;
                                    const dailyEvents = state.collabs.filter(c => {
                                        const d = new Date(c.dateStart);
                                        return d.getDate() === selectedDate.getDate() &&
                                            d.getMonth() === selectedDate.getMonth() &&
                                            d.getFullYear() === selectedDate.getFullYear();
                                    });

                                    if (dailyEvents.length === 0) {
                                        return (
                                            <div className="text-center py-12 border rounded-xl bg-muted/20 text-muted-foreground">
                                                해당 날짜에 등록된 일정이 없습니다.
                                            </div>
                                        );
                                    }

                                    return dailyEvents.map(collab => {
                                        const club = state.clubs.find(c => c.id === collab.club_id);
                                        return (
                                            <div
                                                key={collab.id}
                                                className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-card hover:border-primary/50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedCollabId(collab.id)}
                                            >
                                                <div className="flex-shrink-0 w-full sm:w-24 flex flex-col justify-center items-center bg-muted/20 rounded-lg p-2">
                                                    <div className="text-sm font-bold text-muted-foreground">{collab.time || 'All Day'}</div>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="text-xs text-primary font-semibold">{collab.type}</div>
                                                    <h3 className="font-bold text-lg">{collab.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(club || (collab as any).virtualClub)?.name || '알 수 없음'} · {collab.region}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm" className="hidden sm:flex self-center">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="projects" className="animate-fade-in">
                        <div className="space-y-4">
                            {myEvents.length > 0 ? (
                                myEvents.map((event) => (
                                    <ProjectListCard
                                        key={event._id}
                                        project={{
                                            id: event._id,
                                            title: event.eventName,
                                            team: [session?.user?.name || '나'],
                                            description: event.description,
                                            progress: 0,
                                            status: 'in_progress',
                                            dueDate: new Date(event.eventDate).toLocaleDateString(),
                                            type: event.eventType === 'contest' ? '통합 대회' : event.eventType === 'forum' ? '연합 포럼' : '공동 연구'
                                        }}
                                        onEnterRoom={() => fetchApplicants(event)}
                                        buttonLabel="지원 현황 보기"
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 border rounded-xl bg-muted/20 text-muted-foreground">
                                    내가 등록한 프로젝트가 없습니다.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <CollabModal
                    collab={selectedCollab}
                    club={collabClub || (selectedCollab as any)?.virtualClub}
                    open={!!selectedCollabId && !showEditModal && !showRatingModal && !selectedEventForApplicants}
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
                    onCreateRoom={() => isOwnCollab ? setShowRatingModal(true) : alert('프로젝트 룸 입장 (Demo)')}
                    isOwnCollab={!!isOwnCollab}
                    onEdit={() => setShowEditModal(true)}
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

                {/* Applicant List Modal */}
                <Dialog open={!!selectedEventForApplicants} onOpenChange={(open) => !open && setSelectedEventForApplicants(null)}>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                지원자 현황: {selectedEventForApplicants?.eventName}
                            </DialogTitle>
                        </DialogHeader>

                        {isFetchingApplicants ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">지원자 정보를 불러오는 중...</p>
                            </div>
                        ) : applicants.length > 0 ? (
                            <div className="space-y-4 mt-4">
                                {applicants.map((app) => (
                                    <div key={app._id} className="p-4 border rounded-xl space-y-3 bg-muted/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-lg">{app.userName}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                    <School className="w-3.5 h-3.5" />
                                                    {app.userSchool} {app.clubName && `· ${app.clubName}`}
                                                </div>
                                            </div>
                                            <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                {app.status === 'approved' ? '승인됨' : app.status === 'rejected' ? '거절됨' : '대기중'}
                                            </Badge>
                                        </div>

                                        {app.message && (
                                            <div className="bg-background p-3 rounded-lg text-sm border border-border/50">
                                                <div className="text-xs font-semibold text-muted-foreground mb-1">지원 메시지</div>
                                                {app.message}
                                            </div>
                                        )}

                                        <div className="flex gap-2 justify-end pt-1">
                                            {app.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => handleUpdateStatus(app._id, 'approved')}
                                                    >
                                                        승인
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive border-destructive/20 hover:bg-destructive/5"
                                                        onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                    >
                                                        거절
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`mailto:${app.userEmail}`}>연락하기</a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                아직 지원자가 없습니다.
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
