import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Contest } from '@/models';

// GET - Fetch contest details by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const contest = await Contest.findById(id);

        if (!contest) {
            return NextResponse.json(
                { success: false, message: '대회를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            event: contest,
        });
    } catch (error) {
        console.error('Fetch contest error:', error);
        return NextResponse.json(
            { success: false, message: '대회 정보를 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
