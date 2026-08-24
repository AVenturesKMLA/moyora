export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User, Club, ClubMember } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Fetch all clubs (superadmin only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
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

        const clubs = await Club.find({}).sort({ createdAt: -1 }).lean();

        // 동아리별 멤버 수를 한 번의 집계로 조회
        const memberCounts = await ClubMember.aggregate<{ _id: unknown; count: number }>([
            { $group: { _id: '$clubId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(
            memberCounts.map((entry) => [String(entry._id), entry.count])
        );

        return NextResponse.json({
            success: true,
            clubs: clubs.map((club) => ({
                ...club,
                memberCount: countMap.get(String(club._id)) ?? 0,
            })),
            count: clubs.length,
        });
    } catch (error) {
        console.error('Admin clubs error:', error);
        return NextResponse.json(
            { success: false, message: '동아리 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
