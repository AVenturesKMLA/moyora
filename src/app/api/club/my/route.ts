import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User, ClubMember, ClubApplication } from '@/models';
import { authOptions } from '@/lib/auth';

// GET: 현재 사용자의 동아리 목록을 "운영(chief)"과 "소속(member)"으로 구분해 반환
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, message: '사용자를 찾을 수 없습니다' }, { status: 404 });
        }

        const memberships = await ClubMember.find({ userId: user._id })
            .populate({
                path: 'clubId',
                select: '_id clubName description schoolName clubTheme presidentName',
            })
            .lean();

        const owned: any[] = [];
        const memberOf: any[] = [];

        for (const m of memberships as any[]) {
            const club = m.clubId;
            if (!club || !club._id) continue;
            const entry = {
                _id: String(club._id),
                clubName: club.clubName,
                description: club.description || '',
                schoolName: club.schoolName || '',
                clubTheme: club.clubTheme || '',
                presidentName: club.presidentName || '',
                role: m.role as 'chief' | 'member',
                joinedAt: m.joinedAt || m.createdAt || null,
            };
            if (m.role === 'chief') owned.push(entry);
            else memberOf.push(entry);
        }

        // 운영 동아리별 대기중 가입신청 수 (뱃지용)
        if (owned.length > 0) {
            const ownedIds = owned.map((c) => c._id);
            const pendingCounts = await ClubApplication.aggregate([
                { $match: { status: 'pending' } },
                { $group: { _id: '$clubId', count: { $sum: 1 } } },
            ]);
            const countMap = new Map(pendingCounts.map((p: any) => [String(p._id), p.count]));
            for (const c of owned) {
                if (ownedIds.includes(c._id)) c.pendingCount = countMap.get(c._id) || 0;
            }
        }

        return NextResponse.json({ success: true, owned, memberOf });
    } catch (error) {
        console.error('Fetch my clubs error:', error);
        return NextResponse.json(
            { success: false, message: '동아리 목록을 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
