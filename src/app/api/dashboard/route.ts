export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, User, Participant, Club, Notification, ClubMember } from '@/models';
import { authOptions } from '@/lib/auth';

// --- Global Cache for Dashboard (Shared across requests) ---
let globalDashboardCache: {
    upcomingContests: any[];
    upcomingForums: any[];
    upcomingResearch: any[];
    activeClubsRaw: any[];
    hostThemeMap: Map<string, string>;
    lastFetched: number;
} | null = null;

const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

async function getGlobalDashboardData(now: Date) {
    if (globalDashboardCache && (Date.now() - globalDashboardCache.lastFetched < CACHE_TTL)) {
        return globalDashboardCache;
    }

    const [upcomingContests, upcomingForums, upcomingResearch] = await Promise.all([
        Contest.find({ contestDate: { $gte: now } })
            .sort({ contestDate: 1 }).limit(6)
            .select('_id contestName contestPlace contestDate userId').lean(),
        Forum.find({ forumDate: { $gte: now } })
            .sort({ forumDate: 1 }).limit(6)
            .select('_id forumName forumPlace forumDate userId').lean(),
        CoResearch.find({ researchDate: { $gte: now } })
            .sort({ researchDate: 1 }).limit(6)
            .select('_id researchName researchPlace researchDate userId').lean(),
    ]);

    const activeHostIds = [
        ...(upcomingContests as any[]).map((e) => e.userId?.toString()),
        ...(upcomingForums as any[]).map((e) => e.userId?.toString()),
        ...(upcomingResearch as any[]).map((e) => e.userId?.toString()),
    ].filter(Boolean);
    const uniqueActiveHostIds = Array.from(new Set(activeHostIds));

    let activeClubsRaw: any[] = [];
    if (uniqueActiveHostIds.length > 0) {
        activeClubsRaw = await Club.find({ userId: { $in: uniqueActiveHostIds } })
            .limit(4)
            .select('_id clubName schoolName clubTheme userId description')
            .lean() as any[];
    }

    const hostThemeMap = new Map<string, string>();
    activeClubsRaw.forEach((club) => {
        if (club.userId) hostThemeMap.set(club.userId.toString(), club.clubTheme || '');
    });

    globalDashboardCache = {
        upcomingContests,
        upcomingForums,
        upcomingResearch,
        activeClubsRaw,
        hostThemeMap,
        lastFetched: Date.now(),
    };

    return globalDashboardCache;
}

