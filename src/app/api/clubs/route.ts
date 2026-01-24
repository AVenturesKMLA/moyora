import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Club from '@/models/Club';
import { clubSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

let indexesChecked = false;

// GET - Fetch user's clubs
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        await connectDB();

        const { User } = await import('@/models');
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        const clubs = await Club.find({ userId: user._id }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            clubs,
        });
    } catch (error) {
        console.error('Fetch clubs error:', error);
        return NextResponse.json(
            { success: false, message: '동아리 목록을 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

// POST - Create a new club
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        await connectDB();

        if (!indexesChecked) {
            indexesChecked = true;
            try {
                const indexes = await Club.collection.indexes();
                const hasStaleIndex = indexes.some((idx: { name?: string }) => idx.name === 'name_1');
                if (hasStaleIndex) {
                    await Club.collection.dropIndex('name_1');
                }
            } catch (indexError) {
                console.log('Index check/drop skipped:', indexError);
            }
        }

        const body = await request.json();

        // Validate input
        const validationResult = clubSchema.safeParse(body);
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

        const { User } = await import('@/models');
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        const club = await Club.create({
            userId: user._id,
            ...validationResult.data,
        });

        return NextResponse.json(
            {
                success: true,
                message: '동아리가 등록되었습니다',
                club,
            },
            { status: 201 }
        );
    } catch (error) {
        const err = error as Error;
        console.error('Create club error:', err.message);
        return NextResponse.json(
            { success: false, message: '동아리 등록 중 오류가 발생했습니다', error: err.message },
            { status: 500 }
        );
    }
}
