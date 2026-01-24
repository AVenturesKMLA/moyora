import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

// GET - Fetch all users (admin only)
export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
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

        // Fetch all users, excluding password field
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            users,
            count: users.length,
        });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json(
            { success: false, message: '사용자 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
