export const dynamic = 'force-dynamic';
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

        const contestIds = contests.map((e: any) => e._id);
        const forumIds = forums.map((e: any) => e._id);
        const researchIds = coResearchProjects.map((e: any) => e._id);

        const countMatchOr: Array<Record<string, unknown>> = [];
        if (contestIds.length > 0) countMatchOr.push({ eventType: 'contest', eventId: { $in: contestIds } });
        if (forumIds.length > 0) countMatchOr.push({ eventType: 'forum', eventId: { $in: forumIds } });
        if (researchIds.length > 0) countMatchOr.push({ eventType: 'co-research', eventId: { $in: researchIds } });

        const participantCounts = countMatchOr.length > 0
            ? await Participant.aggregate([
                { $match: { $or: countMatchOr } },
                {
                    $group: {
                        _id: {
                            eventType: '$eventType',
                            eventId: '$eventId',
                        },
                        count: { $sum: 1 },
                    },
                },
            ])
            : [];

        const countMap = new Map<string, number>();
        participantCounts.forEach((row: any) => {
            const key = `${row._id.eventType}:${row._id.eventId.toString()}`;
            countMap.set(key, row.count as number);
        });

        const getParticipantCount = (eventType: 'contest' | 'forum' | 'co-research', eventId: any) => {
            return countMap.get(`${eventType}:${eventId.toString()}`) || 0;
        };

        const contestsWithCounts = contests.map((event: any) => ({
            ...event,
            eventType: 'contest',
            eventName: event.contestName,
            eventDate: event.contestDate,
            eventPlace: event.contestPlace,
            participantCount: getParticipantCount('contest', event._id),
        }));

        const forumsWithCounts = forums.map((event: any) => ({
            ...event,
            eventType: 'forum',
            eventName: event.forumName,
            eventDate: event.forumDate,
            eventPlace: event.forumPlace,
            participantCount: getParticipantCount('forum', event._id),
        }));

        const coResearchWithCounts = coResearchProjects.map((event: any) => ({
            ...event,
            eventType: 'co-research',
            eventName: event.researchName,
            eventDate: event.researchDate,
            eventPlace: event.researchPlace,
            participantCount: getParticipantCount('co-research', event._id),
        }));

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
