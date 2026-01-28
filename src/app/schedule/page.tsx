'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area" // Assuming ScrollArea exists or I will use div with overflow
import { Calendar, MapPin, Phone, User, Trophy, MessageSquare, Microscope, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

// 3D components removed
interface Event {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventId: string;
    eventName: string;
    eventDate: string;
    eventPlace: string;
    description?: string;
}

interface EventDetail {
    _id: string;
    contestName?: string;
    forumName?: string;
    researchName?: string;
    contestType?: string;
    forumType?: string;
    researchType?: string;
    contestDate?: string;
    forumDate?: string;
    researchDate?: string;
    contestPlace?: string;
    forumPlace?: string;
    researchPlace?: string;
    description?: string;
    notices?: string;
    hostName?: string;
    hostPhone?: string;
    enteringClubs?: string[];
    forumClubs?: string[];
    joiningClubs?: string[];
}

export default function SchedulePage() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    // Dialog State
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [isParticipating, setIsParticipating] = useState(false);
    const [participationMessage, setParticipationMessage] = useState('');
    const [hasParticipated, setHasParticipated] = useState(false);
    const [participationStatus, setParticipationStatus] = useState<string | null>(null);
    const [showTemporarySuccess, setShowTemporarySuccess] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const url = filter === 'all' ? '/api/schedule' : `/api/schedule?type=${filter}`;
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data.events || []);
                }
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [filter]);

    const handleEventClick = async (event: Event) => {
        setSelectedEvent(event);
        setIsDialogOpen(true);
        setIsDetailLoading(true);
        setEventDetail(null);
        setHasParticipated(false);
        setParticipationStatus(null);
        setShowTemporarySuccess(false);

        try {
            // Fetch event details
            const response = await fetch(`/api/events/${event.eventType}/${event.eventId}`);
            if (response.ok) {
                const data = await response.json();
                setEventDetail(data.event);
            }

            // Check if user has already participated
            if (session?.user) {
                const participationRes = await fetch(`/api/participate?eventType=${event.eventType}&eventId=${event.eventId}`);
                if (participationRes.ok) {
                    const participationData = await participationRes.json();
                    setHasParticipated(participationData.hasParticipated);
                    setParticipationStatus(participationData.status);
                }
            }
        } catch (error) {
            console.error('Failed to fetch event details:', error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => {
            setSelectedEvent(null);
            setEventDetail(null);
            setParticipationMessage('');
        }, 300);
    };

    const handleParticipate = async () => {
        if (!session?.user || !selectedEvent) return;

        setIsParticipating(true);
        try {
            const response = await fetch('/api/participate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: selectedEvent.eventType,
                    eventId: selectedEvent.eventId,
                    message: participationMessage,
                }),
            });

            if (response.ok) {
                setHasParticipated(true);
                setParticipationStatus('pending');
                setParticipationMessage('');
                setShowTemporarySuccess(true);
                setTimeout(() => setShowTemporarySuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to participate:', error);
        } finally {
            setIsParticipating(false);
        }
    };

    const getEventTypeInfo = (type: string) => {
        switch (type) {
            case 'contest': return { label: '대회', color: 'text-blue-500 bg-blue-500/10', icon: <Trophy className="h-4 w-4" /> };
            case 'forum': return { label: '포럼', color: 'text-green-500 bg-green-500/10', icon: <MessageSquare className="h-4 w-4" /> };
            case 'co-research': return { label: '공동연구', color: 'text-purple-500 bg-purple-500/10', icon: <Microscope className="h-4 w-4" /> };
            default: return { label: type, color: 'text-gray-500', icon: null };
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(date);
    };

    const getDaysUntil = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '내일';
        if (diffDays < 0) return '종료됨';
        return `D-${diffDays}`;
    };

    const getStatusText = (status: string | null) => {
        switch (status) {
            case 'pending': return '승인 대기 중';
            case 'approved': return '승인 완료';
            case 'rejected': return '참가 거절됨';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col">
            <NavBar />

            <main className="flex-1 container py-12 relative z-10 space-y-12">
                <div className="text-center space-y-4">
                    {/* 3D Schedule removed */}
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">📅 일정 탐색</h1>
                    <p className="text-muted-foreground mx-auto max-w-[600px]">
                        전국의 모든 동아리 이벤트를 한눈에 확인하세요.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center rounded-full border bg-background/50 p-1 backdrop-blur-sm shadow-sm space-x-1">
                        {['all', 'contest', 'forum', 'co-research'].map((f) => {
                            const info = f !== 'all' ? getEventTypeInfo(f) : { label: '전체' };
                            return (
                                <Button
                                    key={f}
                                    variant={filter === f ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "rounded-full px-4 transition-all",
                                        filter === f ? "bg-secondary text-secondary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {info.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => {
                            const typeInfo = getEventTypeInfo(event.eventType);
                            const daysUntil = getDaysUntil(event.eventDate);
                            const isUrgent = daysUntil === '오늘' || daysUntil === '내일';

                            return (
                                <Card
                                    key={event._id}
                                    className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/50"
                                    onClick={() => handleEventClick(event)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className={cn("gap-1 font-normal", typeInfo.color)}>
                                                {typeInfo.icon}
                                                {typeInfo.label}
                                            </Badge>
                                            <Badge variant={isUrgent ? "destructive" : "secondary"} className="font-semibold">
                                                {daysUntil}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{event.eventName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(event.eventDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.eventPlace}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        <div className="w-full text-right text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            자세히 보기 →
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border rounded-2xl bg-muted/10 border-dashed">
                        <div className="text-4xl">📂</div>
                        <div>
                            <h2 className="text-xl font-semibold">등록된 일정이 없습니다</h2>
                            <p className="text-muted-foreground mt-1">선택한 카테고리에 해당하는 이벤트가 아직 없습니다.</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">대시보드로 돌아가기</Link>
                        </Button>
                    </div>
                )}
            </main>

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className={cn("gap-1", getEventTypeInfo(selectedEvent.eventType).color)}>
                                        {getEventTypeInfo(selectedEvent.eventType).icon}
                                        {getEventTypeInfo(selectedEvent.eventType).label}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-2xl">{selectedEvent.eventName}</DialogTitle>
                            </DialogHeader>

                            {isDetailLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : eventDetail ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 p-3 rounded-lg bg-muted/40">
                                            <div className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1"><Calendar className="h-3 w-3" /> 일시</div>
                                            <div className="font-semibold">{formatDate(selectedEvent.eventDate)}</div>
                                        </div>
                                        <div className="space-y-1 p-3 rounded-lg bg-muted/40">
                                            <div className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1"><MapPin className="h-3 w-3" /> 장소</div>
                                            <div className="font-semibold">{selectedEvent.eventPlace}</div>
                                        </div>
                                        <div className="space-y-1 p-3 rounded-lg bg-muted/40">
                                            <div className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1"><User className="h-3 w-3" /> 주최</div>
                                            <div className="font-semibold">{eventDetail.hostName || '-'}</div>
                                        </div>
                                        <div className="space-y-1 p-3 rounded-lg bg-muted/40">
                                            <div className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1"><Phone className="h-3 w-3" /> 연락처</div>
                                            <div className="font-semibold">{eventDetail.hostPhone || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-semibold">상세 내용</h3>
                                        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                            {eventDetail.description || '상세 내용이 없습니다.'}
                                        </div>
                                    </div>

                                    {eventDetail.notices && (
                                        <div className="space-y-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" /> 공지사항
                                            </h3>
                                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {eventDetail.notices}
                                            </div>
                                        </div>
                                    )}

                                    <DialogFooter className="flex-col sm:flex-col gap-3 sm:space-x-0">
                                        {!session ? (
                                            <Button asChild className="w-full h-12 text-lg">
                                                <Link href="/login">로그인하고 참가하기</Link>
                                            </Button>
                                        ) : hasParticipated ? (
                                            <div className={cn(
                                                "w-full p-4 rounded-lg text-center font-bold text-lg flex items-center justify-center gap-2",
                                                participationStatus === 'approved' ? "bg-green-500/10 text-green-600" :
                                                    participationStatus === 'rejected' ? "bg-red-500/10 text-red-600" :
                                                        "bg-orange-500/10 text-orange-600"
                                            )}>
                                                {showTemporarySuccess ? <><CheckCircle2 className="h-5 w-5" /> 신청 완료!</> : getStatusText(participationStatus)}
                                            </div>
                                        ) : (
                                            <div className="space-y-3 w-full">
                                                <Textarea
                                                    placeholder="참가 신청 메시지를 남겨보세요 (선택사항)"
                                                    value={participationMessage}
                                                    onChange={(e) => setParticipationMessage(e.target.value)}
                                                    className="resize-none"
                                                />
                                                <Button
                                                    onClick={handleParticipate}
                                                    disabled={isParticipating}
                                                    className="w-full h-12 text-lg"
                                                >
                                                    {isParticipating ? "신청 중..." : "참가 신청하기"}
                                                </Button>
                                            </div>
                                        )}
                                    </DialogFooter>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">정보를 불러올 수 없습니다.</div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
