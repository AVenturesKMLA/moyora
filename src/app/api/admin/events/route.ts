import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User, Contest, Forum, CoResearch } from '@/models';

// GET - Fetch all events (admin only)
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

        // Fetch all events
        const [contests, forums, coResearchProjects] = await Promise.all([
            Contest.find({}).lean(),
            Forum.find({}).lean(),
            CoResearch.find({}).lean(),
        ]);

        // Combine and normalize events
        const allEvents = [
            ...contests.map((e) => ({
                _id: e._id,
                eventType: 'contest' as const,
                eventName: e.contestName,
                eventDate: e.contestDate,
                eventPlace: e.contestPlace,
                hostName: e.hostName,
                createdAt: e.createdAt,
            })),
            ...forums.map((e) => ({
                _id: e._id,
                eventType: 'forum' as const,
                eventName: e.forumName,
                eventDate: e.forumDate,
                eventPlace: e.forumPlace,
                hostName: e.hostName,
                createdAt: e.createdAt,
            })),
            ...coResearchProjects.map((e) => ({
                _id: e._id,
                eventType: 'co-research' as const,
                eventName: e.researchName,
                eventDate: e.researchDate,
                eventPlace: e.researchPlace,
                hostName: e.hostName,
                createdAt: e.createdAt,
            })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            success: true,
            events: allEvents,
            count: allEvents.length,
        });
    } catch (error) {
        console.error('Admin events error:', error);
        return NextResponse.json(
            { success: false, message: '이벤트 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
