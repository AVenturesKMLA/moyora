// PortOne(포트원) V2 서버 연동 헬퍼.
// 결제창(브라우저 SDK)에서 결제가 완료되면, 서버가 이 함수로 포트원 API를 호출해
// 실제 결제 상태와 금액을 "검증"한 뒤에만 우리 DB에 결제를 기록합니다.
//
// 필요한 환경변수(.env.local):
//   PORTONE_API_SECRET               - 포트원 콘솔 > 결제 연동 > API Secret (서버 전용)
//   NEXT_PUBLIC_PORTONE_STORE_ID     - 상점 아이디 (클라이언트에서도 사용)
//   NEXT_PUBLIC_PORTONE_CHANNEL_KEY  - 결제 채널 키 (클라이언트에서도 사용)

const PORTONE_API_BASE = 'https://api.portone.io';

export interface PortOnePayment {
    id: string;
    status: string; // 'PAID' | 'READY' | 'FAILED' | 'CANCELLED' | ...
    amount: {
        total: number;
        paid?: number;
    };
    currency: string; // 'KRW'
    orderName?: string;
}

/** 포트원 실결제가 설정되어 있는지 (API Secret 유무) */
export function isPortOneConfigured(): boolean {
    return Boolean(process.env.PORTONE_API_SECRET);
}

/**
 * paymentId 로 포트원 결제 단건을 조회합니다.
 * 실패 시 null 을 반환합니다.
 */
export async function getPortOnePayment(paymentId: string): Promise<PortOnePayment | null> {
    const apiSecret = process.env.PORTONE_API_SECRET;
    if (!apiSecret) return null;

    const res = await fetch(
        `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`,
        {
            headers: {
                Authorization: `PortOne ${apiSecret}`,
            },
            // 결제 검증은 항상 최신값이어야 하므로 캐시하지 않음
            cache: 'no-store',
        }
    );

    if (!res.ok) {
        console.error('PortOne getPayment failed:', res.status, await res.text().catch(() => ''));
        return null;
    }

    return (await res.json()) as PortOnePayment;
}

export interface VerifyResult {
    ok: boolean;
    reason?: string;
    payment?: PortOnePayment;
}

/**
 * 결제가 실제로 완료(PAID)되었고 금액/통화가 기대값과 일치하는지 검증합니다.
 */
export async function verifyPortOnePayment(
    paymentId: string,
    expectedAmount: number,
    expectedCurrency = 'KRW'
): Promise<VerifyResult> {
    const payment = await getPortOnePayment(paymentId);
    if (!payment) {
        return { ok: false, reason: '결제 정보를 조회할 수 없습니다.' };
    }

    if (payment.status !== 'PAID') {
        return { ok: false, reason: `결제가 완료되지 않았습니다 (상태: ${payment.status})`, payment };
    }

    if (payment.currency !== expectedCurrency) {
        return { ok: false, reason: '결제 통화가 일치하지 않습니다.', payment };
    }

    if (payment.amount?.total !== expectedAmount) {
        return { ok: false, reason: '결제 금액이 일치하지 않습니다.', payment };
    }

    return { ok: true, payment };
}

// ----------------------------------------------------------------------------
// 빌링키(정기결제) 관련
// ----------------------------------------------------------------------------

export interface BillingKeyCustomer {
    id?: string;
    name?: string;
    email?: string;
}

export interface BillingKeyChargeResult {
    ok: boolean;
    reason?: string;
    paymentId?: string;
    payment?: PortOnePayment;
}

/**
 * 빌링키가 유효(발급/등록 상태)한지 확인합니다.
 */
export async function isBillingKeyValid(billingKey: string): Promise<boolean> {
    const apiSecret = process.env.PORTONE_API_SECRET;
    if (!apiSecret) return false;

    const res = await fetch(
        `${PORTONE_API_BASE}/billing-keys/${encodeURIComponent(billingKey)}`,
        {
            headers: { Authorization: `PortOne ${apiSecret}` },
            cache: 'no-store',
        }
    );

    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    // status 가 ISSUED 면 사용 가능. (DELETED 등은 사용 불가)
    return data?.status === 'ISSUED';
}

/**
 * 저장된 빌링키로 실제 청구(정기결제 1회)를 실행하고, 그 결과를 검증합니다.
 * paymentId 는 요청마다 고유해야 하므로 호출측에서 생성해 전달합니다.
 */
export async function chargeWithBillingKey(params: {
    billingKey: string;
    paymentId: string;
    amount: number;
    orderName: string;
    currency?: string;
    customer?: BillingKeyCustomer;
}): Promise<BillingKeyChargeResult> {
    const apiSecret = process.env.PORTONE_API_SECRET;
    if (!apiSecret) {
        return { ok: false, reason: '결제가 설정되지 않았습니다.' };
    }

    const { billingKey, paymentId, amount, orderName, currency = 'KRW', customer } = params;

    // 포트원 V2 REST 의 customer 스키마에 맞게 변환 (name 은 { full } 객체)
    let customerPayload: Record<string, unknown> | undefined;
    if (customer && (customer.id || customer.name || customer.email)) {
        customerPayload = {
            ...(customer.id ? { id: customer.id } : {}),
            ...(customer.name ? { name: { full: customer.name } } : {}),
            ...(customer.email ? { email: customer.email } : {}),
        };
    }

    const res = await fetch(
        `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}/billing-key`,
        {
            method: 'POST',
            headers: {
                Authorization: `PortOne ${apiSecret}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                billingKey,
                orderName,
                amount: { total: amount },
                currency,
                ...(customerPayload ? { customer: customerPayload } : {}),
            }),
            cache: 'no-store',
        }
    );

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('PortOne billing-key charge failed:', res.status, text);
        return { ok: false, reason: `청구 실패 (${res.status})`, paymentId };
    }

    // 청구 성공 후, 실제 결제 상태/금액을 재검증
    const verification = await verifyPortOnePayment(paymentId, amount, currency);
    if (!verification.ok) {
        return { ok: false, reason: verification.reason, paymentId, payment: verification.payment };
    }

    return { ok: true, paymentId, payment: verification.payment };
}

/**
 * 빌링키를 삭제(구독 해지 시)합니다. 실패해도 치명적이지 않으므로 boolean 만 반환.
 */
export async function deleteBillingKey(billingKey: string): Promise<boolean> {
    const apiSecret = process.env.PORTONE_API_SECRET;
    if (!apiSecret) return false;

    const res = await fetch(
        `${PORTONE_API_BASE}/billing-keys/${encodeURIComponent(billingKey)}`,
        {
            method: 'DELETE',
            headers: { Authorization: `PortOne ${apiSecret}` },
            cache: 'no-store',
        }
    );

    return res.ok;
}
