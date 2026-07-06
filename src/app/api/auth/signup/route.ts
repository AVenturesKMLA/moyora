import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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

        const { name, email, password, phone, schoolName, schoolId, grade, interests, agreedToTerms } = validationResult.data;

        await connectDB();

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

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            schoolName,
            schoolId,
            grade,
            interests,
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
