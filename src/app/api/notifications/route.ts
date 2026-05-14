
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Note: Notification model currently only relies on userId. 
        // If strict school separation is needed, we should filter by schoolId if added to model, 
        // or rely on DB connection separation if that's how it's architecture (User has distinct DBs?).
        // For now, filtering by userId is the baseline.
        // Also checking strict match with the dashboard's logic which used schoolId if available.
        // But the Notification model I saw ONLY has userId. So I must rely on userId.

        const notifications = await Notification.find({
            userId: (session.user as any).id || (session.user as any)._id
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