// GET - Fetch comprehensive dashboard data for the current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const userSession = session.user as { schoolId?: string; id?: string; email?: string };
        if (!userSession.schoolId) {
            return NextResponse.json({ success: false, message: '학교 정보가 없습니다. 다시 로그인해주세요.' }, { status: 403 });
        }

        await connectDB();

        // Fetch User
        const user = await User.findOne({
            email: userSession.email,
            schoolId: userSession.schoolId,
        }).select('_id name email schoolName role').lean() as any;

        if (!user) {
            return NextResponse.json({ success: false, message: '사용자를 찾을 수 없습니다' }, { status: 404 });
        }

        const now = new Date();

        // ── Parallel execution of user-specific DB queries + Global Cache ──────────────
        const [
            clubAssociations,
            hostedContests,
            hostedForums,
            hostedCoResearch,
            participationsRaw,
            notificationsRaw,
            globalData
        ] = await Promise.all([
            // 1. User's club memberships
            ClubMember.find({ userId: user._id, schoolId: userSession.schoolId })
                .populate({ path: 'clubId', select: '_id clubName schoolName clubTheme' })
                .lean(),
            // 2. Events hosted by user
            Contest.find({ userId: user._id, schoolId: userSession.schoolId })
                .select('_id contestName contestDate contestPlace').lean(),
            Forum.find({ userId: user._id, schoolId: userSession.schoolId })
                .select('_id forumName forumDate forumPlace').lean(),
            CoResearch.find({ userId: user._id, schoolId: userSession.schoolId })
                .select('_id researchName researchDate researchPlace').lean(),
            // 3. User's participations
            Participant.find({ userId: user._id })
                .select('_id eventType eventId status').lean(),
            // 4. Notifications
            Notification.find({ userId: user._id, isRead: false })
                .sort({ createdAt: -1 }).limit(10).select('_id eventName eventDate daysUntil isRead').lean(),
            // 5. Global Dashboard data (Cached independently from user)
            getGlobalDashboardData(now)
        ]);

        const {
            upcomingContests, // Array of global events
            upcomingForums,
            upcomingResearch,
            activeClubsRaw,
            hostThemeMap
        } = globalData;

        // ── Process clubs ────────────────────────────────────────────────────
        const clubs = (clubAssociations as any[])
            .map((assoc) => ({ ...(assoc.clubId || {}), role: assoc.role }))
            .filter((c) => c._id);

        const userThemes = new Set(clubs.map((c: any) => c.clubTheme).filter(Boolean));

        // ── Process hosted events ────────────────────────────────────────────
        const hostedEvents = [
            ...(hostedContests as any[]).map((e) => ({ _id: e._id, eventType: 'contest' as const, eventName: e.contestName, eventDate: e.contestDate, eventPlace: e.contestPlace })),
            ...(hostedForums as any[]).map((e) => ({ _id: e._id, eventType: 'forum' as const, eventName: e.forumName, eventDate: e.forumDate, eventPlace: e.forumPlace })),
            ...(hostedCoResearch as any[]).map((e) => ({ _id: e._id, eventType: 'co-research' as const, eventName: e.researchName, eventDate: e.researchDate, eventPlace: e.researchPlace })),
        ].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

        const hostedEventIds = hostedEvents.map((e) => e._id.toString());

        // IDs for participation enrichment
        const contestIds = (participationsRaw as any[]).filter((p) => p.eventType === 'contest').map((p) => p.eventId);
        const forumIds = (participationsRaw as any[]).filter((p) => p.eventType === 'forum').map((p) => p.eventId);
        const researchIds = (participationsRaw as any[]).filter((p) => p.eventType === 'co-research').map((p) => p.eventId);

        // ── Secondary Dependent Queries ────────────────────────────
        const [pendingParticipantsCount, contests, forums, researches] = await Promise.all([
            hostedEventIds.length > 0
                ? Participant.countDocuments({ eventId: { $in: hostedEventIds }, status: 'pending' })
                : Promise.resolve(0),
            contestIds.length > 0
                ? Contest.find({ _id: { $in: contestIds } }).select('_id contestName contestDate contestPlace').lean()
                : Promise.resolve([]),
            forumIds.length > 0
                ? Forum.find({ _id: { $in: forumIds } }).select('_id forumName forumDate forumPlace').lean()
                : Promise.resolve([]),
            researchIds.length > 0
                ? CoResearch.find({ _id: { $in: researchIds } }).select('_id researchName researchDate researchPlace').lean()
                : Promise.resolve([]),
        ]);

        // ── Enrich participations ─────────────────────────────────────────────
        const contestMap = new Map((contests as any[]).map((c) => [c._id.toString(), c]));
        const forumMap = new Map((forums as any[]).map((f) => [f._id.toString(), f]));
        const researchMap = new Map((researches as any[]).map((r) => [r._id.toString(), r]));

        const participationsWithDetails = (participationsRaw as any[]).map((p) => {
            let eventName = '', eventDate = null, eventPlace = '';
            if (p.eventType === 'contest') {
                const c = contestMap.get(p.eventId.toString());
                if (c) { eventName = c.contestName; eventDate = c.contestDate; eventPlace = c.contestPlace; }
            } else if (p.eventType === 'forum') {
                const f = forumMap.get(p.eventId.toString());
                if (f) { eventName = f.forumName; eventDate = f.forumDate; eventPlace = f.forumPlace; }
            } else if (p.eventType === 'co-research') {
                const r = researchMap.get(p.eventId.toString());
                if (r) { eventName = r.researchName; eventDate = r.researchDate; eventPlace = r.researchPlace; }
            }
            return { ...p, eventName, eventDate, eventPlace };
        });

        // ── Trending collabs ────────────────────────────
        const allUpcoming = [
            ...(upcomingContests as any[]).map((e) => ({ _id: e._id, title: e.contestName, host: e.contestPlace || 'Online', date: e.contestDate, type: 'contest', userId: e.userId?.toString() || "" })),
            ...(upcomingForums as any[]).map((e) => ({ _id: e._id, title: e.forumName, host: e.forumPlace || 'Online', date: e.forumDate, type: 'forum', userId: e.userId?.toString() || "" })),
            ...(upcomingResearch as any[]).map((e) => ({ _id: e._id, title: e.researchName, host: e.researchPlace || 'Online', date: e.researchDate, type: 'co-research', userId: e.userId?.toString() || "" })),
        ];

        const trendingCollabs = allUpcoming
            .sort((a, b) => {
                const aTheme = hostThemeMap.get(a.userId) || '';
                const bTheme = hostThemeMap.get(b.userId) || '';
                const userThemesArr = Array.from(userThemes);
                const aScore = userThemes.has(aTheme) ? 2 : userThemesArr.some((t) => aTheme.includes(t as string) || (t as string).includes(aTheme)) ? 1 : 0;
                const bScore = userThemes.has(bTheme) ? 2 : userThemesArr.some((t) => bTheme.includes(t as string) || (t as string).includes(bTheme)) ? 1 : 0;
                if (aScore !== bScore) return bScore - aScore;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            })
            .slice(0, 4)
            .map(({ userId, ...rest }) => rest);

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
                notifications: notificationsRaw || [],
                stats: {
                    clubCount: clubs.length,
                    hostedEventCount: hostedEvents.length,
                    participationCount: participationsRaw.length,
                    pendingApprovalCount: pendingParticipantsCount,
                    unreadNotificationCount: (notificationsRaw || []).length,
                },
                activeClubs: activeClubsRaw.map((c) => ({
                    _id: c._id,
                    name: c.clubName,
                    school: c.schoolName,
                    desc: c.clubTheme || '활동',
                    intro: typeof c.description === 'string' && c.description.trim() ? c.description.trim() : '',
                })),
                trendingCollabs,
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
