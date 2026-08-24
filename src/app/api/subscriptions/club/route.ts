import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { ClubPayment, Subscription } from '@/models';
import { authOptions } from '@/lib/auth';
import { CLUB_MONTHLY_PRICE, CLUB_PLAN_ID, CLUB_PLAN_LABEL, addOneMonth } from '@/lib/billing';
import { isPortOneConfigured, isBillingKeyValid, chargeWithBillingKey } from '@/lib/portone';

// POST: 정기결제(구독) 시작
//   body: { billingKey }  — 클라이언트에서 카드 빌링키를 발급받아 전달
//   서버가 빌링키로 "첫 달"을 즉시 청구하고, 성공 시 구독을 생성합니다.
//   반환한 paymentId 로 /api/clubs 가 동아리 개설을 진행합니다.
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as { id?: string; name?: string; email?: string } | undefined;
        const userId = user?.id;
        if (!userId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        if (!isPortOneConfigured()) {
            return NextResponse.json(
                { success: false, message: '정기결제가 설정되어 있지 않습니다.' },
                { status: 503 }
            );
        }

        const body = await request.json().catch(() => ({} as { billingKey?: string }));
        const billingKey = typeof body?.billingKey === 'string' ? body.billingKey : '';
        if (!billingKey) {
            return NextResponse.json(
                { success: false, message: '빌링키가 필요합니다.' },
                { status: 400 }
            );
        }

        await connectDB();

        // 빌링키 유효성 확인
        const valid = await isBillingKeyValid(billingKey);
        if (!valid) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 결제수단입니다. 다시 시도해주세요.' },
                { status: 400 }
            );
        }

        // 첫 달 즉시 청구
        const paymentId = `club_${crypto.randomUUID()}`;
        const charge = await chargeWithBillingKey({
            billingKey,
            paymentId,
            amount: CLUB_MONTHLY_PRICE,
            orderName: CLUB_PLAN_LABEL,
            currency: 'KRW',
            customer: { id: userId, name: user?.name, email: user?.email },
        });

        if (!charge.ok) {
            return NextResponse.json(
                { success: false, message: charge.reason || '첫 결제에 실패했습니다.' },
                { status: 402 }
            );
        }

        const now = new Date();

        // 결제 기록
        await ClubPayment.create({
            userId,
            amount: CLUB_MONTHLY_PRICE,
            currency: 'KRW',
            plan: CLUB_PLAN_ID,
            provider: 'portone',
            paymentId,
            status: 'paid',
        });

        // 구독 생성 (다음 청구일 = 한 달 뒤)
        await Subscription.create({
            userId,
            provider: 'portone',
            billingKey,
            plan: CLUB_PLAN_ID,
            amount: CLUB_MONTHLY_PRICE,
            currency: 'KRW',
            status: 'active',
            nextBillingDate: addOneMonth(now),
            lastChargedAt: now,
            lastPaymentId: paymentId,
            failedAttempts: 0,
        });

        return NextResponse.json({
            success: true,
            message: '정기결제가 시작되었습니다',
            paymentId,
            amount: CLUB_MONTHLY_PRICE,
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        return NextResponse.json(
            { success: false, message: '정기결제 처리 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

// GET: 내 구독 목록 조회 (관리 UI 용)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as { id?: string } | undefined)?.id;
        if (!userId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        await connectDB();

        const subs = await Subscription.find({ userId })
            .populate('clubId', 'clubName')
            .sort({ createdAt: -1 })
            .lean();

        const subscriptions = subs.map((s: any) => ({
            id: s._id.toString(),
            clubName: s.clubId?.clubName ?? null,
            plan: s.plan,
            amount: s.amount,
            currency: s.currency,
            status: s.status,
            nextBillingDate: s.nextBillingDate,
            lastChargedAt: s.lastChargedAt ?? null,
        }));

        return NextResponse.json({ success: true, subscriptions });
    } catch (error) {
        console.error('Fetch subscriptions error:', error);
        return NextResponse.json(
            { success: false, message: '구독 정보를 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
