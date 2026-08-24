export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User, GlobalMessage } from '@/models';
import { authOptions } from '@/lib/auth';

async function requireSuperadmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 }) };
    }

    await connectDB();

    const admin = await User.findOne({ email: session.user.email });
    if (!admin || admin.role !== 'superadmin') {
        return { error: NextResponse.json({ success: false, message: '관리자 권한이 필요합니다' }, { status: 403 }) };
    }

    return { admin };
}

// GET - 전체 채팅 메시지 목록 (최신순, superadmin 전용)
export async function GET() {
    try {
        const { error } = await requireSuperadmin();
        if (error) return error;

        const messages = await GlobalMessage.find({})
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();

        return NextResponse.json({
            success: true,
            messages: messages.map((m) => ({
                _id: String(m._id),
                userId: String(m.userId),
                userName: m.userName,
                schoolName: m.schoolName || '',
                content: m.content,
                createdAt: m.createdAt,
            })),
            count: messages.length,
        });
    } catch (error) {
        console.error('Admin chat list error:', error);
        return NextResponse.json(
            { success: false, message: '메시지 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

// DELETE - 전체 채팅 비우기 (superadmin 전용)
export async function DELETE() {
    try {
        const { error } = await requireSuperadmin();
        if (error) return error;

        const result = await GlobalMessage.deleteMany({});

        return NextResponse.json({
            success: true,
            message: `전체 채팅 메시지 ${result.deletedCount}건을 삭제했습니다`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Admin chat clear error:', error);
        return NextResponse.json(
            { success: false, message: '메시지 삭제 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
