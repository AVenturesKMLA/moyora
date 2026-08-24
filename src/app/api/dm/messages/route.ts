import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { User, DirectMessage } from '@/models';
import { makePairKey } from '@/models/DirectMessage';
import { authOptions } from '@/lib/auth';

// GET: 특정 상대와의 1:1 대화 메시지 조회 (+ 내가 받은 메시지 읽음 처리)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const me = (session?.user as { id?: string } | undefined)?.id;
        if (!me) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const other = new URL(request.url).searchParams.get('userId') || '';
        if (!mongoose.Types.ObjectId.isValid(other) || other === me) {
            return NextResponse.json({ success: false, message: '유효하지 않은 상대입니다' }, { status: 400 });
        }

        await connectDB();

        const otherUser = await User.findById(other).select('name schoolName').lean() as
            { _id: unknown; name?: string; schoolName?: string } | null;
        if (!otherUser) {
            return NextResponse.json({ success: false, message: '상대를 찾을 수 없습니다' }, { status: 404 });
        }

        const pairKey = makePairKey(me, other);

        // 내가 받은(상대가 보낸) 안 읽은 메시지 읽음 처리
        await DirectMessage.updateMany({ pairKey, recipientId: me, read: false }, { $set: { read: true } });

        const raw = await DirectMessage.find({ pairKey })
            .sort({ createdAt: 1 })
            .limit(300)
            .lean();

        const messages = raw.map((m) => ({
            _id: String(m._id),
            senderId: String(m.senderId),
            senderName: m.senderName,
            content: m.content,
            createdAt: m.createdAt,
        }));

        return NextResponse.json({
            success: true,
            currentUserId: me,
            otherUser: { id: String(otherUser._id), name: otherUser.name || '사용자', schoolName: otherUser.schoolName || '' },
            messages,
        });
    } catch (error) {
        console.error('Fetch DM thread error:', error);
        return NextResponse.json({ success: false, message: '메시지를 불러오는 중 오류가 발생했습니다' }, { status: 500 });
    }
}

// POST: 1:1 메시지 전송
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as { id?: string; name?: string } | undefined;
        if (!user?.id) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const body = await request.json();
        const recipientId = typeof body?.recipientId === 'string' ? body.recipientId : '';
        const content = typeof body?.content === 'string' ? body.content.trim() : '';

        if (!mongoose.Types.ObjectId.isValid(recipientId) || recipientId === user.id) {
            return NextResponse.json({ success: false, message: '유효하지 않은 상대입니다' }, { status: 400 });
        }
        if (!content) {
            return NextResponse.json({ success: false, message: '메시지를 입력해주세요' }, { status: 400 });
        }
        if (content.length > 2000) {
            return NextResponse.json({ success: false, message: '메시지는 2000자 이내로 입력해주세요' }, { status: 400 });
        }

        await connectDB();

        const recipient = await User.findById(recipientId).select('_id').lean();
        if (!recipient) {
            return NextResponse.json({ success: false, message: '상대를 찾을 수 없습니다' }, { status: 404 });
        }

        const created = await DirectMessage.create({
            pairKey: makePairKey(user.id, recipientId),
            participants: [user.id, recipientId],
            senderId: user.id,
            senderName: user.name || '알 수 없음',
            recipientId,
            content,
            read: false,
        });

        return NextResponse.json({
            success: true,
            message: {
                _id: String(created._id),
                senderId: String(created.senderId),
                senderName: created.senderName,
                content: created.content,
                createdAt: created.createdAt,
            },
        });
    } catch (error) {
        console.error('Send DM error:', error);
        return NextResponse.json({ success: false, message: '메시지 전송 중 오류가 발생했습니다' }, { status: 500 });
    }
}
