import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Forum } from '@/models';
import { authOptions } from '@/lib/auth';

// GET - Fetch forum details by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const session = await getServerSession(authOptions);
        const forum = await Forum.findById(id).lean();

        if (!forum) {
            return NextResponse.json(
                { success: false, message: '포럼을 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        if (!session?.user) {
            const safe = { ...forum } as Record<string, unknown>;
            delete safe.hostPhone;
            return NextResponse.json({ success: true, event: safe });
        }

        return NextResponse.json({
            success: true,
            event: forum,
        });
    } catch (error) {
        console.error('Fetch forum error:', error);
        return NextResponse.json(
            { success: false, message: '포럼 정보를 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
