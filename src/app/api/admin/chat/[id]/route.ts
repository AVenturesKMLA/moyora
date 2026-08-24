export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { User, GlobalMessage } from '@/models';
import { authOptions } from '@/lib/auth';

// DELETE - 전체 채팅 메시지 1건 삭제 (superadmin 전용)
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
                { success: false, message: '유효하지 않은 메시지 ID입니다' },
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

        const deleted = await GlobalMessage.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json(
                { success: false, message: '메시지를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '메시지가 삭제되었습니다',
        });
    } catch (error) {
        console.error('Delete chat message error:', error);
        return NextResponse.json(
            { success: false, message: '메시지 삭제 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
