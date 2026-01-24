import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { CoResearch, Schedule, User } from '@/models';
import { coResearchSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

// POST - Create a new co-research project
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

        const validationResult = coResearchSchema.safeParse(body);
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

        const coResearch = await CoResearch.create({
            userId: user._id,
            researchName: data.researchName,
            researchType: data.researchType,
            researchDate: new Date(data.researchDate),
            researchPlace: data.researchPlace,
            description: data.description,
            joiningClubs: data.joiningClubs ? data.joiningClubs.split(',').map((s: string) => s.trim()) : [],
            notices: data.notices || '',
            hostName: data.hostName,
            hostPhone: data.hostPhone,
        });

        await Schedule.create({
            eventType: 'co-research',
            eventId: coResearch._id,
            eventName: data.researchName,
            eventDate: new Date(data.researchDate),
            eventPlace: data.researchPlace,
            isPublic: true,
        });

        await Schedule.create({
            eventType: 'co-research',
            eventId: coResearch._id,
            eventName: data.researchName,
            eventDate: new Date(data.researchDate),
            eventPlace: data.researchPlace,
            isPublic: false,
            userId: user._id,
        });

        return NextResponse.json(
            {
                success: true,
                message: '공동연구가 등록되었습니다',
                coResearch,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create co-research error:', error);
        return NextResponse.json(
            { success: false, message: '공동연구 등록 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
