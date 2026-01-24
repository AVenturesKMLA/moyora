import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User, Contest, Forum, CoResearch, Club, Participant, Notification, Schedule } from '@/models';
import mongoose from 'mongoose';

// DELETE - Delete a user and all their data (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 사용자 ID입니다' },
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

        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // Prevent deleting superadmin
        if (userToDelete.role === 'superadmin') {
            return NextResponse.json(
                { success: false, message: '슈퍼관리자는 삭제할 수 없습니다' },
                { status: 403 }
            );
        }

        // Delete all user data
        await Promise.all([
            Contest.deleteMany({ userId: id }),
            Forum.deleteMany({ userId: id }),
            CoResearch.deleteMany({ userId: id }),
            Club.deleteMany({ presidentId: id }),
            Participant.deleteMany({ userId: id }),
            Notification.deleteMany({ userId: id }),
            Schedule.deleteMany({ userId: id }),
        ]);

        // Delete the user
        await User.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: '사용자가 삭제되었습니다',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { success: false, message: '사용자 삭제 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
