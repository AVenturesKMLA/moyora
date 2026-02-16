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
            notificationsRaw,
            recentClubsRaw,
            upcomingContests,
            upcomingForums,
            upcomingResearch
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
            }).sort({ createdAt: -1 }).limit(10).lean(),

            // 5. Global Recent Clubs
            Club.find({}).sort({ createdAt: -1 }).limit(4).lean(),

            // 6. Global Recent Events
            Contest.find({ contestDate: { $gte: new Date().toISOString() } }).sort({ contestDate: 1 }).limit(3).lean(),
            Forum.find({ forumDate: { $gte: new Date().toISOString() } }).sort({ forumDate: 1 }).limit(3).lean(),
            CoResearch.find({ researchDate: { $gte: new Date().toISOString() } }).sort({ researchDate: 1 }).limit(3).lean()
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

        // Process Dependent Data
        const hostedEventIds = hostedEvents.map((e) => e._id.toString());
        const pendingParticipantsCount = await Participant.countDocuments({
            eventId: { $in: hostedEventIds },
            status: 'pending',
        });

        // Enrich Participations (Optimized with batch fetching)
        const contestIds = participations
            .filter((p: any) => p.eventType === 'contest')
            .map((p: any) => p.eventId);
        const forumIds = participations
            .filter((p: any) => p.eventType === 'forum')
            .map((p: any) => p.eventId);
        const researchIds = participations
            .filter((p: any) => p.eventType === 'co-research')
            .map((p: any) => p.eventId);

        const [contests, forums, researches] = await Promise.all([
            contestIds.length > 0 ? Contest.find({ _id: { $in: contestIds } }).lean() : Promise.resolve([]),
            forumIds.length > 0 ? Forum.find({ _id: { $in: forumIds } }).lean() : Promise.resolve([]),
            researchIds.length > 0 ? CoResearch.find({ _id: { $in: researchIds } }).lean() : Promise.resolve([]),
        ]);

        const contestMap = new Map((contests as any[]).map((c) => [c._id.toString(), c]));
        const forumMap = new Map((forums as any[]).map((f) => [f._id.toString(), f]));
        const researchMap = new Map((researches as any[]).map((r) => [r._id.toString(), r]));

        const participationsWithDetails = participations.map((p: any) => {
            let eventName = '';
            let eventDate = null;
            let eventPlace = '';

            if (p.eventType === 'contest') {
                const contest = contestMap.get(p.eventId.toString());
                if (contest) {
                    eventName = contest.contestName;
                    eventDate = contest.contestDate;
                    eventPlace = contest.contestPlace;
                }
            } else if (p.eventType === 'forum') {
                const forum = forumMap.get(p.eventId.toString());
                if (forum) {
                    eventName = forum.forumName;
                    eventDate = forum.forumDate;
                    eventPlace = forum.forumPlace;
                }
            } else if (p.eventType === 'co-research') {
                const research = researchMap.get(p.eventId.toString());
                if (research) {
                    eventName = research.researchName;
                    eventDate = research.researchDate;
                    eventPlace = research.researchPlace;
                }
            }

            return {
                ...p,
                eventName,
                eventDate,
                eventPlace,
            };
        });

        const notifications = notificationsRaw || [];

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
                recentClubs: recentClubsRaw.map((c: any) => ({
                    _id: c._id,
                    name: c.clubName,
                    school: c.schoolName,
                    desc: c.category || 'General',
                    score: typeof c.trustScore === 'number' ? c.trustScore : 70
                })),
                trendingCollabs: [
                    ...upcomingContests.map((e: any) => ({
                        _id: e._id,
                        title: e.contestName,
                        host: e.contestPlace || 'Online',
                        date: e.contestDate,
                        type: 'contest'
                    })),
                    ...upcomingForums.map((e: any) => ({
                        _id: e._id,
                        title: e.forumName,
                        host: e.forumPlace || 'Online',
                        date: e.forumDate,
                        type: 'forum'
                    })),
                    ...upcomingResearch.map((e: any) => ({
                        _id: e._id,
                        title: e.researchName,
                        host: e.researchPlace || 'Online',
                        date: e.researchDate,
                        type: 'co-research'
                    }))
                ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4)
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

