import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Club, ClubMember, ClubMessage } from '@/models';
import { authOptions } from '@/lib/auth';

// 현재 사용자가 해당 동아리의 멤버(회장 포함)인지 확인
async function requireMembership(clubId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(clubId)) return { ok: false as const, status: 400, message: '유효하지 않은 동아리 ID입니다' };
    const member = await ClubMember.findOne({ clubId, userId });
    if (!member) return { ok: false as const, status: 403, message: '이 동아리의 멤버만 채팅에 참여할 수 있습니다' };
    return { ok: true as const };
}

// GET: 동아리 채팅 메시지 목록 (최근 100개, 오름차순)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as { id?: string } | undefined)?.id;
        if (!userId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const clubId = new URL(request.url).searchParams.get('clubId') || '';

        await connectDB();

        const gate = await requireMembership(clubId, userId);
        if (!gate.ok) {
            return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });
        }

        const club = await Club.findById(clubId).select('clubName').lean() as { clubName?: string } | null;

        const recent = await ClubMessage.find({ clubId })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        const messages = recent
            .reverse()
            .map((m) => ({
                _id: String(m._id),
                userId: String(m.userId),
                userName: m.userName,
                content: m.content,
                createdAt: m.createdAt,
            }));

        return NextResponse.json({
            success: true,
            clubName: club?.clubName ?? '',
            currentUserId: userId,
            messages,
        });
    } catch (error) {
        console.error('Fetch chat error:', error);
        return NextResponse.json({ success: false, message: '메시지를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
    }
}

// POST: 메시지 전송
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as { id?: string; name?: string } | undefined;
        if (!user?.id) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const body = await request.json();
        const clubId = typeof body?.clubId === 'string' ? body.clubId : '';
        const content = typeof body?.content === 'string' ? body.content.trim() : '';

        if (!content) {
            return NextResponse.json({ success: false, message: '메시지를 입력해주세요' }, { status: 400 });
        }
        if (content.length > 2000) {
            return NextResponse.json({ success: false, message: '메시지는 2000자 이내로 입력해주세요' }, { status: 400 });
        }

        await connectDB();

        const gate = await requireMembership(clubId, user.id);
        if (!gate.ok) {
            return NextResponse.json({ success: false, message: gate.message }, { status: gate.status });
        }

        const created = await ClubMessage.create({
            clubId,
            userId: user.id,
            userName: user.name || '알 수 없음',
            content,
        });

        return NextResponse.json({
            success: true,
            message: {
                _id: String(created._id),
                userId: String(created.userId),
                userName: created.userName,
                content: created.content,
                createdAt: created.createdAt,
            },
        });
    } catch (error) {
        console.error('Send chat error:', error);
        return NextResponse.json({ success: false, message: '메시지 전송 중 오류가 발생했습니다' }, { status: 500 });
    }
}
