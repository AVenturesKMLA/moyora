import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Club from '@/models/Club';

/** 공개 동아리 목록(비로그인 탐색용). 연락처 등은 제외합니다. */
export async function GET() {
    try {
        await connectDB();
        const clubs = await Club.find({})
            .select('_id clubName schoolName clubTheme description location meetingTime maxMembers keywords createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, clubs });
    } catch (error) {
        console.error('Club discover error:', error);
        return NextResponse.json(
            { success: false, message: '동아리 목록을 불러오는 중 오류가 발생했습니다', clubs: [] },
            { status: 500 }
        );
    }
}
