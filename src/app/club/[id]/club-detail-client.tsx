'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, Users, ArrowLeft, School, Hash, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getKeywordLabel } from '@/data/clubKeywords';
import { displayLabelForStoredClubTheme } from '@/data/clubThemes';

type LoadState = 'loading' | 'ok' | 'error';

export default function ClubDetailClient({ clubId }: { clubId: string }) {
    const router = useRouter();
    const { status } = useSession();
    const isLoggedIn = status === 'authenticated';
    const [club, setClub] = useState<any>(null);
    const [loadState, setLoadState] = useState<LoadState>('loading');

    useEffect(() => {
        if (!clubId?.trim()) {
            setLoadState('error');
            return;
        }
        let cancelled = false;
        (async () => {
            setLoadState('loading');
            try {
                const res = await fetch(`/api/clubs/${encodeURIComponent(clubId)}`);
                const data = await res.json();
                if (cancelled) return;
                if (data.success && data.club) {
                    setClub(data.club);
                    setLoadState('ok');
                } else {
                    setClub(null);
                    setLoadState('error');
                }
            } catch {
                if (!cancelled) {
                    setClub(null);
                    setLoadState('error');
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [clubId]);

    const mongoId = club?._id != null ? String(club._id) : clubId;

    const goApply = () => {
        if (!mongoId) return;
        if (!isLoggedIn) {
            router.push(`/login?callbackUrl=${encodeURIComponent(`/club/search?apply=${mongoId}`)}`);
            return;
        }
        router.push(`/club/search?apply=${mongoId}`);
    };

    if (loadState === 'loading') {
        return (
            <div className="min-h-screen bg-background pb-20 flex flex-col">
                <NavBar />
                <div className="flex flex-1 justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (loadState === 'error' || !club) {
        return (
            <div className="min-h-screen bg-background pb-20 flex flex-col">
                <NavBar />
                <main className="container max-w-lg mx-auto px-4 pt-16 flex-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>동아리를 찾을 수 없습니다</CardTitle>
                            <CardDescription>
                                주소가 잘못되었거나 삭제된 동아리일 수 있습니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button variant="outline" asChild>
                                <Link href="/club/search">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    동아리 탐색
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild>
                                <Link href="/">홈으로</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const themeLabel = displayLabelForStoredClubTheme(club.clubTheme);

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />

            <main className="container max-w-4xl mx-auto px-4 pt-8 md:pt-12 space-y-6 animate-fade-in relative z-10">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">홈</Link>
                    <span aria-hidden>/</span>
                    <Link href="/club/search" className="hover:text-foreground">동아리 탐색</Link>
                    <span aria-hidden>/</span>
                    <span className="text-foreground truncate max-w-[12rem] sm:max-w-md">{club.clubName}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2" asChild>
                        <Link href="/club/search">
                            <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
                        </Link>
                    </Button>
                </div>

                <Card className="overflow-hidden border-border/50 shadow-lg">
                    <div className="h-36 sm:h-44 bg-gradient-to-br from-primary/25 via-primary/10 to-blue-600/20 w-full relative">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
                    </div>
                    <CardContent className="px-6 pb-10 pt-0 relative">
                        <div className="flex flex-col sm:flex-row gap-6 relative -top-14 sm:-top-16">
                            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-background shadow-xl rounded-2xl bg-card shrink-0">
                                <AvatarImage
                                    src={club.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(club.clubName)}&backgroundColor=0a0a0a`}
                                    alt={club.clubName}
                                    className="object-cover"
                                />
                                <AvatarFallback className="rounded-2xl bg-secondary text-2xl font-bold">
                                    {club.clubName?.substring(0, 2) || '?'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 pt-12 sm:pt-14 min-w-0">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 font-medium">
                                                {themeLabel}
                                            </Badge>
                                            <Badge variant="secondary" className="font-normal gap-1">
                                                <School className="h-3 w-3" />
                                                {club.schoolName}
                                            </Badge>
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground break-words">
                                            {club.clubName}
                                        </h1>
                                        {club.presidentName ? (
                                            <p className="text-muted-foreground text-sm">
                                                동아리장 <span className="font-medium text-foreground">{club.presidentName}</span>
                                            </p>
                                        ) : null}
                                        {(club.keywords?.length ? club.keywords : []).length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {(club.keywords as string[]).map((kid: string) => (
                                                    <Badge key={kid} variant="outline" className="bg-muted/50 text-xs font-normal gap-1">
                                                        <Hash className="h-3 w-3 opacity-60" />
                                                        {getKeywordLabel(kid)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                                        <Button className="rounded-full shadow-sm" onClick={goApply}>
                                            {isLoggedIn ? '가입 신청하기' : '로그인하고 가입 신청'}
                                        </Button>
                                        <Button variant="outline" className="rounded-full" asChild>
                                            <Link href="/club/search">다른 동아리 보기</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/60">
                                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <div className="text-xs text-muted-foreground">활동 지역</div>
                                    <div className="font-medium text-sm break-words">{club.location || '미정'}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/60">
                                <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs text-muted-foreground">모임 시간</div>
                                    <div className="font-medium text-sm">{club.meetingTime || '자율'}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/60">
                                <Users className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs text-muted-foreground">모집 인원</div>
                                    <div className="font-medium text-sm">{club.maxMembers ? `${club.maxMembers}명` : '제한 없음'}</div>
                                </div>
                            </div>
                        </div>

                        <section className="mt-10 space-y-3">
                            <h2 className="text-lg font-semibold tracking-tight">동아리 소개</h2>
                            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base bg-muted/30 p-6 rounded-2xl border border-border/60">
                                {club.description?.trim() ? club.description : '아직 등록된 소개가 없습니다.'}
                            </div>
                        </section>

                        {!isLoggedIn ? (
                            <p className="mt-8 text-sm text-muted-foreground rounded-xl border bg-muted/20 px-4 py-3">
                                가입 신청·연락처 확인은{' '}
                                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">로그인</Link>
                                {' '}후 이용할 수 있습니다.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
