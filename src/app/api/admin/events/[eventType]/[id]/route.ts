import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User, Contest, Forum, CoResearch, Schedule, Participant } from '@/models';
import mongoose from 'mongoose';

// DELETE - Delete an event (admin only)
export async function DELETE(
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

        const admin = await User.findOne({ email: session.user.email });
        if (!admin || admin.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, message: '관리자 권한이 필요합니다' },
                { status: 403 }
            );
        }

        // Delete the event
        let deleted = false;
        switch (eventType) {
            case 'contest':
                const contest = await Contest.findByIdAndDelete(id);
                deleted = !!contest;
                break;
            case 'forum':
                const forum = await Forum.findByIdAndDelete(id);
                deleted = !!forum;
                break;
            case 'co-research':
                const research = await CoResearch.findByIdAndDelete(id);
                deleted = !!research;
                break;
        }

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: '이벤트를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // Delete associated schedule entries and participants
        await Promise.all([
            Schedule.deleteMany({ eventType, eventId: id }),
            Participant.deleteMany({ eventType, eventId: id }),
        ]);

        return NextResponse.json({
            success: true,
            message: '이벤트가 삭제되었습니다',
        });
    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json(
            { success: false, message: '이벤트 삭제 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
