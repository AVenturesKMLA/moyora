import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, User, Participant, Club, ClubRating } from '@/models';
import { authOptions } from '@/lib/auth';

function isValidEventType(type: string): type is 'contest' | 'forum' | 'co-research' {
    return ['contest', 'forum', 'co-research'].includes(type);
}

async function loadEvent(eventType: 'contest' | 'forum' | 'co-research', id: string) {
    switch (eventType) {
        case 'contest':
            return Contest.findById(id);
        case 'forum':
            return Forum.findById(id);
        case 'co-research':
            return CoResearch.findById(id);
        default:
            return null;
    }
}

function getEventDate(eventType: 'contest' | 'forum' | 'co-research', event: any): Date {
    if (eventType === 'contest') return new Date(event.contestDate);
    if (eventType === 'forum') return new Date(event.forumDate);
    return new Date(event.researchDate);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventType: string; id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const { eventType, id } = await params;

        if (!isValidEventType(eventType)) {
            return NextResponse.json({ success: false, message: '유효하지 않은 이벤트 유형입니다' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: '유효하지 않은 이벤트 ID입니다' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, message: '사용자를 찾을 수 없습니다' }, { status: 404 });
        }

        const event = await loadEvent(eventType, id);
        if (!event) {
            return NextResponse.json({ success: false, message: '이벤트를 찾을 수 없습니다' }, { status: 404 });
        }

        const isSuperAdmin = user.role === 'superadmin';
        const isHost = event.userId.toString() === user._id.toString();

        if (!isHost && !isSuperAdmin) {
            return NextResponse.json({ success: false, message: '평가 정보를 볼 권한이 없습니다' }, { status: 403 });
        }

        const approvedParticipants = await Participant.find({
            eventType,
            eventId: id,
            status: 'approved',
            clubName: { $exists: true, $ne: '' },
        }).lean();

        const clubNames = [...new Set(approvedParticipants.map((p: any) => p.clubName).filter(Boolean))];
        const clubs = await Club.find({ clubName: { $in: clubNames } }).lean();
        const clubMap = new Map(clubs.map((club: any) => [club.clubName, club]));

        const ratings = await ClubRating.find({
            eventType,
            eventId: id,
            hostUserId: user._id,
        }).lean();

        const ratingMap = new Map(ratings.map((r: any) => [r.targetClubId.toString(), r]));

        const targets = clubNames.map((clubName) => {
            const club = clubMap.get(clubName);
            if (!club) {
                return {
                    clubName,
                    clubId: null,
                    trustScore: null,
                    rated: false,
                    rating: null,
                };
            }

            const rating = ratingMap.get(club._id.toString()) || null;

            return {
                clubName,
                clubId: club._id,
                trustScore: typeof club.trustScore === 'number' ? club.trustScore : 70,
                rated: !!rating,
                rating,
            };
        });

        return NextResponse.json({
            success: true,
            eventDate: getEventDate(eventType, event),
            targets,
        });
    } catch (error) {
        console.error('Fetch ratings targets error:', error);
        return NextResponse.json({ success: false, message: '평가 대상 조회 중 오류가 발생했습니다' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventType: string; id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const { eventType, id } = await params;

        if (!isValidEventType(eventType)) {
            return NextResponse.json({ success: false, message: '유효하지 않은 이벤트 유형입니다' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: '유효하지 않은 이벤트 ID입니다' }, { status: 400 });
        }

        const body = await request.json();
        const { targetClubId, score, professionalism, reliability, collaborationIntent } = body;

        if (!targetClubId || !mongoose.Types.ObjectId.isValid(targetClubId)) {
            return NextResponse.json({ success: false, message: '유효한 대상 동아리가 필요합니다' }, { status: 400 });
        }

        const normalizedScore = Number(score);
        const p = Number.isFinite(Number(professionalism)) ? Number(professionalism) : normalizedScore;
        const r = Number.isFinite(Number(reliability)) ? Number(reliability) : normalizedScore;
        const c = Number.isFinite(Number(collaborationIntent)) ? Number(collaborationIntent) : normalizedScore;

        const allScores = [p, r, c];
        if (allScores.some((s) => !Number.isInteger(s) || s < 1 || s > 5)) {
            return NextResponse.json({ success: false, message: '평가 점수는 1~5 정수여야 합니다' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, message: '사용자를 찾을 수 없습니다' }, { status: 404 });
        }

        const event = await loadEvent(eventType, id);
        if (!event) {
            return NextResponse.json({ success: false, message: '이벤트를 찾을 수 없습니다' }, { status: 404 });
        }

        const isSuperAdmin = user.role === 'superadmin';
        const isHost = event.userId.toString() === user._id.toString();

        if (!isHost && !isSuperAdmin) {
            return NextResponse.json({ success: false, message: '평가를 등록할 권한이 없습니다' }, { status: 403 });
        }

        const eventDate = getEventDate(eventType, event);
        if (eventDate.getTime() > Date.now()) {
            return NextResponse.json({ success: false, message: '이벤트 종료 후에 평가할 수 있습니다' }, { status: 400 });
        }

        const targetClub = await Club.findById(targetClubId);
        if (!targetClub) {
            return NextResponse.json({ success: false, message: '대상 동아리를 찾을 수 없습니다' }, { status: 404 });
        }

        const approvedParticipation = await Participant.findOne({
            eventType,
            eventId: id,
            status: 'approved',
            clubName: targetClub.clubName,
        });

        if (!approvedParticipation) {
            return NextResponse.json({ success: false, message: '해당 이벤트의 승인된 참가 동아리만 평가할 수 있습니다' }, { status: 400 });
        }

        const averageScore = (p + r + c) / 3;

        await ClubRating.findOneAndUpdate(
            {
                eventType,
                eventId: id,
                hostUserId: user._id,
                targetClubId,
            },
            {
                eventType,
                eventId: id,
                hostUserId: user._id,
                targetClubId,
                score: averageScore,
                professionalism: p,
                reliability: r,
                collaborationIntent: c,
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        const agg = await ClubRating.aggregate([
            { $match: { targetClubId: new mongoose.Types.ObjectId(targetClubId) } },
            {
                $group: {
                    _id: '$targetClubId',
                    average: { $avg: '$score' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const average = agg[0]?.average ?? averageScore;
        const count = agg[0]?.count ?? 1;
        const trustScore = Math.round((average / 5) * 100);

        await Club.findByIdAndUpdate(targetClubId, {
            trustScore,
            trustCount: count,
        });

        return NextResponse.json({
            success: true,
            message: '평가가 저장되었습니다',
            trustScore,
            trustCount: count,
        });
    } catch (error) {
        console.error('Save club rating error:', error);
        return NextResponse.json({ success: false, message: '평가 저장 중 오류가 발생했습니다' }, { status: 500 });
    }
}
