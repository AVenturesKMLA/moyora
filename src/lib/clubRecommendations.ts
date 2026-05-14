import { CLUB_KEYWORD_OPTIONS, expandKeywordsForMatch } from '@/data/clubKeywords';

export type ClubRecommendPreference = 'popular' | 'career';

type ClubForReco = {
    clubName?: string;
    description?: string;
    clubTheme?: string;
    maxMembers?: number;
    keywords?: string[];
};

const THEME_KEYWORDS: Record<string, string[]> = {
    과학: ['과학', '연구', '물리', '화학', '생물', '실험', 'lab', 'science'],
    공학: ['공학', '코딩', '개발', '소프트웨어', '로봇', '전자', 'engineering'],
    수학: ['수학', '경시', '올림피아드', 'math'],
    인문: ['인문', '문학', '독서', '토론', '논술'],
    사회: ['사회', '정치', '경제', '법', '역사', 'mun'],
    예술: ['예술', '미술', '음악', '연극', '디자인', '영상'],
    체육: ['체육', '운동', '축구', '농구', '배구', '야구', '스포츠'],
    경제: ['경제', '금융', '투자', '주식', 'bm', '경영'],
    의학: ['의학', '의대', '간호', '생명', '바이오', '병원', 'med', 'pre-med'],
    창업: ['창업', '스타트업', '사업', '아이디어'],
    startup: ['창업', '스타트업', 'bm', '경영', 'business'],
    science: ['과학', '연구', '물리', '화학', '생물', '실험', 'lab', 'science'],
    math: ['수학', '경시', '올림피아드', 'math'],
    humanities: ['인문', '사회', '문학', '역사', '철학'],
    arts: ['예술', '체육', '미술', '음악', '디자인', '운동'],
    other: [],
    기타: [],
};

function careerMatchScore(career: string, club: ClubForReco): number {
    const keywordBlob = expandKeywordsForMatch(club.keywords);
    const hay = `${club.clubName || ''} ${club.description || ''} ${club.clubTheme || ''} ${keywordBlob}`.toLowerCase();
    const norm = career.toLowerCase().trim();
    if (!norm) return 0;

    const tokens = norm
        .split(/[\s,，、./|]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2);

    let score = 0;
    for (const t of tokens) {
        if (hay.includes(t)) score += 4;
    }

    /* 등록 시 선택한 키워드: 진로 문장에 라벨·용어가 들어가면 가중치 */
    let keywordPickBonus = 0;
    for (const id of club.keywords || []) {
        const opt = CLUB_KEYWORD_OPTIONS.find((o) => o.id === id);
        if (!opt) continue;
        for (const term of [opt.label, ...opt.terms]) {
            const tm = term.toLowerCase();
            if (tm.length >= 2 && norm.includes(tm)) keywordPickBonus += 18;
        }
    }
    score += keywordPickBonus;

    const theme = club.clubTheme || '';
    const hints = THEME_KEYWORDS[theme] || [];
    for (const kw of hints) {
        if (norm.includes(kw)) score += 2;
    }
    for (const [th, kws] of Object.entries(THEME_KEYWORDS)) {
        if (theme === th || hay.includes(th)) {
            for (const kw of kws) {
                if (norm.includes(kw)) score += 1;
            }
        }
    }

    return score;
}

export function sortClubsByRecommendation<T extends ClubForReco>(
    clubs: T[],
    preference: ClubRecommendPreference | undefined,
    careerInterest: string | undefined
): T[] {
    const copy = [...clubs];
    const pref = preference || 'popular';
    const career = (careerInterest || '').trim();

    if (pref === 'career' && career) {
        copy.sort((a, b) => {
            const da = careerMatchScore(career, a);
            const db = careerMatchScore(career, b);
            if (db !== da) return db - da;
            return (a.clubName || '').localeCompare(b.clubName || '', 'ko');
        });
        return copy;
    }

    copy.sort((a, b) => {
        const mb = b.maxMembers || 0;
        const ma = a.maxMembers || 0;
        if (mb !== ma) return mb - ma;
        return (a.clubName || '').localeCompare(b.clubName || '', 'ko');
    });
    return copy;
}
