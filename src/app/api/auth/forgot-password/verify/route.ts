import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { forgotPasswordVerifySchema } from '@/lib/validations';
import { checkResetCode } from '@/lib/passwordReset';

/** 2단계: 인증코드 확인 (코드는 소모하지 않음 — 3단계에서 다시 검증) */
export async function POST(request: NextRequest) {
    try {
        const parsed = forgotPasswordVerifySchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.errors[0]?.message ?? '잘못된 요청입니다' },
                { status: 400 }
            );
        }
        const { email, code } = parsed.data;

        await connectDB();
        const result = await checkResetCode(email, code);
        if (!result.ok) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Forgot password verify error:', error);
        return NextResponse.json(
            { success: false, message: '요청 처리 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
