import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, User, Participant } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Fetch all events hosted by the current user
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

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        const [contests, forums, coResearchProjects] = await Promise.all([
            Contest.find({ userId: user._id }).lean(),
            Forum.find({ userId: user._id }).lean(),
            CoResearch.find({ userId: user._id }).lean(),
        ]);

        const getParticipantCount = async (eventType: string, eventId: string) => {
            return Participant.countDocuments({ eventType, eventId });
        };

        const contestsWithCounts = await Promise.all(
            contests.map(async (event: any) => ({
                ...event,
                eventType: 'contest',
                eventName: event.contestName,
                eventDate: event.contestDate,
                eventPlace: event.contestPlace,
                participantCount: await getParticipantCount('contest', event._id.toString()),
            }))
        );

        const forumsWithCounts = await Promise.all(
            forums.map(async (event: any) => ({
                ...event,
                eventType: 'forum',
                eventName: event.forumName,
                eventDate: event.forumDate,
                eventPlace: event.forumPlace,
                participantCount: await getParticipantCount('forum', event._id.toString()),
            }))
        );

        const coResearchWithCounts = await Promise.all(
            coResearchProjects.map(async (event: any) => ({
                ...event,
                eventType: 'co-research',
                eventName: event.researchName,
                eventDate: event.researchDate,
                eventPlace: event.researchPlace,
                participantCount: await getParticipantCount('co-research', event._id.toString()),
            }))
        );

        const allEvents = [
            ...contestsWithCounts,
            ...forumsWithCounts,
            ...coResearchWithCounts,
        ].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

        return NextResponse.json({
            success: true,
            events: allEvents,
            counts: {
                contests: contests.length,
                forums: forums.length,
                coResearch: coResearchProjects.length,
                total: allEvents.length,
            },
        });
    } catch (error) {
        console.error('Fetch my events error:', error);
        return NextResponse.json(
            { success: false, message: '이벤트 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
