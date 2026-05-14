/** 동아리 등록 시 선택하는 키워드 — 진로 맞춤 추천에 사용 */
export type ClubKeywordOption = {
    id: string;
    label: string;
    /** 진로 문장과 매칭할 때 쓰는 동의어·관련어 */
    terms: string[];
};

export const CLUB_KEYWORD_OPTIONS: ClubKeywordOption[] = [
    { id: 'med', label: '의학·보건', terms: ['의학', '의대', '의예', '간호', '보건', '생명과학', '바이오', 'med', 'pre-med', '프리메드'] },
    { id: 'pharm', label: '약학·제약', terms: ['약학', '약대', '제약', '임상'] },
    { id: 'vet', label: '수의학', terms: ['수의', '수의대', '동물'] },
    { id: 'stem', label: '이공계·자연과학', terms: ['물리', '화학', '생물', '지구', '천문', 'stem', '과학고', '이공', '과학'] },
    { id: 'engineering', label: '공학·기계', terms: ['공학', '기계', '전기', '전자', '항공', '엔지니어', '로봇'] },
    { id: 'cs_ai', label: '컴퓨터·AI', terms: ['컴퓨터', '코딩', '프로그래밍', '소프트웨어', 'ai', '인공지능', '알고리즘', '개발', 'it'] },
    { id: 'math', label: '수학', terms: ['수학', '경시', '콤비', '올림피아드', 'math'] },
    { id: 'econ_biz', label: '경제·경영', terms: ['경제', '경영', '투자', '주식', '금융', 'bm', 'mba'] },
    { id: 'startup', label: '창업·벤처', terms: ['창업', '스타트업', '벤처', '사업', '아이디어'] },
    { id: 'law_policy', label: '법학·정책', terms: ['법', '로스쿨', '정책', '입법', '모의재판', '판검사'] },
    { id: 'intl', label: '국제·외교', terms: ['외교', '국제', 'mun', '국제관계', '통번역'] },
    { id: 'humanities', label: '인문·문학', terms: ['인문', '문학', '국어', '영문', '철학', '역사학'] },
    { id: 'social', label: '사회·심리', terms: ['사회', '심리', '사회학', '인류'] },
    { id: 'edu', label: '교육·사범', terms: ['교육', '교사', '사범', '교대'] },
    { id: 'arts_design', label: '예술·디자인', terms: ['미술', '디자인', '시각', '공예', '예술'] },
    { id: 'music_perf', label: '음악·공연', terms: ['음악', '합창', '밴드', '연극', '뮤지컬', '공연'] },
    { id: 'film_media', label: '영상·미디어', terms: ['영상', '영화', '미디어', '방송', '유튜브'] },
    { id: 'sports', label: '체육·스포츠', terms: ['체육', '운동', '스포츠', '체대'] },
    { id: 'journalism', label: '언론·콘텐츠', terms: ['신문', '기자', '언론', '편집', '콘텐츠'] },
    { id: 'pub_admin', label: '행정·공직', terms: ['행정', '공무원', '고시', '5급'] },
    { id: 'research', label: '연구·R&D', terms: ['연구', '실험', 'r&d', '논문', 'lab'] },
    { id: 'environment', label: '환경·에너지', terms: ['환경', '기후', '에너지', 'esg'] },
    { id: 'architecture', label: '건축·도시', terms: ['건축', '도시', '조경', '인테리어'] },
    { id: 'agri', label: '농림·식품', terms: ['농업', '식품', '축산', '원예'] },
    { id: 'other', label: '기타·탐색 중', terms: ['기타', '탐색', '미정'] },
];

const OPTION_BY_ID = new Map(CLUB_KEYWORD_OPTIONS.map((o) => [o.id, o]));

export function getKeywordLabel(id: string): string {
    return OPTION_BY_ID.get(id)?.label ?? id;
}

/** 진로 문장과의 부분 일치 검사용 — 라벨·용어·id를 한 덩어리로 */
export function expandKeywordsForMatch(ids: string[] | undefined): string {
    if (!ids?.length) return '';
    const parts: string[] = [];
    for (const id of ids) {
        const opt = OPTION_BY_ID.get(id);
        if (opt) {
            parts.push(opt.label, ...opt.terms, opt.id);
        } else {
            parts.push(id);
        }
    }
    return parts.join(' ').toLowerCase();
}

export function isAllowedKeywordId(id: string): boolean {
    return OPTION_BY_ID.has(id);
}
