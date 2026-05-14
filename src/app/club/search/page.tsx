'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClubCard } from '@/components/cards/ClubCard';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { sortClubsByRecommendation, type ClubRecommendPreference } from '@/lib/clubRecommendations';
import { CLUB_THEME_OPTIONS, clubThemeMatchesFilter } from '@/data/clubThemes';

/** 지역 필터 값 → 학교명·활동 장소 문자열에 매칭할 키워드(소문자 비교) */
const REGION_MATCH_KEYWORDS: Record<string, string[]> = {
    경상: [
        '경상', '부산', '대구', '울산', '경남', '경북', '창원', '창원시', '포항', '구미', '김해', '양산',
        '진주', '통영', '거제', '안동', '경주', '상주', '문경', '경산', '울진', '거창', '합천', '밀양',
        '영주', '영천', '의성', '청송', '영양', '봉화', '군위', '칠곡', '고령', '성주', '예천', '김천',
        '남해', '하동', '사천', '함안', '의령', '창녕', '고성', '산청', '함양', '거제시',
    ],
    전라: [
        '전라', '광주', '전남', '전북', '목포', '여수', '순천', '광양', '익산', '전주', '군산', '군산시',
        '정읍', '남원', '김제', '완주', '무주', '진안', '장수', '임실', '순창', '고창', '부안', '익산시',
        '나주', '담양', '곡성', '구례', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평',
        '영광', '장성', '완도', '진도', '신안',
    ],
    경남: ['경남', '창원', '창원시', '김해', '양산', '진주', '통영', '거제', '밀양', '거창', '합천', '사천', '함안', '의령', '창녕', '고성', '하동', '남해', '산청', '함양', '거제시'],
    경북: ['경북', '포항', '구미', '경주', '안동', '상주', '문경', '경산', '울진', '영주', '영천', '의성', '청송', '영양', '봉화', '군위', '칠곡', '고령', '성주', '예천', '김천'],
    전남: ['전남', '목포', '여수', '순천', '광양', '나주', '담양', '곡성', '구례', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'],
    전북: ['전북', '익산', '익산시', '전주', '군산', '군산시', '정읍', '남원', '김제', '완주', '무주', '진안', '장수', '임실', '순창', '고창', '부안'],
};

function clubMatchesRegionFilter(club: { location?: string; schoolName?: string }, regionFilter: string): boolean {
    if (regionFilter === 'all') return true;
    const hay = `${club.location || ''} ${club.schoolName || ''}`.toLowerCase();
    const keys = REGION_MATCH_KEYWORDS[regionFilter];
    if (keys?.length) {
        return keys.some((k) => hay.includes(k.toLowerCase()));
    }
    return hay.includes(regionFilter.toLowerCase());
}

function ClubSearchContent() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';
    const [clubs, setClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    const [fieldFilter, setFieldFilter] = useState('all');

    const [selectedClub, setSelectedClub] = useState<any | null>(null);
    const [applyName, setApplyName] = useState('');
    const [applyPhone, setApplyPhone] = useState('');
    const [applyEmail, setApplyEmail] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const [reco, setReco] = useState<{
        preference: ClubRecommendPreference;
        career: string;
    }>({ preference: 'popular', career: '' });

    const searchParams = useSearchParams();

    useEffect(() => {
        const load = async () => {
            try {
                const [clubsRes, profileRes] = await Promise.all([
                    fetch('/api/clubs/discover'),
                    isLoggedIn ? fetch('/api/profile') : Promise.resolve(null as Response | null),
                ]);

                if (profileRes?.ok) {
                    const profileData = await profileRes.json();
                    if (profileData.success && profileData.user) {
                        setReco({
                            preference:
                                profileData.user.clubRecommendPreference === 'career' ? 'career' : 'popular',
                            career: profileData.user.careerInterest || '',
                        });
                    }
                }

                const data = await clubsRes.json();
                if (data.success) {
                    setClubs(data.clubs);

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
        load();
    }, [searchParams, isLoggedIn]);

    const extractChosung = (str: string) => {
        const CHO_HANGUL = [
            'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
            'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
            'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
            'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
        ];
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i) - 44032;
            if (code > -1 && code < 11172) {
                result += CHO_HANGUL[Math.floor(code / 588)];
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    };

    const filteredClubs = useMemo(() => {
        return clubs.filter(club => {
            const chosungQuery = extractChosung(query).toLowerCase();
            const matchesQuery = !query ||
                club.clubName.toLowerCase().includes(query.toLowerCase()) ||
                extractChosung(club.clubName).toLowerCase().includes(chosungQuery) ||
                (club.schoolName && (club.schoolName.toLowerCase().includes(query.toLowerCase()) || extractChosung(club.schoolName).toLowerCase().includes(chosungQuery)));

            const matchesField = clubThemeMatchesFilter(club.clubTheme, fieldFilter);

            const matchesRegion = clubMatchesRegionFilter(club, regionFilter);

            return matchesQuery && matchesField && matchesRegion;
        });
    }, [clubs, query, fieldFilter, regionFilter]);

    const displayClubs = useMemo(
        () => sortClubsByRecommendation(filteredClubs, reco.preference, reco.career),
        [filteredClubs, reco]
    );

    const recoBanner = !isLoggedIn
        ? '로그인 없이 전국 동아리를 둘러볼 수 있습니다. 가입 신청은 로그인 후 이용할 수 있습니다.'
        : reco.preference === 'career' && reco.career.trim()
            ? '희망 진로·관심 분야와 맞는 동아리를 우선 정렬했습니다.'
            : reco.preference === 'career'
                ? '희망 진로가 비어 있어 인기 동아리 순으로 보여드립니다. 마이페이지에서 진로를 입력해 주세요.'
                : '모집 규모 등을 반영해 인기 동아리 순으로 정렬했습니다.';

    const openApply = (club: any) => {
        if (!isLoggedIn) {
            const next = `/club/search?apply=${club._id}`;
            router.push(`/login?callbackUrl=${encodeURIComponent(next)}`);
            return;
        }
        setSelectedClub(club);
    };

    const handleApply = async () => {
        if (!selectedClub) return;
        setIsApplying(true);
        try {
            const res = await fetch('/api/club/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clubId: String(selectedClub._id ?? ''),
                    applicantName: applyName,
                    applicantPhone: applyPhone,
                    applicantEmail: applyEmail,
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('가입 신청이 완료되었습니다.');
                setSelectedClub(null);
                setApplyName('');
                setApplyPhone('');
                setApplyEmail('');
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

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">동아리 탐색</h1>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-medium">
                            {filteredClubs.length}개 동아리
                        </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            {isLoggedIn
                                ? '필터로 범위를 좁힌 뒤, 마이페이지에서 설정한 기준으로 목록을 정렬합니다.'
                                : '전국에 등록된 동아리를 분야·지역으로 살펴보세요. 관심 있는 동아리는 로그인 후 가입 신청할 수 있습니다.'}
                        </p>
                        <Button className="rounded-full shadow-md font-semibold shrink-0" asChild>
                            <Link href={isLoggedIn ? '/club/register' : `/login?callbackUrl=${encodeURIComponent('/club/register')}`}>
                                동아리 등록
                            </Link>
                        </Button>
                    </div>
                </div>

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
                            <SelectItem value="서울">서울</SelectItem>
                            <SelectItem value="경기">경기</SelectItem>
                            <SelectItem value="인천">인천</SelectItem>
                            <SelectItem value="강원">강원</SelectItem>
                            <SelectItem value="충청">충청/대전/세종</SelectItem>
                            <SelectItem value="경상">경상(부산·대구·울산 등)</SelectItem>
                            <SelectItem value="경남">경남</SelectItem>
                            <SelectItem value="경북">경북</SelectItem>
                            <SelectItem value="전라">전라(광주 등)</SelectItem>
                            <SelectItem value="전남">전남</SelectItem>
                            <SelectItem value="전북">전북</SelectItem>
                            <SelectItem value="제주">제주</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={fieldFilter} onValueChange={setFieldFilter}>
                        <SelectTrigger className="w-[130px] h-10 bg-background">
                            <SelectValue placeholder="분야" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">분야 전체</SelectItem>
                            {CLUB_THEME_OPTIONS.map(({ key, label }) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>

                {!loading && (
                    <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-foreground/90">{recoBanner}</p>
                        {isLoggedIn ? (
                            <Link href="/mypage" className="shrink-0 font-medium text-primary underline-offset-4 hover:underline">
                                마이페이지에서 변경
                            </Link>
                        ) : (
                            <Link href="/signup" className="shrink-0 font-medium text-primary underline-offset-4 hover:underline">
                                회원가입하고 맞춤 정렬 받기
                            </Link>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : displayClubs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayClubs.map(club => (
                            <ClubCard
                                key={club._id}
                                club={{
                                    id: club._id,
                                    name: club.clubName,
                                    school: club.schoolName,
                                    size: club.maxMembers || 0,
                                    description: club.description,
                                    clubTheme: club.clubTheme,
                                    keywords: club.keywords || [],
                                    onApply: () => openApply(club)
                                }}
                                onClick={() => router.push(`/club/${club._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                    </div>
                )}
            </main>

            <Dialog open={!!selectedClub} onOpenChange={(open) => !open && setSelectedClub(null)}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{selectedClub?.clubName} 가입 신청</DialogTitle>
                        <DialogDescription>
                            동아리장에게 보낼 정보를 입력해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="apply-name">이름 <span className="text-destructive">*</span></Label>
                                <Input id="apply-name" placeholder="홍길동" value={applyName} onChange={e => setApplyName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="apply-phone">연락처</Label>
                                <Input id="apply-phone" placeholder="010-0000-0000" value={applyPhone} onChange={e => setApplyPhone(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="apply-email">이메일</Label>
                            <Input id="apply-email" type="email" placeholder="example@email.com" value={applyEmail} onChange={e => setApplyEmail(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedClub(null)}>취소</Button>
                        <Button
                            onClick={handleApply}
                            disabled={isApplying || !applyName.trim()}
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

export default function ClubSearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex justify-center items-center pb-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <ClubSearchContent />
        </Suspense>
    );
}
