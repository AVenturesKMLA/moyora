import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { GlobalMessage } from '@/models';
import { authOptions } from '@/lib/auth';

// GET: 전체 채팅 최근 메시지 (최근 100개, 오름차순) — 로그인한 사용자 누구나
export async function GET(_request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as { id?: string } | undefined)?.id;
        if (!userId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        await connectDB();

        const recent = await GlobalMessage.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        const messages = recent
            .reverse()
            .map((m) => ({
                _id: String(m._id),
                userId: String(m.userId),
                userName: m.userName,
                schoolName: m.schoolName || '',
                content: m.content,
                createdAt: m.createdAt,
            }));

        return NextResponse.json({ success: true, currentUserId: userId, messages });
    } catch (error) {
        console.error('Fetch global chat error:', error);
        return NextResponse.json({ success: false, message: '메시지를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
    }
}

// POST: 전체 채팅 메시지 전송 — 로그인한 사용자 누구나
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as { id?: string; name?: string; schoolName?: string } | undefined;
        if (!user?.id) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const body = await request.json();
        const content = typeof body?.content === 'string' ? body.content.trim() : '';

        if (!content) {
            return NextResponse.json({ success: false, message: '메시지를 입력해주세요' }, { status: 400 });
        }
        if (content.length > 2000) {
            return NextResponse.json({ success: false, message: '메시지는 2000자 이내로 입력해주세요' }, { status: 400 });
        }

        await connectDB();

        const created = await GlobalMessage.create({
            userId: user.id,
            userName: user.name || '알 수 없음',
            schoolName: user.schoolName || '',
            content,
        });

        return NextResponse.json({
            success: true,
            message: {
                _id: String(created._id),
                userId: String(created.userId),
                userName: created.userName,
                schoolName: created.schoolName,
                content: created.content,
                createdAt: created.createdAt,
            },
        });
    } catch (error) {
        console.error('Send global chat error:', error);
        return NextResponse.json({ success: false, message: '메시지 전송 중 오류가 발생했습니다' }, { status: 500 });
    }
}
