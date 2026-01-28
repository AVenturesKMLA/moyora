export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, User, Participant, Club, Notification, ClubMember } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Fetch comprehensive dashboard data for the current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const userSession = session.user as { schoolId?: string; id?: string; email?: string };
        if (!userSession.schoolId) {
            return NextResponse.json(
                { success: false, message: '학교 정보가 없습니다. 다시 로그인해주세요.' },
                { status: 403 }
            );
        }

        await connectDB();

        const user = await User.findOne({
            email: userSession.email,
            schoolId: userSession.schoolId
        }).select('-password');
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // Run independent queries in parallel
        const [
            clubAssociations,
            hostedContests,
            hostedForums,
            hostedCoResearch,
            participations,
            notifications
        ] = await Promise.all([
            // 1. Clubs
            ClubMember.find({
                userId: user._id,
                schoolId: userSession.schoolId
            }).populate('clubId').lean(),

            // 2. Hosted Events
            Contest.find({ userId: user._id, schoolId: userSession.schoolId }).lean(),
            Forum.find({ userId: user._id, schoolId: userSession.schoolId }).lean(),
            CoResearch.find({ userId: user._id, schoolId: userSession.schoolId }).lean(),

            // 3. Participations (Raw)
            Participant.find({
                userId: user._id,
                schoolId: userSession.schoolId
            }).lean(),

            // 4. Notifications
            Notification.find({
                userId: user._id,
                schoolId: userSession.schoolId,
                isRead: false,
            }).sort({ createdAt: -1 }).limit(10).lean()
        ]);

        // Process Clubs
        const clubs = clubAssociations.map((assoc: any) => ({
            ...assoc.clubId,
            role: assoc.role
        })).filter((c: any) => c._id);

        // Process Hosted Events
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

        // Process Dependent Data in Parallel
        const hostedEventIds = hostedEvents.map((e) => e._id.toString());

        const [participationsWithDetails, pendingParticipantsCount] = await Promise.all([
            // Enrich Participations
            Promise.all(participations.map(async (p: any) => {
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
            })),

            // Count Pending Participants for Hosted Events
            Participant.countDocuments({
                eventId: { $in: hostedEventIds },
                status: 'pending',
            })
        ]);

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
