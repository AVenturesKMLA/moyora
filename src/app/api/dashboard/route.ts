import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, User, Participant, Club, Notification } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Fetch comprehensive dashboard data for the current user
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

        const user = await User.findOne({ email: session.user.email }).select('-password');
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // Fetch clubs
        const clubs = await Club.find({ userId: user._id }).lean();

        // Fetch hosted events
        const [hostedContests, hostedForums, hostedCoResearch] = await Promise.all([
            Contest.find({ userId: user._id }).lean(),
            Forum.find({ userId: user._id }).lean(),
            CoResearch.find({ userId: user._id }).lean(),
        ]);

        const hostedEvents = [
            ...hostedContests.map((e: any) => ({
                _id: e._id,
                eventType: 'contest' as const,
                eventName: e.contestName,
                eventDate: e.contestDate,
                eventPlace: e.contestPlace,
            })),
            ...hostedForums.map((e: any) => ({
                _id: e._id,
                eventType: 'forum' as const,
                eventName: e.forumName,
                eventDate: e.forumDate,
                eventPlace: e.forumPlace,
            })),
            ...hostedCoResearch.map((e: any) => ({
                _id: e._id,
                eventType: 'co-research' as const,
                eventName: e.researchName,
                eventDate: e.researchDate,
                eventPlace: e.researchPlace,
            })),
        ].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

        // Fetch participations with event details
        const participations = await Participant.find({ userId: user._id }).lean();

        const participationsWithDetails = await Promise.all(
            participations.map(async (p: any) => {
                let eventName = '';
                let eventDate = null;
                let eventPlace = '';

                switch (p.eventType) {
                    case 'contest':
                        const contest = await Contest.findById(p.eventId);
                        if (contest) {
                            eventName = contest.contestName;
                            eventDate = contest.contestDate;
                            eventPlace = contest.contestPlace;
                        }
                        break;
                    case 'forum':
                        const forum = await Forum.findById(p.eventId);
                        if (forum) {
                            eventName = forum.forumName;
                            eventDate = forum.forumDate;
                            eventPlace = forum.forumPlace;
                        }
                        break;
                    case 'co-research':
                        const research = await CoResearch.findById(p.eventId);
                        if (research) {
                            eventName = research.researchName;
                            eventDate = research.researchDate;
                            eventPlace = research.researchPlace;
                        }
                        break;
                }

                return {
                    ...p,
                    eventName,
                    eventDate,
                    eventPlace,
                };
            })
        );

        // Fetch unread notifications
        const notifications = await Notification.find({
            userId: user._id,
            isRead: false,
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Get pending participation count for hosted events
        const hostedEventIds = hostedEvents.map((e) => e._id.toString());
        const pendingParticipantsCount = await Participant.countDocuments({
            eventId: { $in: hostedEventIds },
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    schoolName: user.schoolName,
                    role: user.role,
                },
                clubs,
                hostedEvents,
                participations: participationsWithDetails,
                notifications,
                stats: {
                    clubCount: clubs.length,
                    hostedEventCount: hostedEvents.length,
                    participationCount: participations.length,
                    pendingApprovalCount: pendingParticipantsCount,
                    unreadNotificationCount: notifications.length,
                },
            },
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return NextResponse.json(
            { success: false, message: '대시보드 데이터 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
