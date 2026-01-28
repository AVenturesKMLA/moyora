import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, User, Participant, Club, ClubMember } from '@/models';
import mongoose from 'mongoose';

// GET - Fetch participants for a specific event (host only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventType: string; id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const { eventType, id } = await params;

        // Validate eventType
        if (!['contest', 'forum', 'co-research'].includes(eventType)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 이벤트 유형입니다' },
                { status: 400 }
            );
        }

        // Validate ObjectId
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

        // Get the event and check if user is the host
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

        // Authorization: Only host or superadmin can view participants
        const isSuperAdmin = user.role === 'superadmin';
        const isHost = event.userId.toString() === user._id.toString();

        if (!isHost && !isSuperAdmin) {
            return NextResponse.json(
                { success: false, message: '참가자를 볼 권한이 없습니다' },
                { status: 403 }
            );
        }

        // Fetch participants
        const participants = await Participant.find({
            eventType,
            eventId: id,
        }).sort({ createdAt: -1 });

        // Enrich participants with Club Member count
        const enrichedParticipants = await Promise.all(
            participants.map(async (p) => {
                const participantObj = p.toObject();
                let clubMemberCount = 0;
                let clubDetails = null;

                if (p.clubName) {
                    const club = await Club.findOne({ clubName: p.clubName });
                    if (club) {
                        clubMemberCount = await ClubMember.countDocuments({ clubId: club._id });
                        clubDetails = {
                            _id: club._id,
                            description: club.description,
                            schoolName: club.schoolName,
                            memberCount: clubMemberCount
                        };
                    }
                }

                return {
                    ...participantObj,
                    clubDetails
                };
            })
        );

        return NextResponse.json({
            success: true,
            participants: enrichedParticipants,
            counts: {
                total: participants.length,
                pending: participants.filter((p) => p.status === 'pending').length,
                approved: participants.filter((p) => p.status === 'approved').length,
                rejected: participants.filter((p) => p.status === 'rejected').length,
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
