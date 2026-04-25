import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// GET - Fetch user profile
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

        const user = await User.findOne({ email: session.user.email }).select('-password');
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                schoolName: user.schoolName,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json(
            { success: false, message: '프로필 조회 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

// Profile Update Schema
const updateProfileSchema = z.object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다').optional(),
    schoolName: z.string().min(2, '학교명을 입력해주세요').optional(),
    birthday: z.string().optional(),
});

// Password Change Schema
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z
        .string()
        .min(8, '새 비밀번호는 8자 이상이어야 합니다')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            '새 비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
        ),
});

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: '로그인이 필요합니다' },
                { status: 401 }
            );
        }

        const body = await request.json();

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: '사용자를 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        // Check if it's a password change request
        if (body.currentPassword && body.newPassword) {
            const validationResult = changePasswordSchema.safeParse(body);
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

            // Verify current password
            const isValidPassword = await bcrypt.compare(body.currentPassword, user.password);
            if (!isValidPassword) {
                return NextResponse.json(
                    { success: false, message: '현재 비밀번호가 일치하지 않습니다' },
                    { status: 400 }
                );
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(body.newPassword, 12);
            user.password = hashedPassword;
            await user.save();

            return NextResponse.json({
                success: true,
                message: '비밀번호가 변경되었습니다',
            });
        }

        // Profile update
        const validationResult = updateProfileSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                path: err.path
            }));
            return NextResponse.json(
                { success: false, errors },
                { status: 400 }
            );
        }

        const { name, schoolName, birthday } = validationResult.data;

        if (name) user.name = name;
        if (schoolName) user.schoolName = schoolName;
        if (birthday) user.birthday = new Date(birthday);

        await user.save();

        return NextResponse.json({
            success: true,
            message: '프로필이 업데이트되었습니다',
            user: {
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                schoolName: user.schoolName,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { success: false, message: '프로필 업데이트 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
