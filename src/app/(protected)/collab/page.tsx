'use client';

import { useState, useMemo, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CollabCard } from '@/components/cards/CollabCard';
// import { NewCollabModal } from '@/components/modals/NewCollabModal';
import { DemoState, Collab as CollabType, loadState, saveState, Club, Application } from '@/data/demoData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, School } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Bell, Calendar as CalendarIcon, List as ListIcon, ChevronRight, Briefcase } from 'lucide-react';
import { ProjectListCard } from '@/components/cards/ProjectListCard';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

const CollabModal = dynamic(() => import('@/components/modals/CollabModal').then((mod) => mod.CollabModal));
const EditCollabModal = dynamic(() => import('@/components/modals/EditCollabModal').then((mod) => mod.EditCollabModal));
const RatingModal = dynamic(() => import('@/components/modals/RatingModal').then((mod) => mod.RatingModal));
const Calendar = dynamic(() => import('@/components/ui/calendar').then((mod) => mod.Calendar));

const createId = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

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
        const newCollab = { ...data, id: createId() };
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
            applications: [...state.applications, { ...app, id: createId() }]
        });
        setSelectedCollabId(null);
    };

    const handleAddRating = async (collab_id: string, ratings: { clubId: string; rating: number }[]) => {
        try {
            const res = await fetch('/api/club/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collabId: collab_id, ratings }),
            });
            const data = await res.json();
            if (data.success) {
                // Update local state just for UI responsiveness
                const newRatings = ratings.map(r => ({ collab_id, rated_club_id: r.clubId, rating: r.rating, rated_at: new Date().toISOString() }));
                updateState({
                    ...state,
                    ratings: [...state.ratings, ...newRatings]
                });
            } else {
                alert(data.message || '평가 제출 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Failed to submit ratings:', error);
            alert('시스템 오류가 발생했습니다.');
        }
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
                        {(() => {
                            const today = selectedDate || new Date();
                            const year = today.getFullYear();
                            const month = today.getMonth();
                            const firstDay = new Date(year, month, 1).getDay();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
                            const TYPE_COLORS: Record<string, string> = {
                                '공동연구': 'bg-blue-500',
                                '포럼': 'bg-green-500',
                                '대회': 'bg-orange-500',
                            };

                            const eventsByDate = (state?.collabs || []).reduce<Record<number, typeof state.collabs>>((acc, c) => {
                                const d = new Date(c.dateStart);
                                if (d.getMonth() === month && d.getFullYear() === year) {
                                    const day = d.getDate();
                                    acc[day] = acc[day] ? [...acc[day], c] : [c];
                                }
                                return acc;
                            }, {});

                            const selectedDay = selectedDate && selectedDate.getMonth() === month && selectedDate.getFullYear() === year
                                ? selectedDate.getDate() : null;

                            const prevMonth = () => {
                                const d = new Date(year, month - 1, 1);
                                setSelectedDate(d);
                            };
                            const nextMonth = () => {
                                const d = new Date(year, month + 1, 1);
                                setSelectedDate(d);
                            };

                            const dailyEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

                            return (
                                <div className="flex flex-col xl:flex-row gap-6">
                                    {/* Calendar Grid */}
                                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden min-w-[320px] max-w-[420px] w-full xl:w-auto">
                                        {/* Month Nav */}
                                        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
                                            <button
                                                onClick={prevMonth}
                                                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                            >
                                                ‹
                                            </button>
                                            <h3 className="font-bold text-base">
                                                {year}년 {month + 1}월
                                            </h3>
                                            <button
                                                onClick={nextMonth}
                                                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                            >
                                                ›
                                            </button>
                                        </div>

                                        {/* Day Headers */}
                                        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                                            {DAYS.map((d, i) => (
                                                <div
                                                    key={d}
                                                    className={`text-center text-xs font-semibold pb-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'}`}
                                                >
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Day Cells */}
                                        <div className="grid grid-cols-7 gap-px px-3 pb-3">
                                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                                const day = i + 1;
                                                const hasEvents = !!eventsByDate[day];
                                                const isSelected = day === selectedDay;
                                                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                                                const dayOfWeek = (firstDay + i) % 7;
                                                return (
                                                    <button
                                                        key={day}
                                                        onClick={() => setSelectedDate(new Date(year, month, day))}
                                                        className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 h-11 rounded-lg text-sm font-medium transition-all
                                                            ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : isToday ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
                                                            ${dayOfWeek === 0 && !isSelected ? 'text-red-500' : ''}
                                                            ${dayOfWeek === 6 && !isSelected ? 'text-blue-500' : ''}
                                                        `}
                                                    >
                                                        {day}
                                                        {hasEvents && (
                                                            <div className="flex gap-0.5 mt-0.5">
                                                                {(eventsByDate[day] || []).slice(0, 3).map((ev, idx) => {
                                                                    const color = TYPE_COLORS[ev.type] || 'bg-violet-500';
                                                                    return <span key={idx} className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white/80' : color}`} />;
                                                                })}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Legend */}
                                        <div className="flex items-center gap-4 px-5 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
                                            {Object.entries(TYPE_COLORS).map(([label, color]) => (
                                                <div key={label} className="flex items-center gap-1.5">
                                                    <span className={`h-2 w-2 rounded-full ${color}`} />
                                                    {label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Event List Panel */}
                                    <div className="flex-1 space-y-3">
                                        <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                            {selectedDate
                                                ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`
                                                : '날짜를 선택하세요'}
                                        </h3>

                                        {dailyEvents.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-sm">
                                                <CalendarIcon className="w-8 h-8 mb-2 opacity-30" />
                                                {selectedDate ? '이 날에는 등록된 일정이 없습니다.' : '왼쪽 캘린더에서 날짜를 선택하세요.'}
                                            </div>
                                        ) : dailyEvents.map(collab => {
                                            const club = state?.clubs.find(c => c.id === collab.club_id);
                                            const dotColor = TYPE_COLORS[collab.type] || 'bg-violet-500';
                                            return (
                                                <div
                                                    key={collab.id}
                                                    onClick={() => setSelectedCollabId(collab.id)}
                                                    className="group flex gap-4 p-4 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                                                >
                                                    <div className="flex flex-col items-center gap-1 pt-0.5">
                                                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                                                        <div className="w-px flex-1 bg-border" />
                                                    </div>
                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">{collab.type}</span>
                                                            {collab.time && <span className="text-xs text-muted-foreground">{collab.time}</span>}
                                                        </div>
                                                        <h4 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{collab.title}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(club || (collab as any).virtualClub)?.name || '알 수 없음'} · {collab.region}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground self-center shrink-0 group-hover:text-primary transition-colors" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
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
                            onSubmitRatings={async (ratings) => {
                                await handleAddRating(selectedCollab.id, ratings);
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
