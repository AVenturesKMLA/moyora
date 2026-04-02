'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, Users, ArrowLeft, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ClubDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [club, setClub] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchClub = async () => {
            try {
                const res = await fetch(`/api/clubs/${id}`);
                const data = await res.json();
                if (data.success) {
                    setClub(data.club);
                } else {
                    alert('동아리를 찾을 수 없습니다.');
                    router.push('/club/search');
                }
            } catch (error) {
                console.error(error);
                alert('오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchClub();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-20 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!club) return null;

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            
            <main className="container max-w-4xl mx-auto px-4 pt-8 md:pt-12 space-y-8 animate-fade-in relative z-10">
                <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로 돌아가기
                </Button>

                <Card className="overflow-hidden border-border/50 shadow-md">
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-blue-500/20 w-full relative">
                        {/* Banner Image Placeholder */}
                    </div>
                    <CardContent className="px-6 pb-8 pt-0 relative">
                        <div className="flex flex-col sm:flex-row gap-6 relative -top-12">
                            {/* Avatar */}
                            <Avatar className="w-24 h-24 border-4 border-background shadow-lg rounded-2xl bg-white shrink-0">
                                <AvatarImage src={club.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${club.clubName}&backgroundColor=0a0a0a`} alt={club.clubName} className="object-cover" />
                                <AvatarFallback className="rounded-2xl bg-secondary text-2xl font-bold">
                                    {club.clubName.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 pt-14 sm:pt-12">
                                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                                {club.clubTheme}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-secondary/50">
                                                {club.schoolName}
                                            </Badge>
                                        </div>
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                            {club.clubName}
                                        </h1>
                                        <p className="text-muted-foreground mt-1 text-sm font-medium">
                                            회장: {club.presidentName}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => router.push(`/club/search?apply=${club._id}`)}
                                        >
                                            가입 신청
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats / Info row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-xs text-muted-foreground">지역/위치</div>
                                    <div className="font-medium text-sm">{club.location || '미정'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-xs text-muted-foreground">모임 시간</div>
                                    <div className="font-medium text-sm">{club.meetingTime || '자율'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-xs text-muted-foreground">모집 인원</div>
                                    <div className="font-medium text-sm">{club.maxMembers ? `${club.maxMembers}명` : '제한 없음'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                <Trophy className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="text-xs text-primary font-medium">신뢰 점수</div>
                                    <div className="font-bold text-sm text-primary">{club.trustScore || 70}점</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-bold">동아리 소개</h3>
                            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm bg-secondary/10 p-5 rounded-2xl border border-border/50">
                                {club.description || '작성된 소개가 없습니다.'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
