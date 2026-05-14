/**
 * 동아리 분야 — 홈·탐색 필터·등록 폼에서 동일한 `clubTheme` 값을 사용합니다.
 * (DB에 남아 있을 수 있는 옛 코드 값은 `dbKeysForThemeFilter` / `clubThemeMatchesFilter`로 처리)
 */
export const CLUB_THEME_OPTIONS = [
    { key: '과학', label: '과학' },
    { key: '공학', label: '공학' },
    { key: '수학', label: '수학' },
    { key: '인문', label: '인문' },
    { key: '사회', label: '사회' },
    { key: '예술', label: '예술/디자인' },
    { key: '체육', label: '운동' },
    { key: '경제', label: '경제' },
    { key: '의학', label: '의학' },
    { key: '창업', label: '창업' },
    { key: '기타', label: '기타' },
] as const;

export type ClubThemeKey = (typeof CLUB_THEME_OPTIONS)[number]['key'];

const LEGACY_THEME_LABEL: Record<string, string> = {
    science: '과학·공학',
    math: '수학',
    humanities: '인문·사회',
    arts: '예술·체육',
    startup: '창업·경영',
    other: '기타',
};

/** DB에 저장된 `clubTheme` 값 → UI에 보여줄 문자열 */
export function displayLabelForStoredClubTheme(theme: string | undefined): string {
    if (!theme?.trim()) return '분야 미정';
    const t = theme.trim();
    const opt = CLUB_THEME_OPTIONS.find((o) => o.key === t);
    if (opt) return opt.label;
    return LEGACY_THEME_LABEL[t] || t;
}

/** 홈·통계에서 한 필터(캐논 키)에 묶일 수 있는 DB `clubTheme` / `_id` 값들 */
export function dbKeysForThemeFilter(filterKey: string): string[] {
    const map: Record<string, string[]> = {
        과학: ['과학', 'science'],
        공학: ['공학', 'science'],
        수학: ['수학', 'math'],
        인문: ['인문', 'humanities'],
        사회: ['사회', 'humanities'],
        예술: ['예술', 'arts'],
        체육: ['체육', 'arts'],
        경제: ['경제', 'startup'],
        창업: ['창업', 'startup'],
        의학: ['의학'],
        기타: ['기타', 'other', '학술', '봉사', '언론'],
    };
    return map[filterKey] ?? [filterKey];
}

export function clubThemeMatchesFilter(clubTheme: string | undefined, filterKey: string): boolean {
    if (filterKey === 'all') return true;
    const t = (clubTheme || '').trim();
    if (!t) return false;
    return dbKeysForThemeFilter(filterKey).includes(t);
}
