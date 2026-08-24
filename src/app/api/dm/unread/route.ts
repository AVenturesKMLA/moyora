import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { DirectMessage } from '@/models';
import { authOptions } from '@/lib/auth';

// GET: 내 전체 안 읽은 DM 개수 (네비 뱃지용)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const meId = (session?.user as { id?: string } | undefined)?.id;
        if (!meId) {
            return NextResponse.json({ success: true, count: 0 });
        }

        await connectDB();
        const count = await DirectMessage.countDocuments({ recipientId: meId, read: false });
        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error('DM unread count error:', error);
        return NextResponse.json({ success: true, count: 0 });
    }
}
