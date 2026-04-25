import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, User, Participant, Club, ClubMember } from '@/models';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';

// GET - Fetch participants for a specific event (host only)
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ eventType: string; id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const { eventType, id } = await params;

        if (!['contest', 'forum', 'co-research'].includes(eventType)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 이벤트 유형입니다' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 이벤트 ID입니다' },
                { status: 400 }
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

        let event;
        switch (eventType) {
            case 'contest':
                event = await Contest.findById(id);
                break;
            case 'forum':
                event = await Forum.findById(id);
                break;
            case 'co-research':
                event = await CoResearch.findById(id);
                break;
        }

        if (!event) {
            return NextResponse.json(
                { success: false, message: '이벤트를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        const isSuperAdmin = user.role === 'superadmin';
        const isHost = event.userId.toString() === user._id.toString();

        if (!isHost && !isSuperAdmin) {
            return NextResponse.json(
                { success: false, message: '참가자를 볼 권한이 없습니다' },
                { status: 403 }
            );
        }

        const participants = await Participant.find({
            eventType,
            eventId: id,
        }).sort({ createdAt: -1 }).lean();

        const clubNames = [
            ...new Set(
                participants
                    .map((p: any) => (typeof p.clubName === 'string' ? p.clubName.trim() : ''))
                    .filter(Boolean)
            ),
        ];

        const clubDetailsByName = new Map<
            string,
            {
                _id: string;
                description?: string;
                schoolName: string;
                memberCount: number;
                trustScore: number;
            }
        >();

        if (clubNames.length > 0) {
            const clubs = await Club.find({ clubName: { $in: clubNames } })
                .select('_id clubName description schoolName trustScore')
                .lean();

            const clubIds = clubs.map((club: any) => club._id);
            const memberCounts = clubIds.length > 0
                ? await ClubMember.aggregate([
                    { $match: { clubId: { $in: clubIds } } },
                    { $group: { _id: '$clubId', count: { $sum: 1 } } },
                ])
                : [];

            const memberCountMap = new Map(
                memberCounts.map((row: any) => [row._id.toString(), row.count as number])
            );

            clubs.forEach((club: any) => {
                clubDetailsByName.set(club.clubName, {
                    _id: club._id.toString(),
                    description: club.description,
                    schoolName: club.schoolName,
                    memberCount: memberCountMap.get(club._id.toString()) || 0,
                    trustScore: typeof club.trustScore === 'number' ? club.trustScore : 70,
                });
            });
        }

        const enrichedParticipants = participants.map((participant: any) => {
            const clubName = typeof participant.clubName === 'string' ? participant.clubName.trim() : '';
            return {
                ...participant,
                clubDetails: clubName ? clubDetailsByName.get(clubName) || null : null,
            };
        });

        return NextResponse.json({
            success: true,
            participants: enrichedParticipants,
            counts: {
                total: participants.length,
                pending: participants.filter((p: any) => p.status === 'pending').length,
                approved: participants.filter((p: any) => p.status === 'approved').length,
                rejected: participants.filter((p: any) => p.status === 'rejected').length,
            },
        });
    } catch (error) {
        console.error('Fetch participants error:', error);
        return NextResponse.json(
            { success: false, message: '참가자 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

