import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { Subscription, ClubPayment, User } from '@/models';
import { CLUB_PLAN_LABEL, addOneMonth } from '@/lib/billing';
import { isPortOneConfigured, chargeWithBillingKey } from '@/lib/portone';

// 정기결제 자동 청구 크론.
// 청구 예정일(nextBillingDate)이 도래한 active 구독을 빌링키로 자동 청구합니다.
// 매일 실행되며, 실패 시 다음 실행에서 재시도합니다. 연속 3회 실패하면 past_due 로 전환합니다.
// vercel.json 의 crons 에 등록되어 있습니다.

const MAX_FAILED_ATTEMPTS = 3;

function authorizeCronRequest(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (!cronSecret) {
        return NextResponse.json(
            { success: false, message: 'Server misconfigured: CRON_SECRET is missing' },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return null;
}

async function runBillingJob(request: NextRequest) {
    try {
        const unauthorized = authorizeCronRequest(request);
        if (unauthorized) return unauthorized;

        if (!isPortOneConfigured()) {
            return NextResponse.json({
                success: true,
                message: 'PortOne not configured; skipping billing',
                charged: 0,
            });
        }

        await connectDB();

        const now = new Date();

        // 청구 대상: active 이고 청구 예정일이 지난 구독
        const due = await Subscription.find({
            status: 'active',
            nextBillingDate: { $lte: now },
        });

        let charged = 0;
        let failed = 0;

        for (const sub of due) {
            const paymentId = `club_${crypto.randomUUID()}`;

            // 청구자(고객) 정보
            const owner = await User.findById(sub.userId).select('name email').lean<{ name?: string; email?: string }>();

            const result = await chargeWithBillingKey({
                billingKey: sub.billingKey,
                paymentId,
                amount: sub.amount,
                orderName: CLUB_PLAN_LABEL,
                currency: sub.currency,
                customer: {
                    id: sub.userId.toString(),
                    name: owner?.name,
                    email: owner?.email,
                },
            });

            if (result.ok) {
                await ClubPayment.create({
                    userId: sub.userId,
                    clubId: sub.clubId,
                    amount: sub.amount,
                    currency: sub.currency,
                    plan: sub.plan,
                    provider: 'portone',
                    paymentId,
                    status: 'paid',
                });

                sub.nextBillingDate = addOneMonth(sub.nextBillingDate);
                sub.lastChargedAt = now;
                sub.lastPaymentId = paymentId;
                sub.failedAttempts = 0;
                await sub.save();
                charged++;
            } else {
                sub.failedAttempts = (sub.failedAttempts ?? 0) + 1;
                if (sub.failedAttempts >= MAX_FAILED_ATTEMPTS) {
                    sub.status = 'past_due';
                }
                await sub.save();
                failed++;
                console.error(
                    `Billing failed for subscription ${sub._id} (attempt ${sub.failedAttempts}): ${result.reason}`
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: `Charged ${charged}, failed ${failed} of ${due.length} due subscriptions`,
            charged,
            failed,
            due: due.length,
        });
    } catch (error) {
        console.error('Billing cron error:', error);
        return NextResponse.json({ success: false, message: 'Billing job failed' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    return runBillingJob(request);
}

export async function POST(request: NextRequest) {
    return runBillingJob(request);
}
