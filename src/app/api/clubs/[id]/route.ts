import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Club } from '@/models';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: '유효하지 않은 동아리 ID입니다' }, { status: 400 });
        }
        const session = await getServerSession(authOptions);
        const club = await Club.findById(id).lean();

        if (!club) {
            return NextResponse.json({ success: false, message: '동아리를 찾을 수 없습니다' }, { status: 404 });
        }

        if (!session?.user) {
            const safe = { ...club } as Record<string, unknown>;
            delete safe.presidentEmail;
            delete safe.presidentPhone;
            delete safe.clubEmail;
            return NextResponse.json({ success: true, club: safe });
        }

        return NextResponse.json({ success: true, club });
    } catch (error) {
        console.error('Fetch club error:', error);
        return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다' }, { status: 500 });
    }
}
