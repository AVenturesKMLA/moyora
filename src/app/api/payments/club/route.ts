import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { ClubPayment } from '@/models';
import { authOptions } from '@/lib/auth';
import { CLUB_MONTHLY_PRICE, CLUB_PLAN_ID } from '@/lib/billing';
import { isPortOneConfigured, verifyPortOnePayment } from '@/lib/portone';

// POST: 동아리 개설용 결제 처리
//
// 두 가지 모드로 동작합니다.
//  1) 실결제(PortOne): 클라이언트 결제창에서 결제 완료 후 body 에 { paymentId } 를 전달.
//     서버가 포트원 API 로 결제 상태/금액을 "검증"한 뒤에만 결제를 기록합니다.
//  2) 데모: 포트원이 설정되어 있지 않거나 paymentId 가 없는 경우, 실제 청구 없이 성공 처리.
//     (로컬 개발 및 자격증명 미설정 상태에서 앱이 계속 동작하도록 하기 위함)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as { id?: string } | undefined)?.id;
        if (!userId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        await connectDB();

        // body 파싱 (없을 수도 있음)
        const body = await request.json().catch(() => ({} as { paymentId?: string }));
        const clientPaymentId = typeof body?.paymentId === 'string' ? body.paymentId : undefined;

        // --- 1) 실결제(PortOne) 검증 ---
        if (isPortOneConfigured() && clientPaymentId) {
            // 동일 paymentId 중복 처리 방지
            const existing = await ClubPayment.findOne({ paymentId: clientPaymentId });
            if (existing) {
                if (existing.status === 'paid') {
                    return NextResponse.json({
                        success: true,
                        message: '이미 완료된 결제입니다',
                        paymentId: existing.paymentId,
                        amount: existing.amount,
                    });
                }
                return NextResponse.json(
                    { success: false, message: '이미 처리된 결제 건입니다' },
                    { status: 409 }
                );
            }

            const verification = await verifyPortOnePayment(clientPaymentId, CLUB_MONTHLY_PRICE, 'KRW');
            if (!verification.ok) {
                return NextResponse.json(
                    { success: false, message: verification.reason || '결제 검증에 실패했습니다.' },
                    { status: 400 }
                );
            }

            await ClubPayment.create({
                userId,
                amount: CLUB_MONTHLY_PRICE,
                currency: 'KRW',
                plan: CLUB_PLAN_ID,
                provider: 'portone',
                paymentId: clientPaymentId,
                status: 'paid',
            });

            return NextResponse.json({
                success: true,
                message: '결제가 완료되었습니다',
                paymentId: clientPaymentId,
                amount: CLUB_MONTHLY_PRICE,
            });
        }

        // --- 2) 데모 결제: 실제 청구 없이 성공 처리 ---
        const paymentId = `mock_${crypto.randomUUID()}`;
        await ClubPayment.create({
            userId,
            amount: CLUB_MONTHLY_PRICE,
            currency: 'KRW',
            plan: CLUB_PLAN_ID,
            provider: 'mock',
            paymentId,
            status: 'paid',
        });

        return NextResponse.json({
            success: true,
            message: '결제가 완료되었습니다 (데모)',
            paymentId,
            amount: CLUB_MONTHLY_PRICE,
            demo: true,
        });
    } catch (error) {
        console.error('Club payment error:', error);
        return NextResponse.json(
            { success: false, message: '결제 처리 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
