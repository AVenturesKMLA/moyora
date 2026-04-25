import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CoResearch } from '@/models';

// GET - Fetch co-research details by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const coResearch = await CoResearch.findById(id);

        if (!coResearch) {
            return NextResponse.json(
                { success: false, message: '공동연구를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            event: coResearch,
        });
    } catch (error) {
        console.error('Fetch co-research error:', error);
        return NextResponse.json(
            { success: false, message: '공동연구 정보를 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
