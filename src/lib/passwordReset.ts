import crypto from 'crypto';
import PasswordResetCode from '@/models/PasswordResetCode';

export const RESET_CODE_TTL_MINUTES = 10;
export const RESET_CODE_RESEND_COOLDOWN_SECONDS = 60;
export const RESET_CODE_MAX_ATTEMPTS = 5;

function getSecret(): string {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error('NEXTAUTH_SECRET 환경변수가 필요합니다');
    return secret;
}

export function generateResetCode(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashResetCode(email: string, code: string): string {
    return crypto.createHmac('sha256', getSecret()).update(`${email}:${code}`).digest('hex');
}

type CheckResult = { ok: boolean; message?: string };

/**
 * 인증코드를 확인한다. 틀리면 시도 횟수를 올린다.
 * 코드를 소모(삭제)하지는 않는다 — 비밀번호 변경이 끝난 뒤 호출 측에서 삭제.
 */
export async function checkResetCode(email: string, code: string): Promise<CheckResult> {
    const record = await PasswordResetCode.findOne({ email });

    if (!record || record.expiresAt.getTime() < Date.now()) {
        return { ok: false, message: '인증코드가 만료되었습니다. 코드를 다시 요청해주세요.' };
    }
    if (record.attempts >= RESET_CODE_MAX_ATTEMPTS) {
        return { ok: false, message: '시도 횟수를 초과했습니다. 코드를 다시 요청해주세요.' };
    }

    const expected = Buffer.from(record.codeHash, 'hex');
    const actual = Buffer.from(hashResetCode(email, code), 'hex');
    if (expected.length === actual.length && crypto.timingSafeEqual(expected, actual)) {
        return { ok: true };
    }

    const updated = await PasswordResetCode.findOneAndUpdate(
        { _id: record._id },
        { $inc: { attempts: 1 } },
        { new: true }
    );
    const left = Math.max(0, RESET_CODE_MAX_ATTEMPTS - (updated?.attempts ?? RESET_CODE_MAX_ATTEMPTS));
    return {
        ok: false,
        message:
            left > 0
                ? `인증코드가 올바르지 않습니다. (남은 시도 ${left}회)`
                : '시도 횟수를 초과했습니다. 코드를 다시 요청해주세요.',
    };
}
