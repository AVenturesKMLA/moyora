// 동아리 멤버십 결제 관련 공통 설정
// 실제 결제(PortOne/토스 등)로 교체하더라도 이 상수/라벨은 그대로 사용합니다.

export const CLUB_MONTHLY_PRICE = 5900; // 동아리 당 월 요금 (KRW)
export const CLUB_PLAN_ID = 'club_monthly';
export const CLUB_PLAN_LABEL = '동아리 멤버십';

/** 1,234 → "1,234" (원화 표기용) */
export function formatKRW(amount: number): string {
    return amount.toLocaleString('ko-KR');
}

/**
 * 기준일에서 1개월 뒤를 반환합니다 (다음 청구일 계산용).
 * 말일 보정: 예) 1/31 + 1개월 → 2/28(윤년 2/29). 넘치는 경우 해당 월 말일로 맞춥니다.
 */
export function addOneMonth(from: Date): Date {
    const d = new Date(from);
    const day = d.getDate();
    d.setDate(1); // 말일 오버플로우 방지
    d.setMonth(d.getMonth() + 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
    return d;
}
