import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Forum, Schedule, User } from '@/models';
import { forumSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

// POST - Create a new forum
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

        const validationResult = forumSchema.safeParse(body);
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

        const forum = await Forum.create({
            userId: user._id,
            forumName: data.forumName,
            forumType: data.forumType,
            forumDate: new Date(data.forumDate),
            forumPlace: data.forumPlace,
            description: data.description,
            forumClubs: data.forumClubs ? data.forumClubs.split(',').map((s: string) => s.trim()) : [],
            notices: data.notices || '',
            hostName: data.hostName,
            hostPhone: data.hostPhone,
        });

        await Schedule.create({
            eventType: 'forum',
            eventId: forum._id,
            eventName: data.forumName,
            eventDate: new Date(data.forumDate),
            eventPlace: data.forumPlace,
            isPublic: true,
        });

        await Schedule.create({
            eventType: 'forum',
            eventId: forum._id,
            eventName: data.forumName,
            eventDate: new Date(data.forumDate),
            eventPlace: data.forumPlace,
            isPublic: false,
            userId: user._id,
        });

        return NextResponse.json(
            {
                success: true,
                message: '포럼이 등록되었습니다',
                forum,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create forum error:', error);
        return NextResponse.json(
            { success: false, message: '포럼 등록 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
