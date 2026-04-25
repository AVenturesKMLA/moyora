import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Schedule, User } from '@/models';
import { contestSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

// POST - Create a new contest
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const validationResult = contestSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return NextResponse.json(
                { success: false, errors },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        const data = validationResult.data;

        const contest = await Contest.create({
            userId: user._id,
            contestName: data.contestName,
            contestType: data.contestType,
            contestDate: new Date(data.contestDate),
            contestPlace: data.contestPlace,
            description: data.description,
            enteringClubs: data.enteringClubs ? data.enteringClubs.split(',').map((s: string) => s.trim()) : [],
            notices: data.notices || '',
            hostName: data.hostName,
            hostPhone: data.hostPhone,
        });

        await Schedule.create({
            eventType: 'contest',
            eventId: contest._id,
            eventName: data.contestName,
            eventDate: new Date(data.contestDate),
            eventPlace: data.contestPlace,
            isPublic: true,
        });

        await Schedule.create({
            eventType: 'contest',
            eventId: contest._id,
            eventName: data.contestName,
            eventDate: new Date(data.contestDate),
            eventPlace: data.contestPlace,
            isPublic: false,
            userId: user._id,
        });

        return NextResponse.json(
            {
                success: true,
                message: '대회가 등록되었습니다',
                contest,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create contest error:', error);
        return NextResponse.json(
            { success: false, message: '대회 등록 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
