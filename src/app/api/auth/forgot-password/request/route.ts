import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetCode from '@/models/PasswordResetCode';
import { forgotPasswordRequestSchema } from '@/lib/validations';
import { sendPasswordResetCode } from '@/lib/mail';
import {
    generateResetCode,
    hashResetCode,
    RESET_CODE_RESEND_COOLDOWN_SECONDS,
    RESET_CODE_TTL_MINUTES,
} from '@/lib/passwordReset';

/** 1단계: 이메일로 6자리 인증코드 발송 */
export async function POST(request: NextRequest) {
    try {
        const parsed = forgotPasswordRequestSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.errors[0]?.message ?? '잘못된 요청입니다' },
                { status: 400 }
            );
        }
        const { email } = parsed.data;

        await connectDB();

        // 가입 여부와 관계없이 같은 응답을 준다 (가입된 이메일 노출 방지)
        const genericOk = NextResponse.json({
            success: true,
            message: '가입된 이메일이라면 인증코드가 발송되었습니다. 메일함(스팸함 포함)을 확인해주세요.',
        });

        const user = await User.findOne({ email }).select('_id');
        if (!user) return genericOk;

        const existing = await PasswordResetCode.findOne({ email });
        if (existing) {
            const elapsed = (Date.now() - existing.sentAt.getTime()) / 1000;
            if (elapsed < RESET_CODE_RESEND_COOLDOWN_SECONDS) {
                const wait = Math.ceil(RESET_CODE_RESEND_COOLDOWN_SECONDS - elapsed);
                return NextResponse.json(
                    { success: false, message: `${wait}초 후에 다시 요청해주세요.` },
                    { status: 429 }
                );
            }
        }

        const code = generateResetCode();
        await PasswordResetCode.findOneAndUpdate(
            { email },
            {
                email,
                codeHash: hashResetCode(email, code),
                expiresAt: new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000),
                sentAt: new Date(),
                attempts: 0,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        try {
            await sendPasswordResetCode(email, code, RESET_CODE_TTL_MINUTES);
        } catch (mailError) {
            console.error('Password reset mail error:', mailError);
            await PasswordResetCode.deleteOne({ email });
            return NextResponse.json(
                { success: false, message: '메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
                { status: 502 }
            );
        }

        return genericOk;
    } catch (error) {
        console.error('Forgot password request error:', error);
        return NextResponse.json(
            { success: false, message: '요청 처리 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
