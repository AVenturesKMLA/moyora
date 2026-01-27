import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Club, ClubMember } from '@/models';
import { clubSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

let indexesChecked = false;

// GET - Fetch user's clubs
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const userSession = session.user as { schoolId?: string; id?: string };
        if (!userSession.schoolId) {
            return NextResponse.json(
                { success: false, message: '학교 정보가 없습니다. 다시 로그인해주세요.' },
                { status: 403 }
            );
        }

        await connectDB();

        const clubs = await Club.find({
            schoolId: userSession.schoolId
        }).sort({ createdAt: -1 });

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

        // Validate input using updated schema
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

        // Use type assertion for session user to access extended properties if needed
        const userSession = session.user as { schoolId?: string; id?: string; name?: string; email?: string };

        if (!userSession.schoolId || !userSession.id) {
            return NextResponse.json(
                { success: false, message: '학교 정보가 없습니다. 다시 로그인해주세요.' },
                { status: 403 }
            );
        }

        const {
            clubName,
            category,
            description,
            contactPhone,
            location,
            meetingTime,
            maxMembers,
            recruitStatus
        } = validationResult.data;

        // Map form fields to DB schema
        const clubTheme = category;
        const presidentPhone = contactPhone;
        const presidentName = userSession.name || 'Unknown';
        const presidentEmail = userSession.email || 'Unknown';

        // Check if club already exists in this school
        let club = await Club.findOne({
            schoolId: userSession.schoolId,
            clubName: { $regex: new RegExp(`^${clubName}$`, 'i') }
        });

        if (club) {
            return NextResponse.json(
                { success: false, message: '이미 등록된 동아리 이름입니다.' },
                { status: 409 }
            );
        }

        // Create new club and add as chief
        club = await Club.create({
            schoolName: validationResult.data.schoolName, // Ensure schoolName is passed from validation (from body)
            schoolId: userSession.schoolId,
            clubTheme,
            clubName,
            presidentName,
            presidentEmail,
            presidentPhone,
            description,
            location,
            meetingTime,
            maxMembers: maxMembers === '' ? undefined : maxMembers, // Handle empty string if coerce allowed it or casted
            recruitStatus,
            userId: userSession.id,
        });

        await ClubMember.create({
            userId: userSession.id,
            clubId: club._id,
            schoolId: userSession.schoolId,
            role: 'chief'
        });

        return NextResponse.json(
            {
                success: true,
                message: '새로운 동아리가 등록되었습니다',
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
