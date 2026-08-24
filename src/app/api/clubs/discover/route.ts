import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Club from '@/models/Club';
import ClubMember from '@/models/ClubMember';

/** 공개 동아리 목록(비로그인 탐색용). 연락처 등은 제외합니다. */
export async function GET() {
    try {
        await connectDB();
        const clubs = await Club.find({})
            .select('_id clubName schoolName clubTheme description location meetingTime maxMembers keywords createdAt')
            .sort({ createdAt: -1 })
            .lean();

        // 실제 가입 회원 수(ClubMember 문서 수)를 동아리별로 집계
        const memberCounts = await ClubMember.aggregate<{ _id: unknown; count: number }>([
            { $match: { clubId: { $in: clubs.map((c) => c._id) } } },
            { $group: { _id: '$clubId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(memberCounts.map((m) => [String(m._id), m.count]));

        const clubsWithCounts = clubs.map((club) => ({
            ...club,
            memberCount: countMap.get(String(club._id)) || 0,
        }));

        return NextResponse.json({ success: true, clubs: clubsWithCounts });
    } catch (error) {
        console.error('Club discover error:', error);
        return NextResponse.json(
            { success: false, message: '동아리 목록을 불러오는 중 오류가 발생했습니다', clubs: [] },
            { status: 500 }
        );
    }
}
