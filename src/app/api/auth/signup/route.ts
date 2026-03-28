import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SignupSession from '@/models/SignupSession';
import { signupSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = signupSchema.safeParse(body);
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

        const { name, email, password, birthday, phone, schoolName, schoolId, agreedToTerms, sessionToken } = validationResult.data;

        await connectDB();

        // Verify the signup session token
        if (!sessionToken) {
            return NextResponse.json(
                { success: false, message: '본인인증 토큰이 누락되었습니다.' },
                { status: 400 }
            );
        }

        const session = await SignupSession.findOne({ sessionToken });
        if (!session) {
            return NextResponse.json(
                { success: false, message: '유효하지 않은 본인인증 토큰입니다.' },
                { status: 400 }
            );
        }

        if (session.used) {
            return NextResponse.json(
                { success: false, message: '이미 사용된 본인인증 정보입니다.' },
                { status: 400 }
            );
        }

        if (session.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, message: '본인인증 유효시간이 만료되었습니다. 다시 시도해주세요.' },
                { status: 400 }
            );
        }

        // Validate that the request data matches the verified identity data
        if (
            session.name !== name ||
            session.phone !== phone ||
            new Date(session.birthday).toISOString().split('T')[0] !== new Date(birthday).toISOString().split('T')[0]
        ) {
            return NextResponse.json(
                { success: false, message: '입력된 정보가 임의로 변조되어 본인인증 정보와 일치하지 않습니다.' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: '이미 등록된 이메일입니다' },
                { status: 409 }
            );
        }

        const existingPhoneUser = await User.findOne({ phone });
        if (existingPhoneUser) {
            return NextResponse.json(
                { success: false, message: '이미 등록된 전화번호입니다. 기존 계정으로 로그인해 주세요.' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Mark session as used
        session.used = true;
        await session.save();

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            birthday: new Date(birthday),
            phone,
            schoolName,
            schoolId,
            agreedToTerms,
        });

        return NextResponse.json(
            {
                success: true,
                message: '회원가입이 완료되었습니다',
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, message: '회원가입 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
