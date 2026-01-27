'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy, MessageSquare, Microscope, ChevronRight, PlusCircle, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";

const Dashboard3D = dynamic(() => import('@/components/canvas/Dashboard3D'), { ssr: false });
const FloatingShapes = dynamic(() => import('@/components/canvas/FloatingShapes'), { ssr: false });

interface Event {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
}

interface Club {
    _id: string;
    clubName: string;
    schoolName: string;
    clubTheme: string;
    role: 'chief' | 'member';
}

interface Notification {
    _id: string;
    eventName: string;
    eventDate: string;
    daysUntil: number;
    isRead: boolean;
}

interface Participation {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface DashboardData {
    user: {
        name: string;
        email: string;
        schoolName: string;
        role: string;
    };
    clubs: Club[];
    hostedEvents: Event[];
    participations: Participation[];
    notifications: Notification[];
    stats: {
        clubCount: number;
        hostedEventCount: number;
        participationCount: number;
        pendingApprovalCount: number;
        unreadNotificationCount: number;
    };
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'pending': return 'secondary'; // Yellow-ish usually manually handled, but secondary is grey. 
            case 'approved': return 'default'; // Green/Blue
            case 'rejected': return 'destructive'; // Red
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return '승인 대기';
            case 'approved': return '참가 확정';
            case 'rejected': return '거절됨';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        }).format(date);
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />

            {/* 3D Elements container - kept subtle */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
                <FloatingShapes />
            </div>

            <main className="container relative z-10 mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-10">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

                    {/* 1. Welcome Card (Span 4 on mobile, 2 on lg) */}
                    <Card className="col-span-1 overflow-hidden border-none bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg md:col-span-2 lg:col-span-3">
                        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                            <div className="relative z-10 space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                        안녕하세요, {session?.user?.name || '부장'}님!
                                    </h1>
                                    <p className="text-blue-100 sm:text-lg max-w-[500px]">
                                        오늘도 {dashboardData?.user?.schoolName || '우리 학교'} 동아리와 함께 성장하는 하루 보내세요.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/schedule">
                                        <Button variant="secondary" className="rounded-full px-6 font-semibold shadow-md active:scale-95 transition-transform">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            전체 일정 확인
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* 3D Visual Positioned Absolute */}
                            <div className="absolute -bottom-8 -right-8 h-48 w-48 opacity-90 sm:h-64 sm:w-64 md:-right-12 md:bottom-[-20%]">
                                <Dashboard3D />
                            </div>
                        </div>
                    </Card>

                    {/* 2. Stats Card (Span 1) */}
                    <Card className="col-span-1 flex flex-col justify-center border-border/40 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                내 활동 현황
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">소속 동아리</p>
                                    <p className="text-2xl font-bold text-foreground">{dashboardData?.stats.clubCount || 0}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">참여 이벤트</p>
                                    <p className="text-2xl font-bold text-foreground">{dashboardData?.stats.participationCount || 0}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center dark:bg-green-900/30 dark:text-green-400">
                                    <Trophy className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Participated Events (Span 2) */}
                    <Card className="col-span-1 md:col-span-2 border-border/40 shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">참여 예정 이벤트</CardTitle>
                            <Link href="/schedule" className="text-xs text-muted-foreground hover:text-primary flex items-center">
                                더보기 <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {dashboardData?.participations && dashboardData.participations.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.participations.slice(0, 3).map((p) => {
                                        const badgeVariant = getStatusBadgeVariant(p.status);

                                        // Custom colors for non-standard badge variants
                                        let statusColorClass = "";
                                        if (p.status === 'pending') statusColorClass = "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
                                        else if (p.status === 'approved') statusColorClass = "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400";
                                        else if (p.status === 'rejected') statusColorClass = "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400";

                                        return (
                                            <div key={p._id} className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold">{p.eventName}</span>
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                            {p.eventType === 'contest' ? '대회' : p.eventType === 'forum' ? '포럼' : '연구'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{p.eventDate ? formatDate(p.eventDate) : '-'}</span>
                                                    </div>
                                                </div>
                                                <Badge className={cn("text-[10px] sm:text-xs", statusColorClass)} variant={badgeVariant === 'default' ? 'default' : 'secondary'}>
                                                    {getStatusLabel(p.status)}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <p className="text-sm">예정된 일정이 없습니다.</p>
                                    <Link href="/events/contest" className="mt-2 text-xs text-primary underline">
                                        새로운 활동 찾아보기
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 4. My Functions / Quick Actions (Span 1) - Vertical Layout */}
                    <Card className="col-span-1 row-span-2 border-border/40 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">바로가기</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <QuickActionLink
                                href="/club/register"
                                icon={<PlusCircle className="h-5 w-5" />}
                                label="동아리 등록"
                                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            />
                            <QuickActionLink
                                href="/events/contest/new"
                                icon={<Trophy className="h-5 w-5" />}
                                label="대회 개최"
                                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            />
                            <QuickActionLink
                                href="/events/forum/new"
                                icon={<MessageSquare className="h-5 w-5" />}
                                label="포럼 개설"
                                colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            />
                            <QuickActionLink
                                href="/events/co-research/new"
                                icon={<Microscope className="h-5 w-5" />}
                                label="공동연구 등록"
                                colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            />
                        </CardContent>
                    </Card>

                    {/* 5. My Hosted Events (Span 1) */}
                    <Card className="col-span-1 border-border/40 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold">주최한 이벤트</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dashboardData?.hostedEvents && dashboardData.hostedEvents.length > 0 ? (
                                <ul className="space-y-3">
                                    {dashboardData.hostedEvents.slice(0, 3).map((e) => (
                                        <li key={e._id} className="flex items-center justify-between text-sm">
                                            <span className="truncate font-medium">{e.eventName}</span>
                                            <span className="text-xs text-muted-foreground shrink-0">{formatDateShort(e.eventDate)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground py-4 text-center">주최한 내역이 없습니다.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 6. My Clubs (Span 1) */}
                    <Card className="col-span-1 border-border/40 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold">내 동아리</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dashboardData?.clubs && dashboardData.clubs.length > 0 ? (
                                <ul className="space-y-3">
                                    {dashboardData.clubs.map((c) => (
                                        <li key={c._id} className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-base">🏫</div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{c.clubName}</span>
                                                <span className="text-xs text-muted-foreground">{c.role === 'chief' ? '대표' : '부원'}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground py-4 text-center">가입된 동아리가 없습니다.</p>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div >
    );
}

function QuickActionLink({ href, icon, label, colorClass }: { href: string, icon: React.ReactNode, label: string, colorClass: string }) {
    return (
        <Link href={href}>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent hover:text-accent-foreground">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", colorClass)}>
                    {icon}
                </div>
                <span className="text-sm font-medium">{label}</span>
            </div>
        </Link>
    )
}

function formatDateShort(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
    });
}

