import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Subscription } from '@/models';
import { authOptions } from '@/lib/auth';
import { deleteBillingKey } from '@/lib/portone';

// DELETE: 구독 해지
// 상태를 'canceled' 로 바꾸고 빌링키를 삭제합니다.
// (이미 청구된 이번 달 이용분은 환불하지 않으며, 다음 청구부터 중단됩니다.)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const userId = (session?.user as { id?: string } | undefined)?.id;
        if (!userId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        await connectDB();

        const subscription = await Subscription.findOne({ _id: id, userId });
        if (!subscription) {
            return NextResponse.json(
                { success: false, message: '구독을 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        if (subscription.status === 'canceled') {
            return NextResponse.json({ success: true, message: '이미 해지된 구독입니다' });
        }

        // 포트원 빌링키 삭제 (실패해도 해지는 진행)
        if (subscription.billingKey) {
            await deleteBillingKey(subscription.billingKey).catch(() => false);
        }

        subscription.status = 'canceled';
        subscription.canceledAt = new Date();
        await subscription.save();

        return NextResponse.json({ success: true, message: '정기결제가 해지되었습니다' });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
            { success: false, message: '해지 처리 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
