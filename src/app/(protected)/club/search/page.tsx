'use client';

import { useState, useMemo, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClubCard } from '@/components/cards/ClubCard';
import { DemoState, loadState, Club } from '@/data/demoData';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function ClubSearchPage() {
    const [state, setState] = useState<DemoState | null>(null);
    const [query, setQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');

    // Additional placeholders for filters matching mockup
    const [fieldFilter, setFieldFilter] = useState('all');
    const [trustFilter, setTrustFilter] = useState('all');

    useEffect(() => {
        setState(loadState());
    }, []);

    const filteredClubs = useMemo(() => {
        if (!state) return [];
        return state.clubs.filter(club => {
            const matchesQuery = club.name.toLowerCase().includes(query.toLowerCase()) ||
                club.school_name?.toLowerCase().includes(query.toLowerCase());
            // Mock region filter (assuming club has no region field in demoData yet, we skip strict filtering or add it later)
            // For now just substring match
            const matchesRegion = regionFilter === 'all' || true;

            return matchesQuery && matchesRegion;
        });
    }, [state, query, regionFilter]);

    if (!state) return null;

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
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        필터링으로 원하는 동아리를 찾아보세요. 신뢰 점수와 태그를 통해 우리 학교와 꼭 맞는 파트너를 찾을 수 있습니다.
                    </p>
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
                {filteredClubs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredClubs.map(club => (
                            <ClubCard
                                key={club.id}
                                club={club}
                                onClick={() => alert(`${club.name} 상세 페이지 (Demo)`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
