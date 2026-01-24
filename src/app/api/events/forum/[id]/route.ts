import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Forum } from '@/models';

// GET - Fetch forum details by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const forum = await Forum.findById(params.id);

        if (!forum) {
            return NextResponse.json(
                { success: false, message: '포럼을 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            event: forum,
        });
    } catch (error) {
        console.error('Fetch forum error:', error);
        return NextResponse.json(
            { success: false, message: '포럼 정보를 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
