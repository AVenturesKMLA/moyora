import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { authOptions } from '@/lib/auth';

// GET: 이름으로 사용자 검색 (DM 상대 찾기). 로그인 필요, 본인 제외.
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const meId = (session?.user as { id?: string } | undefined)?.id;
        if (!meId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const q = (new URL(request.url).searchParams.get('q') || '').trim();
        if (q.length < 1) {
            return NextResponse.json({ success: true, users: [] });
        }

        await connectDB();

        // 정규식 특수문자 이스케이프 후 이름 부분일치 검색
        const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const users = await User.find({
            name: { $regex: safe, $options: 'i' },
            _id: { $ne: meId },
        })
            .select('name schoolName grade')
            .limit(10)
            .lean();

        return NextResponse.json({
            success: true,
            users: users.map((u: any) => ({
                id: String(u._id),
                name: u.name,
                schoolName: u.schoolName || '',
                grade: u.grade ?? null,
            })),
        });
    } catch (error) {
        console.error('User search error:', error);
        return NextResponse.json({ success: false, message: '사용자 검색 중 오류가 발생했습니다' }, { status: 500 });
    }
}
