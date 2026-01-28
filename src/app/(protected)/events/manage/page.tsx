'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '@/components/NavBar';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "../../../../components/ui/separator"
import { Calendar, MapPin, Users, Check, X, Clock, AlertCircle, ArrowLeft } from "lucide-react"

// 3D Components removed

interface Event {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
    participantCount: number;
}

interface Participant {
    _id: string;
    userName: string;
    userEmail: string;
    userSchool: string;
    clubName: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function EventManagePage() {
    const { data: session, status } = useSession();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchMyEvents();
        }
    }, [status]);

    const fetchMyEvents = async () => {
        try {
            const res = await fetch('/api/events/my-events');
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = useCallback(async (event: Event) => {
        setLoadingParticipants(true);
        setSelectedEvent(event);
        try {
            const res = await fetch(`/api/events/${event.eventType}/${event._id}/participants`);
            const data = await res.json();
            if (data.success) {
                setParticipants(data.participants);
            }
        } catch (error) {
            console.error('Failed to fetch participants:', error);
        } finally {
            setLoadingParticipants(false);
        }
    }, []);

    const updateParticipantStatus = async (participantId: string, newStatus: 'approved' | 'rejected') => {
        setUpdating(participantId);
        try {
            const res = await fetch(`/api/participate/${participantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setParticipants((prev) =>
                    prev.map((p) =>
                        p._id === participantId ? { ...p, status: newStatus } : p
                    )
                );
                // Update event participant count display
                if (selectedEvent) {
                    fetchMyEvents();
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'contest': return '대회';
            case 'forum': return '포럼';
            case 'co-research': return '공동연구';
            default: return type;
        }
    };

    const getEventTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'contest': return 'default'; // blue-ish usually
            case 'forum': return 'destructive'; // red-ish? or maybe secondary
            case 'co-research': return 'secondary';
            default: return 'outline';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-500 border-yellow-500 bg-yellow-500/10">대기중</Badge>;
            case 'approved':
                return <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">승인됨</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="text-red-500 border-red-500 bg-red-500/10">거절됨</Badge>;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredEvents = filter === 'all'
        ? events
        : events.filter((e) => e.eventType === filter);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar />

                <div className="flex items-center gap-4 mb-2">
                    <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                        <ArrowLeft className="h-4 w-4" /> 대시보드로 돌아가기
                    </Link>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">이벤트 관리</h1>
            </nav>

            <div className="flex-1 container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 items-start h-[calc(100vh-180px)]">

                {/* Sidebar: Events List */}
                <Card className="lg:col-span-4 h-full flex flex-col border-border/60 bg-card/80 backdrop-blur-sm shadow-md overflow-hidden">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">내 이벤트</CardTitle>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue placeholder="필터" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체</SelectItem>
                                    <SelectItem value="contest">대회</SelectItem>
                                    <SelectItem value="forum">포럼</SelectItem>
                                    <SelectItem value="co-research">공동연구</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-3">
                            {/* Manage3D removed */}


                            {filteredEvents.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    등록한 이벤트가 없습니다
                                </div>
                            ) : (
                                filteredEvents.map((event) => (
                                    <div
                                        key={event._id}
                                        className={`
                                            p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md
                                            ${selectedEvent?._id === event._id
                                                ? 'bg-primary/5 border-primary shadow-sm'
                                                : 'bg-card border-border hover:bg-accent/50'}
                                        `}
                                        onClick={() => fetchParticipants(event)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={event.eventType === 'contest' ? 'default' : event.eventType === 'forum' ? 'secondary' : 'outline'}>
                                                {getEventTypeLabel(event.eventType)}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{formatDate(event.eventDate)}</span>
                                        </div>
                                        <h3 className={`font-semibold text-sm mb-1 ${selectedEvent?._id === event._id ? 'text-primary' : ''}`}>
                                            {event.eventName}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            <span>{event.participantCount}명 참가 신청</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Main Panel: Participants */}
                <Card className="lg:col-span-8 h-full flex flex-col border-border/60 bg-card/80 backdrop-blur-sm shadow-md overflow-hidden">
                    {!selectedEvent ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                            <div className="bg-accent/50 p-6 rounded-full mb-4">
                                <AlertCircle className="h-12 w-12 opacity-50" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">이벤트를 선택하세요</h3>
                            <p className="text-sm">왼쪽 목록에서 이벤트를 선택하여 참가자 현황을 확인하고 관리하세요.</p>
                        </div>
                    ) : loadingParticipants ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
                            <CardHeader className="border-b bg-muted/20">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl">{selectedEvent.eventName}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-3 w-3" /> {formatDate(selectedEvent.eventDate)}
                                            <span className="text-border">|</span>
                                            <MapPin className="h-3 w-3" /> {selectedEvent.eventPlace}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2 text-sm">
                                        <div className="px-3 py-1 rounded-full bg-background border flex flex-col items-center min-w-[70px]">
                                            <span className="text-xs text-muted-foreground">전체</span>
                                            <span className="font-bold">{participants.length}</span>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex flex-col items-center min-w-[70px]">
                                            <span className="text-xs text-yellow-600 dark:text-yellow-400">대기</span>
                                            <span className="font-bold text-yellow-600 dark:text-yellow-400">{participants.filter((p) => p.status === 'pending').length}</span>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex flex-col items-center min-w-[70px]">
                                            <span className="text-xs text-green-600 dark:text-green-400">승인</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">{participants.filter((p) => p.status === 'approved').length}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="flex-1 overflow-auto">
                                {participants.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                        <Users className="h-12 w-12 opacity-20 mb-4" />
                                        <p>아직 참가 신청이 없습니다</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>신청자</TableHead>
                                                <TableHead>소속</TableHead>
                                                <TableHead className="hidden md:table-cell">메시지</TableHead>
                                                <TableHead>상태</TableHead>
                                                <TableHead className="text-right">관리</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {participants.map((participant) => (
                                                <TableRow key={participant._id}>
                                                    <TableCell>
                                                        <div className="font-medium">{participant.userName}</div>
                                                        <div className="text-xs text-muted-foreground">{participant.userEmail}</div>
                                                        <div className="text-xs text-muted-foreground md:hidden mt-1">{formatDate(participant.createdAt)}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{participant.userSchool}</div>
                                                        {participant.clubName && <Badge variant="secondary" className="mt-1 text-[10px] h-5">{participant.clubName}</Badge>}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell max-w-[200px]">
                                                        {participant.message ? (
                                                            <span title={participant.message} className="text-sm text-muted-foreground line-clamp-2">
                                                                {participant.message}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">메시지 없음</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(participant.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {participant.status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200"
                                                                        onClick={() => updateParticipantStatus(participant._id, 'approved')}
                                                                        disabled={updating === participant._id}
                                                                        title="승인"
                                                                    >
                                                                        {updating === participant._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Check className="h-4 w-4" />}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200"
                                                                        onClick={() => updateParticipantStatus(participant._id, 'rejected')}
                                                                        disabled={updating === participant._id}
                                                                        title="거절"
                                                                    >
                                                                        {updating === participant._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <X className="h-4 w-4" />}
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {participant.status === 'approved' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-red-600"
                                                                    onClick={() => updateParticipantStatus(participant._id, 'rejected')}
                                                                    disabled={updating === participant._id}
                                                                >
                                                                    취소
                                                                </Button>
                                                            )}
                                                            {participant.status === 'rejected' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-green-600"
                                                                    onClick={() => updateParticipantStatus(participant._id, 'approved')}
                                                                    disabled={updating === participant._id}
                                                                >
                                                                    재승인
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div >
    );
}
