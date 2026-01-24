import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Participant, User, Contest, Forum, CoResearch } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Check if user has participated in an event
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ hasParticipated: false });
        }

        const { searchParams } = new URL(request.url);
        const eventType = searchParams.get('eventType');
        const eventId = searchParams.get('eventId');

        if (!eventType || !eventId) {
            return NextResponse.json(
                { success: false, message: '이벤트 정보가 필요합니다' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ hasParticipated: false });
        }

        const participation = await Participant.findOne({
            userId: user._id,
            eventType,
            eventId,
        });

        return NextResponse.json({
            success: true,
            hasParticipated: !!participation,
            status: participation?.status || null,
        });
    } catch (error) {
        console.error('Check participation error:', error);
        return NextResponse.json(
            { success: false, hasParticipated: false },
            { status: 500 }
        );
    }
}

// POST - Participate in an event
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { eventType, eventId, clubName, message } = body;

        if (!eventType || !eventId) {
            return NextResponse.json(
                { success: false, message: '이벤트 정보가 필요합니다' },
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

        // Check if already participated
        const existingParticipation = await Participant.findOne({
            userId: user._id,
            eventType,
            eventId,
        });

        if (existingParticipation) {
            return NextResponse.json(
                { success: false, message: '이미 참가 신청을 하셨습니다' },
                { status: 400 }
            );
        }

        // Get event details to find host
        let event;
        let hostUserId;

        switch (eventType) {
            case 'contest':
                event = await Contest.findById(eventId);
                break;
            case 'forum':
                event = await Forum.findById(eventId);
                break;
            case 'co-research':
                event = await CoResearch.findById(eventId);
                break;
        }

        if (event) {
            hostUserId = event.userId;
        }

        // Create participation
        const participation = await Participant.create({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            userSchool: user.schoolName,
            clubName: clubName || '',
            eventType,
            eventId,
            message: message || '',
            status: 'pending',
        });

        // Create notification for the event host
        if (hostUserId) {
            const { Notification } = await import('@/models');
            await Notification.create({
                userId: hostUserId,
                eventType,
                eventId,
                eventName: `${user.name}님이 참가 신청`,
                eventDate: new Date(),
                eventPlace: '참가 신청 알림',
                daysUntil: 0,
                isRead: false,
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: '참가 신청이 완료되었습니다',
                participation,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Participate error:', error);
        return NextResponse.json(
            { success: false, message: '참가 신청 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
