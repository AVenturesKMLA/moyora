
export interface Club {
    id: string;
    school: string;
    region: string;
    name: string;
    tags: string[];
    size: number;
    trust: number;
    leader: string;
    phone: string;
    email: string;
    description: string;
    portfolio: string[];
}

export interface Application {
    id: string;
    collab_id: string;
    applicant_club_id: string;
    applied_at: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface Rating {
    collab_id: string;
    rated_club_id: string;
    rating: number; // 1-5
    rated_at: string;
}

export type TargetType = 'nationwide' | 'regional' | 'school_type' | 'specific';
export type SchoolType = '전국 단위 자사고' | '서울 자사고' | '외고' | '국제고' | '특성화고' | '영재고' | '과학고';

export interface Collab {
    id: string;
    club_id: string;
    type: string;
    title: string;
    dateStart: string;
    dateEnd?: string;
    time?: string;
    method: 'offline' | 'online';
    address?: string;
    onlineInfo?: string;
    region: string;
    budget: string;
    notes?: string;
    status: 'open' | 'closed' | 'completed';
    targetType?: TargetType;
    targetSchoolTypes?: SchoolType[];
    targetSpecificSchools?: string;
}

export interface ClubJoinRequest {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    club_id: string;
    requested_at: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface Project {
    id: string;
    title: string;
    members: string[];
    progress: number;
    artifacts: string[];
    next: string;
}

export interface Template {
    id: string;
    name: string;
    desc: string;
    fields: string[];
}

export interface DemoState {
    clubs: Club[];
    links: [string, string][];
    collabs: Collab[];
    projects: Project[];
    templates: Template[];
    applications: Application[];
    ratings: Rating[];
    clubJoinRequests: ClubJoinRequest[];
}

export const DEMO_DATA: DemoState = {
    clubs: [
        {
            id: 'c1',
            school: 'KMLA',
            region: '강원',
            name: 'PRAGMATISM',
            tags: ['BM', '창업', '컨설팅'],
            size: 22,
            trust: 82,
            leader: '최도윤',
            phone: '010-1234-5678',
            email: 'pragmatism@school.kr',
            description: '비즈니스 모델 분석과 창업 컨설팅을 전문으로 하는 동아리입니다. 실제 기업과 협업하여 컨설팅 프로젝트를 진행합니다.',
            portfolio: ['서울 식당 무료 컨설팅 파일럿', '대회 운영 킷']
        },
        {
            id: 'c2',
            school: '서울과학고',
            region: '서울',
            name: 'S2 Lab',
            tags: ['과학', 'AI', '로보틱스'],
            size: 18,
            trust: 90,
            leader: '이서연',
            phone: '010-2345-6789',
            email: 's2lab@school.kr',
            description: 'AI와 로보틱스 분야의 최신 기술을 연구하고 실험하는 과학 동아리입니다. 자율주행, 머신러닝 프로젝트를 수행합니다.',
            portfolio: ['자율주행 미니카 프로젝트', 'AI 논문리딩 세미나']
        },
        {
            id: 'c3',
            school: '대전과학고',
            region: '대전',
            name: 'Quant Forge',
            tags: ['금융', '데이터', '리서치'],
            size: 14,
            trust: 76,
            leader: '박지호',
            phone: '010-3456-7890',
            email: 'quantforge@school.kr',
            description: '퀀트 금융과 데이터 분석을 연구하는 동아리입니다. 시장 분석 리포트와 알고리즘 트레이딩을 공부합니다.',
            portfolio: ['시장분석 리포트', '백테스트 노트']
        },
        {
            id: 'c4',
            school: '광주과학고',
            region: '광주',
            name: 'StageCraft',
            tags: ['공연', '연출', '무대기술'],
            size: 30,
            trust: 71,
            leader: '최유진',
            phone: '010-4567-8901',
            email: 'stagecraft@school.kr',
            description: '무대 기술과 공연 연출을 전문으로 하는 동아리입니다. 조명, 음향, 무대 안전 등을 담당합니다.',
            portfolio: ['합동공연 운영', '무대 안전 체크리스트']
        },
        {
            id: 'c5',
            school: '부산과학고',
            region: '부산',
            name: 'BioEdge',
            tags: ['바이오', '환경', '실험'],
            size: 16,
            trust: 84,
            leader: '정하늘',
            phone: '010-5678-9012',
            email: 'bioedge@school.kr',
            description: '환경과 바이오 분야를 연구하는 실험 동아리입니다. 침입식물 연구와 바이오차 실험을 진행합니다.',
            portfolio: ['침입식물 프로젝트', '바이오차 실험']
        },
        {
            id: 'c6',
            school: '경기과학고',
            region: '경기',
            name: 'Policy & Debate',
            tags: ['정책', 'MUN', '리서치'],
            size: 26,
            trust: 79,
            leader: '한소희',
            phone: '010-6789-0123',
            email: 'pnd@school.kr',
            description: '정책 토론과 모의유엔(MUN) 활동을 하는 동아리입니다. 사회 이슈에 대한 깊이 있는 리서치를 수행합니다.',
            portfolio: ['모의국회 아젠다', '대회 운영']
        },
    ],
    links: [
        ['c1', 'c3'],
        ['c1', 'c6'],
        ['c2', 'c6'],
        ['c2', 'c5'],
        ['c3', 'c6'],
        ['c4', 'c1']
    ],
    collabs: [
        {
            id: 'p1',
            club_id: 'c1',
            type: '통합 대회',
            title: '전국 BM 케이스 스프린트',
            dateStart: '2026-02-15',
            dateEnd: '2026-02-17',
            time: '10:00',
            method: 'offline',
            address: '서울시 강남구 테헤란로 123',
            region: '전국',
            budget: '스폰서 유치',
            notes: '참가자 50명 예상, 점심 제공',
            status: 'open'
        },
        {
            id: 'p2',
            club_id: 'c2',
            type: '연합 포럼',
            title: 'AI 안전/윤리? 대신 시스템 리스크 세미나',
            dateStart: '2026-02-20',
            method: 'online',
            onlineInfo: 'Zoom 링크: https://zoom.us/j/1234567890 (비밀번호: ai2026)',
            region: '수도권',
            budget: '0원',
            notes: '연사 섭외 진행 중',
            status: 'open'
        },
        {
            id: 'p3',
            club_id: 'c5',
            type: '공동 연구',
            title: '환경 데이터 수집 봉사 + 리포트 발간',
            dateStart: '2026-03-01',
            dateEnd: '2026-03-03',
            method: 'offline',
            address: '부산시 해운대구 현장 집합',
            region: '부산/경남',
            budget: '소액 교통비',
            status: 'open'
        },
        {
            id: 'p4',
            club_id: 'c4',
            type: '기타',
            title: '무대기술 교류전: 조명/음향/안전',
            dateStart: '2026-01-10',
            method: 'offline',
            address: '광주 문화예술회관',
            region: '전라권',
            budget: '대관 협의',
            status: 'completed'
        },
        {
            id: 'p5',
            club_id: 'c1',
            type: '통합 대회',
            title: '제1회 전국 고교 창업 경진대회',
            dateStart: '2026-03-20',
            dateEnd: '2026-03-22',
            method: 'offline',
            address: '서울 코엑스',
            region: '서울',
            budget: '참가비 무료',
            status: 'open'
        },
        {
            id: 'p6',
            club_id: 'c2',
            type: '연합 포럼',
            title: '미래 과학 기술 포럼',
            dateStart: '2026-04-05',
            method: 'online',
            region: '전국',
            budget: '무료',
            status: 'open'
        },
        {
            id: 'p7',
            club_id: 'c5',
            type: '공동 연구',
            title: '우리 동네 수질 오염 지도 만들기',
            dateStart: '2026-03-15',
            dateEnd: '2026-05-15',
            method: 'offline',
            region: '경상권',
            budget: '지원금 지급',
            status: 'open'
        },
    ],
    projects: [
        {
            id: 'r1',
            title: '전국 BM 케이스 스프린트',
            members: ['PRAGMATISM', 'Quant Forge'],
            progress: 48,
            artifacts: ['운영안 v2', '심사표 v1', '랜딩 카피'],
            next: '스폰서 콜 리스트 30개 작성'
        },
        {
            id: 'r2',
            title: '환경 데이터 수집 봉사 + 리포트',
            members: ['BioEdge', 'S2 Lab'],
            progress: 26,
            artifacts: ['측정 프로토콜', '데이터 시트'],
            next: '데이터 수집 주말 확정'
        },
    ],
    templates: [
        {
            id: 't1',
            name: '공문: 타학교 동아리 협업 요청',
            desc: '학교/담당자/목적/일시/요청사항 입력 → 즉시 생성',
            fields: ['발신 학교', '수신 학교', '동아리명', '담당자', '일시', '목적', '요청사항']
        },
        {
            id: 't2',
            name: '협약서(MOU): 공동행사 운영',
            desc: '권한/역할/책임/저작권/안전/예산 분담을 기본 포함',
            fields: ['기관 A', '기관 B', '행사명', '기간', '역할 분담', '비용 분담', '분쟁 해결']
        },
        {
            id: 't3',
            name: '대관 요청서: 강당/교실',
            desc: '장소/시간/장비/안전관리/책임자 명시',
            fields: ['장소', '사용일시', '인원', '장비', '안전계획', '책임자']
        },
    ],
    applications: [],
    ratings: [],
    clubJoinRequests: []
};

const STORAGE_KEY = 'moyeora_demo_state';

export function loadState(): DemoState {
    if (typeof window === 'undefined') return JSON.parse(JSON.stringify(DEMO_DATA));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEMO_DATA));
    try {
        const parsed = JSON.parse(raw) as Partial<DemoState> & Record<string, any>;

        const today = new Date().toISOString().slice(0, 10);

        const migratedCollabs = Array.isArray(parsed.collabs)
            ? parsed.collabs.map((c: any) => {
                if (c?.dateStart) return c;
                return {
                    id: c?.id ?? 'p_migrated',
                    club_id: c?.club_id ?? 'c1',
                    type: c?.type ?? '기타',
                    title: c?.title ?? '협업 모집',
                    dateStart: today,
                    dateEnd: undefined,
                    time: undefined,
                    method: 'offline',
                    address: undefined,
                    onlineInfo: undefined,
                    region: c?.region ?? '전국',
                    budget: c?.budget ?? '협의',
                    notes: c?.notes,
                    status: c?.status ?? 'open',
                };
            })
            : DEMO_DATA.collabs;

        return {
            ...JSON.parse(JSON.stringify(DEMO_DATA)),
            ...parsed,
            clubs: Array.isArray(parsed.clubs) ? (parsed.clubs as any) : DEMO_DATA.clubs,
            links: Array.isArray(parsed.links) ? (parsed.links as any) : DEMO_DATA.links,
            collabs: migratedCollabs as any,
            projects: Array.isArray(parsed.projects) ? (parsed.projects as any) : DEMO_DATA.projects,
            templates: Array.isArray(parsed.templates) ? (parsed.templates as any) : DEMO_DATA.templates,
            applications: Array.isArray((parsed as any).applications) ? ((parsed as any).applications as any) : [],
            ratings: Array.isArray((parsed as any).ratings) ? ((parsed as any).ratings as any) : [],
            clubJoinRequests: Array.isArray((parsed as any).clubJoinRequests) ? ((parsed as any).clubJoinRequests as any) : [],
        } as DemoState;
    } catch {
        return JSON.parse(JSON.stringify(DEMO_DATA));
    }
}

