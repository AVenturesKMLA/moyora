import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Club } from '@/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        const club = await Club.findById(id).lean();
        
        if (!club) {
            return NextResponse.json({ success: false, message: '동아리를 찾을 수 없습니다' }, { status: 404 });
        }

        return NextResponse.json({ success: true, club });
    } catch (error) {
        console.error('Fetch club error:', error);
        return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다' }, { status: 500 });
    }
}
