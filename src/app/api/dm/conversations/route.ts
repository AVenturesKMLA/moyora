import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { User, DirectMessage } from '@/models';
import { authOptions } from '@/lib/auth';

// GET: 내 1:1 대화방 목록 (상대·마지막 메시지·안 읽은 수)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const meId = (session?.user as { id?: string } | undefined)?.id;
        if (!meId) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        await connectDB();
        const me = new mongoose.Types.ObjectId(meId);

        const grouped = await DirectMessage.aggregate([
            { $match: { participants: me } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$pairKey',
                    participants: { $first: '$participants' },
                    lastContent: { $first: '$content' },
                    lastAt: { $first: '$createdAt' },
                    lastSenderId: { $first: '$senderId' },
                    unread: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ['$recipientId', me] }, { $eq: ['$read', false] }] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { lastAt: -1 } },
            { $limit: 50 },
        ]);

        // 상대방 id 추출 → 이름 조회
        const otherIds = grouped.map((g) => {
            const parts = (g.participants as mongoose.Types.ObjectId[]).map((p) => String(p));
            return parts.find((p) => p !== meId) || '';
        });
        const users = await User.find({ _id: { $in: otherIds.filter(Boolean) } })
            .select('name schoolName')
            .lean();
        const userMap = new Map(users.map((u: any) => [String(u._id), u]));

        const conversations = grouped.map((g, i) => {
            const otherId = otherIds[i];
            const u = userMap.get(otherId);
            return {
                otherUserId: otherId,
                otherUserName: u?.name || '사용자',
                otherUserSchool: u?.schoolName || '',
                lastContent: g.lastContent,
                lastAt: g.lastAt,
                lastFromMe: String(g.lastSenderId) === meId,
                unread: g.unread,
            };
        }).filter((c) => c.otherUserId);

        return NextResponse.json({ success: true, conversations });
    } catch (error) {
        console.error('Fetch DM conversations error:', error);
        return NextResponse.json({ success: false, message: '대화 목록을 불러오는 중 오류가 발생했습니다' }, { status: 500 });
    }
}
