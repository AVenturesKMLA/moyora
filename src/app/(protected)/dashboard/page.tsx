'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar, Users, Trophy, ChevronRight, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Interfaces ---
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

    if (status === 'loading' || isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <main className="container mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12 space-y-12">

                {/* 1. Header Section */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        동아리 활동의 새로운 차원
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {session?.user?.name}님, 오늘도 모여라에서 성장을 경험하세요.
                    </p>
                </div>

                {/* 2. Stats Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatsCard
                        title="모여라 회원"
                        value="128"
                        subtext="명이 함께하고 있어요"
                        icon={<Users className="h-6 w-6 text-blue-500" />}
                    />
                    <StatsCard
                        title="함께하는 동아리"
                        value={dashboardData?.stats.clubCount?.toString() || "6"}
                        subtext="개의 동아리가 등록됨"
                        icon={<Star className="h-6 w-6 text-yellow-500" />}
                    />
                    <StatsCard
                        title="성사된 교류"
                        value={dashboardData?.stats.participationCount?.toString() || "0"}
                        subtext="건의 협업이 완료됨"
                        icon={<Trophy className="h-6 w-6 text-green-500" />}
                    />
                </div>

                {/* 3. Ongoing Projects (Horizontal Scroll) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">진행중</h2>
                        <Button variant="ghost" className="text-sm font-medium" asChild>
                            <Link href="/projects">전체 보기 <ChevronRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-4 p-4">
                            {/* Mock Data for visual matching */}
                            <ProjectCard
                                title="전국 BM 케이스 스프린트"
                                team="PRAGMATISM, Quant Forge"
                                progress={48}
                                status="진행 48%"
                            />
                            <ProjectCard
                                title="환경 데이터 수집 봉사 + 리포트"
                                team="BioEdge, S2 Lab"
                                progress={26}
                                status="진행 26%"
                            />
                            <ProjectCard
                                title="AI 안전/윤리? 대신 시스템 리스크"
                                team="S2 Lab"
                                progress={10}
                                status="진행 10%"
                            />
                            <ProjectCard
                                title="무대기술 교류전: 조명/음향"
                                team="StageCraft"
                                progress={90}
                                status="마무리 단계"
                            />
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>

                {/* 4. Layout Grid for Recent & Trending */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Recent Clubs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">최근 등록 동아리</h2>
                            <Button variant="ghost" className="text-sm font-medium" asChild>
                                <Link href="/club/search">전체 보기</Link>
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <RecentClubCard name="PRAGMATISM" school="KMLA · 강원" desc="BM · 창업 · 컨설팅" score={82} />
                            <RecentClubCard name="S2 Lab" school="서울과학고 · 서울" desc="과학 · AI · 로보틱스" score={90} />
                            <RecentClubCard name="Quant Forge" school="대전과학고 · 대전" desc="금융 · 데이터 · 리서치" score={76} />
                            <RecentClubCard name="StageCraft" school="경기과학고 · 경기" desc="공연 · 연출 · 무대기술" score={71} />
                        </div>
                    </div>

                    {/* Trending Collabs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">오늘 뜨는 협업</h2>
                            <Button variant="ghost" className="text-sm font-medium" asChild>
                                <Link href="/collab">전체 보기</Link>
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <TrendingCollabCard
                                title="전국 BM 케이스 스프린트"
                                host="통합 대회 · 전국"
                                date="2/15~2/17"
                                type="OPEN"
                            />
                            <TrendingCollabCard
                                title="AI 안전/윤리? 대신 시스템 리스크"
                                host="연합 포럼 · 수도권"
                                date="2/20일"
                                type="OPEN"
                            />
                            <TrendingCollabCard
                                title="환경 데이터 수집 봉사 + 리포트"
                                host="공동 연구 · 부산/경남"
                                date="3/1~3/3"
                                type="OPEN"
                            />
                            <TrendingCollabCard
                                title="무대기술 교류전: 조명/음향/안전"
                                host="기타 · 전라권"
                                date="1월 10일"
                                type="CLOSED"
                            />
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}

// --- Components ---

function StatsCard({ title, value, subtext, icon }: { title: string, value: string, subtext: string, icon: React.ReactNode }) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{value}</h3>
                            <p className="text-xs text-muted-foreground">{subtext}</p>
                        </div>
                    </div>
                    <div className="p-2 bg-muted/20 rounded-lg">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ProjectCard({ title, team, progress, status }: { title: string, team: string, progress: number, status: string }) {
    return (
        <Card className="w-[300px] inline-block whitespace-normal shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary/40">
            <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                    <h3 className="font-semibold leading-tight line-clamp-1">{title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">참여: {team}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground">진척도</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{status}</Badge>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function RecentClubCard({ name, school, desc, score }: { name: string, school: string, desc: string, score: number }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="space-y-1">
                <h4 className="font-semibold">{name}</h4>
                <p className="text-xs text-muted-foreground">{school}</p>
                <div className="flex gap-1 mt-1">
                    {desc.split(' · ').map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground bg-muted/20 border-0">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-primary/20 bg-primary/5">
                <span className="text-[10px] font-bold text-primary">신뢰</span>
                <span className="text-xs sm:text-sm font-bold text-primary">{score}</span>
            </div>
        </div>
    )
}

function TrendingCollabCard({ title, host, date, type }: { title: string, host: string, date: string, type: 'OPEN' | 'CLOSED' }) {
    const isOpen = type === 'OPEN';
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="space-y-1 min-w-0">
                <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-xs text-muted-foreground">{host}</p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1 items-center">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                        {type === 'OPEN' ? '모집중' : '마감'}
                    </Badge>
                    <span>{date}</span>
                </div>
            </div>
            <Button variant={isOpen ? "outline" : "secondary"} size="sm" className={cn("h-8 text-xs shrink-0 ml-2", isOpen ? "border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700" : "opacity-50")}>
                {isOpen ? 'OPEN' : '종료'}
            </Button>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <main className="container mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12 space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex space-x-4 overflow-hidden">
                        <Skeleton className="h-40 w-[300px] shrink-0 rounded-xl" />
                        <Skeleton className="h-40 w-[300px] shrink-0 rounded-xl" />
                        <Skeleton className="h-40 w-[300px] shrink-0 rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
    )
}
