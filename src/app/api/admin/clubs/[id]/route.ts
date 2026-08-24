export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import {
    User,
    Club,
    ClubMember,
    ClubApplication,
    ClubMessage,
    ClubRating,
    ClubPayment,
    Subscription,
} from '@/models';
import { authOptions } from '@/lib/auth';

// DELETE - Delete any club (superadmin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 동아리 ID입니다' },
                { status: 400 }
            );
        }

        await connectDB();

        const admin = await User.findOne({ email: session.user.email });
        if (!admin || admin.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, message: '관리자 권한이 필요합니다' },
                { status: 403 }
            );
        }

        const club = await Club.findByIdAndDelete(id);
        if (!club) {
            return NextResponse.json(
                { success: false, message: '동아리를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // 동아리에 딸린 데이터 정리
        const [members, applications, messages, ratings] = await Promise.all([
            ClubMember.deleteMany({ clubId: id }),
            ClubApplication.deleteMany({ clubId: id }),
            ClubMessage.deleteMany({ clubId: id }),
            ClubRating.deleteMany({ targetClubId: id }),
        ]);

        // 결제/구독 기록은 정산 이력이라 삭제하지 않고 동아리 연결만 해제한다
        await Promise.all([
            ClubPayment.updateMany({ clubId: id }, { $unset: { clubId: '' } }),
            Subscription.updateMany({ clubId: id }, { $unset: { clubId: '' } }),
        ]);

        return NextResponse.json({
            success: true,
            message: `'${club.clubName}' 동아리가 삭제되었습니다`,
            deleted: {
                members: members.deletedCount,
                applications: applications.deletedCount,
                messages: messages.deletedCount,
                ratings: ratings.deletedCount,
            },
        });
    } catch (error) {
        console.error('Delete club error:', error);
        return NextResponse.json(
            { success: false, message: '동아리 삭제 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
