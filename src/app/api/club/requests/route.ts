import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Club, ClubApplication, User } from '@/models';
import { authOptions } from '@/lib/auth';

// GET: 현재 로그인한 회장이 받은 "대기중" 가입 신청 목록 + 개수
// (회장이 개설/운영하는 모든 동아리 기준)
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

        // 내가 소유(개설)한 동아리들
        const myClubs = await Club.find({
            $or: [{ userId: user._id }, { presidentEmail: user.email }],
        })
            .select('_id clubName')
            .lean();

        if (myClubs.length === 0) {
            return NextResponse.json({ success: true, count: 0, requests: [] });
        }

        const clubNameById = new Map(myClubs.map((c) => [String(c._id), c.clubName]));
        const clubIds = myClubs.map((c) => c._id);

        // 그 동아리들에 들어온 대기중 신청
        const pending = await ClubApplication.find({
            clubId: { $in: clubIds },
            status: 'pending',
        })
            .populate('userId', 'name schoolName grade')
            .sort({ createdAt: -1 })
            .lean();

        const requests = pending.map((app) => {
            const applicant = app.userId as unknown as {
                _id: unknown;
                name?: string;
                schoolName?: string;
                grade?: number;
            } | null;
            return {
                applicationId: String(app._id),
                clubId: String(app.clubId),
                clubName: clubNameById.get(String(app.clubId)) ?? '',
                applicantName: applicant?.name ?? '알 수 없음',
                applicantSchool: applicant?.schoolName ?? '',
                applicantGrade: applicant?.grade ?? null,
                message: app.message ?? '',
                createdAt: app.createdAt,
            };
        });

        return NextResponse.json({ success: true, count: requests.length, requests });
    } catch (error) {
        console.error('Fetch club requests error:', error);
        return NextResponse.json(
            { success: false, message: '가입 요청을 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