export function saveState(state: DemoState): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
}

export function resetState(): DemoState {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
    return JSON.parse(JSON.stringify(DEMO_DATA));
}

export function generateDocument(templateId: string, values: string[]): string {
    const today = new Date().toISOString().slice(0, 10);

    if (templateId === 't1') {
        const [fromSchool, toSchool, club, person, when, purpose, req] = values;
        return `공문

발신: ${fromSchool}
수신: ${toSchool}
제목: 동아리 협업 요청의 건
일자: ${today}

1. 귀 교의 무궁한 발전을 기원합니다.
2. ${fromSchool} ${club}는(은) ${purpose}을(를) 목적으로 귀 교와의 협업을 요청드립니다.
3. 협업 일정(안): ${when}
4. 요청사항: ${req}
5. 담당자: ${person}

붙임: 협업 개요 1부. 끝.`;
    }

    if (templateId === 't2') {
        const [a, b, event, period, roles, cost, dispute] = values;
        return `협약서(MOU)

본 협약은 ${a}와(과) ${b}가(이) '${event}' 운영을 위해 아래와 같이 체결한다.

1. 기간: ${period}
2. 역할 분담: ${roles}
3. 비용 분담: ${cost}
4. 안전 및 책임: 각 기관은 행사 운영 중 안전수칙 준수 및 관리 책임을 다한다.
5. 저작권/산출물: 공동 제작 산출물의 사용 범위는 상호 합의에 따른다.
6. 분쟁 해결: ${dispute}

체결일: ${today}
서명:
- ${a} (서명)
- ${b} (서명)`;
    }

    if (templateId === 't3') {
        const [place, when, people, gear, safety, owner] = values;
        return `대관 요청서

요청 장소: ${place}
사용 일시: ${when}
예상 인원: ${people}
필요 장비: ${gear}
안전 계획: ${safety}
책임자: ${owner}

상기 내용으로 대관을 요청드립니다.
일자: ${today}`;
    }

    return '템플릿 출력';
}
