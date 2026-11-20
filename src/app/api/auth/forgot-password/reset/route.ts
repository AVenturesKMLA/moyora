import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetCode from '@/models/PasswordResetCode';
import { resetPasswordSchema } from '@/lib/validations';
import { checkResetCode } from '@/lib/passwordReset';

/** 3단계: 인증코드 재확인 후 새 비밀번호로 변경 */
export async function POST(request: NextRequest) {
    try {
        const parsed = resetPasswordSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.errors[0]?.message ?? '잘못된 요청입니다' },
                { status: 400 }
            );
        }
        const { email, code, password } = parsed.data;

        await connectDB();
        const result = await checkResetCode(email, code);
        if (!result.ok) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const updated = await User.updateOne({ email }, { $set: { password: hashedPassword } });
        await PasswordResetCode.deleteOne({ email });

        if (updated.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: '계정을 찾을 수 없습니다' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { success: false, message: '비밀번호 변경 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
