import { NextRequest, NextResponse } from 'next/server';
import type { Model } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, Schedule, Participant, Notification } from '@/models';

// 종료된 지 30일(1달)이 지난 협업(대회/포럼/공동연구)을 자동 삭제하는 크론 잡.
// "종료"는 이벤트 날짜(contestDate/forumDate/researchDate)가 지난 시점을 의미하므로,
// 이벤트 날짜가 (오늘 - 30일)보다 이전인 문서를 대상으로 합니다.
// vercel.json 의 crons 에 등록되어 매일 실행됩니다.

function authorizeCronRequest(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (!cronSecret) {
        return NextResponse.json(
            { success: false, message: 'Server misconfigured: CRON_SECRET is missing' },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        );
    }

    return null;
}

// 하나의 이벤트 유형에 대해: 만료된 문서 조회 → 연결 데이터 정리 → 문서 삭제
async function cleanupEventType(
    model: Model<any>,
    dateField: 'contestDate' | 'forumDate' | 'researchDate',
    eventType: 'contest' | 'forum' | 'co-research',
    cutoff: Date
): Promise<number> {
    // 만료 대상의 _id 목록만 먼저 조회
    const expired = await model
        .find({ [dateField]: { $lt: cutoff } })
        .select('_id')
        .lean();

    if (expired.length === 0) return 0;

    const eventIds = expired.map((e) => e._id);

    // 연결된 스케줄/참가/알림 정리 후 본체 삭제
    await Promise.all([
        Schedule.deleteMany({ eventType, eventId: { $in: eventIds } }),
        Participant.deleteMany({ eventType, eventId: { $in: eventIds } }),
        Notification.deleteMany({ eventType, eventId: { $in: eventIds } }),
    ]);

    const result = await model.deleteMany({ _id: { $in: eventIds } });
    return result.deletedCount ?? 0;
}

async function runCleanupJob(request: NextRequest) {
    try {
        const unauthorized = authorizeCronRequest(request);
        if (unauthorized) return unauthorized;

        await connectDB();

        // 오늘로부터 30일 전. 이 시점보다 이전에 종료된 협업이 삭제 대상.
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);

        const [contests, forums, researches] = await Promise.all([
            cleanupEventType(Contest, 'contestDate', 'contest', cutoff),
            cleanupEventType(Forum, 'forumDate', 'forum', cutoff),
            cleanupEventType(CoResearch, 'researchDate', 'co-research', cutoff),
        ]);

        const total = contests + forums + researches;

        return NextResponse.json({
            success: true,
            message: `Deleted ${total} expired collabs`,
            deleted: { contests, forums, researches, total },
            cutoff: cutoff.toISOString(),
        });
    } catch (error) {
        console.error('Cleanup collabs cron error:', error);
        return NextResponse.json(
            { success: false, message: 'Cleanup job failed' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return runCleanupJob(request);
}

export async function POST(request: NextRequest) {
    return runCleanupJob(request);
}
