'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trophy, MessageSquare, Microscope, Zap, BookOpen, FlaskConical, Calculator, Globe2, Palette, Dumbbell, TrendingUp, Heart, MoreHorizontal, ChevronRight, Calendar, MapPin, Briefcase } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { CLUB_THEME_OPTIONS, dbKeysForThemeFilter, type ClubThemeKey } from '@/data/clubThemes';

const NetworkMap3D = dynamic(() => import('@/components/canvas/NetworkMap3D'), { ssr: false });

const THEME_VISUAL: Record<ClubThemeKey, { icon: typeof FlaskConical; color: string }> = {
    과학: { icon: FlaskConical, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    공학: { icon: Zap, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    수학: { icon: Calculator, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    인문: { icon: BookOpen, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    사회: { icon: Globe2, color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    예술: { icon: Palette, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
    체육: { icon: Dumbbell, color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    경제: { icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    의학: { icon: Heart, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    창업: { icon: Briefcase, color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' },
    기타: { icon: MoreHorizontal, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
};

const CATEGORIES = CLUB_THEME_OPTIONS.map(({ key, label }) => ({
    key,
    label,
    ...THEME_VISUAL[key],
}));

interface ClubStats {
    count: number;
    categoryGroups: Array<{ _id: string; count: number; clubs: any[] }>;
}

interface PreviewForumEvent {
    _id: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    eventPlace: string;
}

export default function HomePage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<ClubStats>({ count: 0, categoryGroups: [] });
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [previewForums, setPreviewForums] = useState<PreviewForumEvent[]>([]);

    useEffect(() => {
        fetch('/api/clubs/stats')
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetch('/api/schedule?type=forum&limit=6')
            .then(r => r.json())
            .then((d) => {
                if (!d.success || !Array.isArray(d.events)) return;
                setPreviewForums(
                    d.events.map((e: { _id: string; eventId: string; eventName: string; eventDate: string; eventPlace: string }) => ({
                        _id: e._id,
                        eventId: String(e.eventId),
                        eventName: e.eventName,
                        eventDate: e.eventDate,
                        eventPlace: e.eventPlace,
                    }))
                );
            })
            .catch(() => {});
    }, []);

    const displayCount = stats.count > 0 ? `${stats.count}+` : '100+';

    const filteredClubs = useMemo(() => {
        if (!activeCategory) {
            return stats.categoryGroups.flatMap(g => g.clubs).slice(0, 6);
        }
        const dbKeys = dbKeysForThemeFilter(activeCategory);
        const byId = new Map<string, (typeof stats.categoryGroups)[0]['clubs'][0]>();
        for (const g of stats.categoryGroups) {
            if (!dbKeys.includes(g._id)) continue;
            for (const c of g.clubs) {
                byId.set(String(c.id), c);
            }
        }
        return Array.from(byId.values()).slice(0, 6);
    }, [stats.categoryGroups, activeCategory]);

    const categoryCount = (key: string) =>
        stats.categoryGroups
            .filter((g) => dbKeysForThemeFilter(key).includes(g._id))
            .reduce((sum, g) => sum + (g.count || 0), 0);

    const resolveThemeKeyForClub = (club: { id?: unknown }) => {
        const id = String(club.id);
        for (const { key } of CLUB_THEME_OPTIONS) {
            const keys = dbKeysForThemeFilter(key);
            if (stats.categoryGroups.some((g) => keys.includes(g._id) && g.clubs.some((cl) => String(cl.id) === id))) {
                return key;
            }
        }
        return null as ClubThemeKey | null;
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar />

            {/* Hero Section */}
            <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden pb-16 pt-32 text-center md:pb-24 md:pt-48 lg:py-32">
                <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
                    <NetworkMap3D />
                </div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 z-0 bg-background/20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, transparent, black)' }} />

                <div className="container relative z-10 flex max-w-[64rem] flex-col items-center gap-6 px-4">
                    <Badge variant="secondary" className="px-4 py-2 text-sm backdrop-blur-md bg-background/50 border-input animate-in fade-in slide-in-from-bottom-4 duration-700">
                        전국을 연결하는 네트워크
                    </Badge>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        동아리 활동의<br />
                        <span className="bg-gradient-to-r from-primary via-primary/80 to-blue-500 bg-clip-text text-transparent">새로운 차원</span>
                    </h1>

                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        전국 고등학교 동아리들이 모여라에서 만나고 협력하며 성장합니다.<br className="hidden sm:inline" />
                        대회, 포럼, 공동연구까지 한 곳에서 경험하세요.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        {session ? (
                            <Link href="/dashboard">
                                <Button size="lg" className="h-12 rounded-full px-8 text-lg shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity">
                                    대시보드 열기
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/signup">
                                <Button size="lg" className="h-12 rounded-full px-8 text-lg shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity">
                                    회원 가입하기
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        <Link href="/club/search">
                            <Button variant="outline" size="lg" className="h-12 rounded-full px-8 text-lg backdrop-blur-sm bg-background/50">
                                동아리 탐색하기
                            </Button>
                        </Link>
                    </div>

                    {/* Stat Pills */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 animate-in fade-in duration-1000 delay-500">
                        <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-4 py-2 text-sm font-medium border shadow-sm">
                            <span className="text-primary font-bold">{displayCount}</span> 동아리 활동 중
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-4 py-2 text-sm font-medium border shadow-sm">
                            <span className="text-green-600 font-bold">{CATEGORIES.length}</span> 분야 카테고리
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-4 py-2 text-sm font-medium border shadow-sm">
                            <span className="text-blue-600 font-bold">전국</span> 학교 연결
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Section */}
            <section className="container py-12 md:py-20">
                <div className="text-center space-y-3 mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">동아리 분야별 탐색</h2>
                    <p className="text-muted-foreground">관심 분야를 선택하면 해당 동아리를 먼저 보여드립니다</p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border ${!activeCategory ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-background hover:bg-muted border-border'}`}
                    >
                        전체
                    </button>
                    {CATEGORIES.map(({ key, label, icon: Icon, color }) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border ${activeCategory === key ? 'ring-2 ring-primary shadow-md ' + color : 'bg-background hover:bg-muted border-border'}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                            {categoryCount(key) > 0 ? (
                                <span className="ml-1 text-xs opacity-60">
                                    {categoryCount(key)}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* Club Cards */}
                {filteredClubs.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {filteredClubs.slice(0, 6).map((club: any) => {
                            const themeKey = resolveThemeKeyForClub(club);
                            const cat = themeKey ? CATEGORIES.find((c) => c.key === themeKey) : undefined;
                            const Icon = cat?.icon || MoreHorizontal;
                            const intro = (typeof club.description === 'string' && club.description.trim())
                                ? club.description.trim()
                                : `${club.name} · ${club.school || ''}`.trim();
                            const hoverLabel = intro.length > 160 ? `${intro.slice(0, 157)}…` : intro;
                            return (
                                <Link
                                    key={club.id}
                                    href={`/club/${club.id}`}
                                    className="group block"
                                    title={hoverLabel}
                                >
                                    <div className="relative overflow-hidden rounded-2xl border bg-card p-5 space-y-3 hover:shadow-md hover:border-primary/40 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className={`p-2 rounded-xl ${cat?.color || 'bg-muted text-muted-foreground'}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold group-hover:text-primary transition-colors">{club.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{club.school}</p>
                                        </div>
                                        <p className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-3 bg-gradient-to-t from-card via-card/95 to-transparent pt-10 pb-3 px-5 text-xs leading-snug text-muted-foreground opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                                            {hoverLabel}
                                        </p>
                                        <div className="flex items-center text-xs text-primary font-medium relative z-[1]">
                                            상세 보기 <ChevronRight className="h-3 w-3 ml-0.5" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        {activeCategory ? `${CATEGORIES.find(c => c.key === activeCategory)?.label ?? activeCategory} 분야의 동아리가 아직 없습니다.` : '등록된 동아리를 불러오는 중...'}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Button variant="outline" className="rounded-full px-6" asChild>
                        <Link href="/club/search">
                            모든 동아리 보기 <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* 공개 포럼 미리보기 */}
            <section id="preview-forums" className="border-y bg-muted/20 py-12 md:py-20">
                <div className="container space-y-10">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight">다가오는 연합 포럼</h2>
                        <p className="text-muted-foreground">
                            로그인 없이 공개된 포럼 일정과 소개를 미리 살펴보세요. 참가·개최는 가입 후 이용할 수 있습니다.
                        </p>
                    </div>

                    {previewForums.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                            {previewForums.map((ev) => {
                                const dateLabel = new Date(ev.eventDate).toLocaleDateString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'short',
                                });
                                return (
                                    <Link
                                        key={ev._id}
                                        href={`/forum/${ev.eventId}`}
                                        className="group block rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            연합 포럼
                                        </div>
                                        <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                            {ev.eventName}
                                        </h3>
                                        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                                <span>{dateLabel}</span>
                                            </div>
                                            <div className="flex items-center gap-2 line-clamp-2">
                                                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                <span>{ev.eventPlace || '장소 미정'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-xs font-medium text-primary flex items-center">
                                            자세히 보기 <ChevronRight className="h-3 w-3 ml-0.5" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground text-sm max-w-lg mx-auto">
                            아직 표시할 공개 포럼 일정이 없습니다. 전체 일정에서 대회·공동연구 일정도 함께 확인해 보세요.
                        </p>
                    )}

                    <div className="flex flex-wrap justify-center gap-3">
                        <Button variant="outline" className="rounded-full px-6" asChild>
                            <Link href="/schedule">전체 일정 보기</Link>
                        </Button>
                        <Button variant="outline" className="rounded-full px-6" asChild>
                            <Link href="/club/search">동아리 목록 보기</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-muted/30 py-12 md:py-24">
                <div className="container space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">모여라의 기능</h2>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            학교의 경계를 넘어 새로운 가능성을 발견하세요.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                        <div className="rounded-2xl border bg-card p-8 space-y-4 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">통합 대회</h3>
                            <p className="text-muted-foreground">전국 규모의 동아리 대회에 참가하고 실력을 증명하세요. 다양한 분야의 경진대회가 여러분을 기다립니다.</p>
                        </div>
                        <div className="rounded-2xl border bg-card p-8 space-y-4 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">연합 포럼</h3>
                            <p className="text-muted-foreground">다른 학교와 아이디어를 공유하고 토론하세요. 지식 공유의 장이 열립니다.</p>
                        </div>
                        <div className="rounded-2xl border bg-card p-8 space-y-4 hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <Microscope className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">공동 연구</h3>
                            <p className="text-muted-foreground">관심 분야가 같은 여러 동아리와 함께 프로젝트를 진행해보세요. 학교 간 장벽 없는 연구 협력이 가능합니다.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="container py-16 md:py-24">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center pb-12">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">3단계로 시작하는 동아리 활동</h2>
                    <p className="max-w-[85%] text-muted-foreground md:text-xl">복잡한 절차 없이, 오직 활동에만 집중하세요.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                    {[
                        { num: '01', title: '신원 검증', desc: '학생증을 통한 철저한 본인인증으로\n신뢰할 수 있는 커뮤니티를 보장합니다.' },
                        { num: '02', title: '활동 참여', desc: '전국 곳곳의 동아리들과 협력하며\n탄탄한 스펙과 경험을 쌓으세요.' },
                        { num: '03', title: '상호 평가', desc: '활동 후 서로를 평가하며\n건강한 동아리 생태계를 만들어갑니다.' },
                    ].map(({ num, title, desc }) => (
                        <div key={num} className="flex flex-col items-center text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">{num}</div>
                            <h3 className="text-xl font-bold">{title}</h3>
                            <p className="text-muted-foreground whitespace-pre-line">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container py-12 md:py-24">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-blue-700 px-6 py-20 text-center text-primary-foreground md:px-12 md:py-32 shadow-2xl">
                    <div className="relative z-10 mx-auto max-w-4xl space-y-6">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">지금 바로 시작하세요.</h2>
                        <p className="text-lg md:text-xl text-primary-foreground/80">
                            전국의 <span className="font-bold text-white">{displayCount}</span> 동아리가 이미 활동 중입니다. 여러분의 동아리를 세상에 알리세요.
                        </p>
                        {!session && (
                            <Link href="/signup">
                                <Button size="lg" variant="secondary" className="mt-4 h-14 rounded-full px-10 text-lg font-semibold shadow-lg">
                                    회원 가입하기
                                </Button>
                            </Link>
                        )}
                        {session && (
                            <Link href="/club/register">
                                <Button size="lg" variant="secondary" className="mt-4 h-14 rounded-full px-10 text-lg font-semibold shadow-lg">
                                    내 동아리 등록하기
                                </Button>
                            </Link>
                        )}
                    </div>
                    <div className="absolute left-[-10%] top-[-50%] h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute right-[-10%] bottom-[-50%] h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
                </div>
            </section>
        </div>
    );
}
