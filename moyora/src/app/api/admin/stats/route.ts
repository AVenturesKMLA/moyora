export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User, Contest, Forum, CoResearch, Club, Participant } from '@/models';

// GET - Fetch platform statistics (admin only)
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

        // Check if user is superadmin
        const user = await User.findOne({ email: session.user.email });
        if (!user || user.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, message: '관리자 권한이 필요합니다' },
                { status: 403 }
            );
        }

        // Get all counts
        const [
            totalUsers,
            totalContests,
            totalForums,
            totalCoResearch,
            totalClubs,
            totalParticipants,
            pendingParticipants,
        ] = await Promise.all([
            User.countDocuments(),
            Contest.countDocuments(),
            Forum.countDocuments(),
            CoResearch.countDocuments(),
            Club.countDocuments(),
            Participant.countDocuments(),
            Participant.countDocuments({ status: 'pending' }),
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents: totalContests + totalForums + totalCoResearch,
                totalContests,
                totalForums,
                totalCoResearch,
                totalClubs,
                totalParticipants,
                pendingParticipants,
            },
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { success: false, message: '통계 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
