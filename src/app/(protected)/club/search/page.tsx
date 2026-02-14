'use client';

import { useState, useMemo, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClubCard } from '@/components/cards/ClubCard';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ClubSearchPage() {
    const [clubs, setClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    const [fieldFilter, setFieldFilter] = useState('all');
    const [trustFilter, setTrustFilter] = useState('all');

    // Application Modal State
    const [selectedClub, setSelectedClub] = useState<any | null>(null);
    const [applyMessage, setApplyMessage] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const res = await fetch('/api/clubs');
                const data = await res.json();
                if (data.success) {
                    setClubs(data.clubs);

                    // Check for ?apply=ID query param
                    const applyId = searchParams.get('apply');
                    if (applyId) {
                        const clubToApply = data.clubs.find((c: any) => c._id === applyId);
                        if (clubToApply) {
                            setSelectedClub(clubToApply);
                        }
                    }
                }
            } catch (error) {
                console.error('Fetch clubs error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClubs();
    }, [searchParams]);

    const filteredClubs = useMemo(() => {
        return clubs.filter(club => {
            const matchesQuery = !query ||
                club.clubName.toLowerCase().includes(query.toLowerCase()) ||
                (club.schoolName && club.schoolName.toLowerCase().includes(query.toLowerCase()));

            const matchesField = fieldFilter === 'all' || club.clubTheme === fieldFilter;

            const matchesRegion = regionFilter === 'all' ||
                (club.location?.toLowerCase().includes(regionFilter.toLowerCase())) ||
                (club.schoolName && club.schoolName.toLowerCase().includes(regionFilter.toLowerCase()));

            const trust = typeof club.trustScore === 'number' ? club.trustScore : 70;
            const matchesTrust = trustFilter === 'all' || (trustFilter === 'high' && trust >= 80) || (trustFilter === 'mid' && trust >= 70);

            return matchesQuery && matchesField && matchesRegion && matchesTrust;
        });
    }, [clubs, query, fieldFilter, regionFilter, trustFilter]);

    const handleApply = async () => {
        if (!selectedClub) return;
        setIsApplying(true);
        try {
            const res = await fetch('/api/club/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clubId: selectedClub._id,
                    message: applyMessage
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('가입 신청이 완료되었습니다.');
                setSelectedClub(null);
                setApplyMessage('');
            } else {
                alert(data.message || '가입 신청 중 오류가 발생했습니다.');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <main className="container mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12 space-y-8 animate-fade-in relative z-10">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">동아리 탐색</h1>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-medium">
                            {filteredClubs.length}개 동아리
                        </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            필터링으로 원하는 동아리를 찾아보세요. 신뢰 점수와 태그를 통해 우리 학교와 꼭 맞는 파트너를 찾을 수 있습니다.
                        </p>
                        <Button className="rounded-full shadow-md font-semibold shrink-0" asChild>
                            <Link href="/club/register">동아리 등록</Link>
                        </Button>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9 h-10 bg-background"
                            placeholder="동아리명, 학교명 검색"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                        <SelectTrigger className="w-[130px] h-10 bg-background">
                            <SelectValue placeholder="지역" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">지역 전체</SelectItem>
                            <SelectItem value="seoul">서울</SelectItem>
                            <SelectItem value="gyeonggi">경기</SelectItem>
                            <SelectItem value="daejeon">대전/충청</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={fieldFilter} onValueChange={setFieldFilter}>
                        <SelectTrigger className="w-[130px] h-10 bg-background">
                            <SelectValue placeholder="분야" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">분야 전체</SelectItem>
                            <SelectItem value="tech">IT/공학</SelectItem>
                            <SelectItem value="biz">경영/창업</SelectItem>
                            <SelectItem value="art">예술/디자인</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={trustFilter} onValueChange={setTrustFilter}>
                        <SelectTrigger className="w-[130px] h-10 bg-background">
                            <SelectValue placeholder="신뢰 점수" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="high">80점 이상</SelectItem>
                            <SelectItem value="mid">70점 이상</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Club Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredClubs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredClubs.map(club => (
                            <ClubCard
                                key={club._id}
                                club={{
                                    id: club._id,
                                    name: club.clubName,
                                    school: club.schoolName,
                                    size: club.maxMembers || 0,
                                    description: club.description,
                                    trustScore: typeof club.trustScore === 'number' ? club.trustScore : 70,
                                    onApply: () => setSelectedClub(club)
                                } as any}
                                onClick={() => alert(`${club.clubName} 상세 페이지 (Demo)`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                    </div>
                )}
            </main>

            {/* Application Modal */}
            <Dialog open={!!selectedClub} onOpenChange={(open) => !open && setSelectedClub(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedClub?.clubName} 가입 신청</DialogTitle>
                        <DialogDescription>
                            동아리장에게 보낼 간단한 자기소개나 지원 동기를 작성해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="안녕하세요! 이번에 동아리에 지원하게 된... (최대 500자)"
                            value={applyMessage}
                            onChange={(e) => setApplyMessage(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedClub(null)}>취소</Button>
                        <Button
                            onClick={handleApply}
                            disabled={isApplying || !applyMessage.trim()}
                        >
                            {isApplying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            신청하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}



