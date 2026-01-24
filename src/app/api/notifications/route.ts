import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Notification, User } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        const query: { userId: typeof user._id; isRead?: boolean } = { userId: user._id };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json(
            { success: false, message: '알림을 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

// PATCH - Mark notification as read
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { notificationId, markAllRead } = body;

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        if (markAllRead) {
            await Notification.updateMany(
                { userId: user._id, isRead: false },
                { $set: { isRead: true } }
            );
        } else if (notificationId) {
            await Notification.updateOne(
                { _id: notificationId, userId: user._id },
                { $set: { isRead: true } }
            );
        }

        return NextResponse.json({
            success: true,
            message: '알림이 읽음 처리되었습니다',
        });
    } catch (error) {
        console.error('Update notification error:', error);
        return NextResponse.json(
            { success: false, message: '알림 처리 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
