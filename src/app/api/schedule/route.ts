export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Schedule } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Fetch schedule (public + optional private entries for logged-in user)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventType = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const includePrivate = searchParams.get('includePrivate') === 'true';

        await connectDB();

        const baseFilter: any = {
            eventDate: { $gte: new Date() },
        };

        if (eventType && ['contest', 'forum', 'co-research'].includes(eventType)) {
            baseFilter.eventType = eventType;
        }

        if (includePrivate) {
            const session = await getServerSession(authOptions);
            const userId = (session?.user as any)?.id;

            if (userId) {
                baseFilter.$or = [
                    { isPublic: true },
                    { isPublic: false, userId },
                ];
            } else {
                baseFilter.isPublic = true;
            }
        } else {
            baseFilter.isPublic = true;
        }

        const events = await Schedule.find(baseFilter)
            .sort({ eventDate: 1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            events,
        });
    } catch (error) {
        console.error('Fetch schedule error:', error);
        return NextResponse.json(
            { success: false, message: '일정을 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
