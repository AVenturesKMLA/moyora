'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, MapPin, ArrowLeft, Users } from 'lucide-react';

export default function PublicForumDetailPage() {
    const { id } = useParams();
    const [forum, setForum] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetch(`/api/events/forum/${id}`);
                const data = await res.json();
                if (data.success && data.event) {
                    setForum(data.event);
                }
            } catch {
                setForum(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!forum) {
        return (
            <div className="min-h-screen bg-background pb-20">
                <NavBar />
                <main className="container max-w-2xl mx-auto px-4 pt-16 text-center space-y-4">
                    <p className="text-muted-foreground">포럼 정보를 찾을 수 없습니다.</p>
                    <Button variant="outline" asChild>
                        <Link href="/">홈으로</Link>
                    </Button>
                </main>
            </div>
        );
    }

    const dateStr = forum.forumDate
        ? new Date(forum.forumDate).toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' })
        : '';

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <main className="container max-w-3xl mx-auto px-4 pt-8 md:pt-12 space-y-6">
                <Button variant="ghost" className="text-muted-foreground -ml-2" asChild>
                    <Link href="/#preview-forums">
                        <ArrowLeft className="mr-2 h-4 w-4 inline" /> 포럼 미리보기로
                    </Link>
                </Button>

                <Card>
                    <CardHeader className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">연합 포럼</Badge>
                            {forum.forumType ? <Badge variant="outline">{forum.forumType}</Badge> : null}
                        </div>
                        <CardTitle className="text-2xl md:text-3xl leading-tight">{forum.forumName}</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 shrink-0" />
                                {dateStr}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 shrink-0" />
                                {forum.forumPlace || '장소 미정'}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Array.isArray(forum.forumClubs) && forum.forumClubs.length > 0 ? (
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <Users className="h-4 w-4" /> 참여 동아리 예시
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {forum.forumClubs.map((name: string) => (
                                        <Badge key={name} variant="outline" className="font-normal">{name}</Badge>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div>
                            <h3 className="text-sm font-semibold mb-2">소개</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm rounded-xl border bg-muted/20 p-4">
                                {forum.description || '상세 설명이 등록되지 않았습니다.'}
                            </p>
                        </div>

                        {forum.notices ? (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">안내</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{forum.notices}</p>
                            </div>
                        ) : null}

                        <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 text-sm text-muted-foreground">
                            참가 신청·문의는 <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">회원가입</Link> 후 대시보드와 협업 메뉴에서 이용할 수 있습니다.
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
