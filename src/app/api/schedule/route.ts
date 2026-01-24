import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Schedule } from '@/models';

// GET - Fetch public schedule
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventType = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '50');

        await connectDB();

        // Build query
        const query: { isPublic: boolean; eventType?: string; eventDate?: { $gte: Date } } = {
            isPublic: true,
            eventDate: { $gte: new Date() },
        };

        if (eventType && ['contest', 'forum', 'co-research'].includes(eventType)) {
            query.eventType = eventType;
        }

        const events = await Schedule.find(query)
            .sort({ eventDate: 1 })
            .limit(limit);

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
