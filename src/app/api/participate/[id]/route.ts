import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Participant, User, Contest, Forum, CoResearch, Notification } from '@/models';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';

// PATCH - Update participation status (approve/reject)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 참가 ID입니다' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { status } = body;

        // Validate status
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 상태입니다' },
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

        // Find the participation
        const participation = await Participant.findById(id);
        if (!participation) {
            return NextResponse.json(
                { success: false, message: '참가 신청을 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // Get the event to check if user is the host
        let event;
        let eventName = '';
        switch (participation.eventType) {
            case 'contest':
                event = await Contest.findById(participation.eventId);
                eventName = event?.contestName || '';
                break;
            case 'forum':
                event = await Forum.findById(participation.eventId);
                eventName = event?.forumName || '';
                break;
            case 'co-research':
                event = await CoResearch.findById(participation.eventId);
                eventName = event?.researchName || '';
                break;
        }

        if (!event) {
            return NextResponse.json(
                { success: false, message: '이벤트를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // Authorization: Only host or superadmin can change status
        const isSuperAdmin = user.role === 'superadmin';
        const isHost = event.userId.toString() === user._id.toString();

        if (!isHost && !isSuperAdmin) {
            return NextResponse.json(
                { success: false, message: '참가 상태를 변경할 권한이 없습니다' },
                { status: 403 }
            );
        }

        // Update the status
        participation.status = status;
        await participation.save();

        // Create notification for the applicant
        const statusText = status === 'approved' ? '승인' : status === 'rejected' ? '거절' : '대기';
        await Notification.create({
            userId: participation.userId,
            eventType: participation.eventType,
            eventId: participation.eventId,
            eventName: `${eventName} - 참가 신청 ${statusText}`,
            eventDate: new Date(),
            eventPlace: '참가 상태 변경 알림',
            daysUntil: 0,
            isRead: false,
        });

        return NextResponse.json({
            success: true,
            message: `참가 신청이 ${statusText}되었습니다`,
            participation,
        });
    } catch (error) {
        console.error('Update participation error:', error);
        return NextResponse.json(
            { success: false, message: '참가 상태 변경 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

// GET - Get a single participation by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 참가 ID입니다' },
                { status: 400 }
            );
        }

        await connectDB();

        const participation = await Participant.findById(id);
        if (!participation) {
            return NextResponse.json(
                { success: false, message: '참가 신청을 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            participation,
        });
    } catch (error) {
        console.error('Get participation error:', error);
        return NextResponse.json(
            { success: false, message: '참가 정보 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
