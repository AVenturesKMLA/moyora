import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Participant, User, Contest, Forum, CoResearch } from '@/models';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const eventType = searchParams.get('eventType');

        if (!eventId || !eventType) {
            return NextResponse.json({ success: false, message: '이벤트 ID와 유형이 필요합니다' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, message: '사용자를 찾을 수 없습니다' }, { status: 404 });
        }

        // Verify that the user is the host of the event
        let event;
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
            default:
                return NextResponse.json({ success: false, message: '올바른 이벤트 유형이 아닙니다' }, { status: 400 });
        }

        if (!event) {
            return NextResponse.json({ success: false, message: '이벤트를 찾을 수 없습니다' }, { status: 404 });
        }

        if (event.userId.toString() !== user._id.toString() && user.role !== 'superadmin') {
            return NextResponse.json({ success: false, message: '접근 권한이 없습니다' }, { status: 403 });
        }

        const participants = await Participant.find({ eventId, eventType }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, participants });
    } catch (error) {
        console.error('Fetch applicants error:', error);
        return NextResponse.json({ success: false, message: '지원 사실을 불러오는 중 오류가 발생했습니다' }, { status: 500 });
    }
}
