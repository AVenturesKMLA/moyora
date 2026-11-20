import nodemailer, { Transporter } from 'nodemailer';

/**
 * Gmail SMTP 메일 발송.
 *
 * 필요한 환경변수:
 *  - GMAIL_USER: 보내는 Gmail 주소 (예: moyeora.team@gmail.com)
 *  - GMAIL_APP_PASSWORD: Google 계정의 "앱 비밀번호" 16자리 (일반 비밀번호 X)
 *    https://myaccount.google.com/apppasswords (2단계 인증이 켜져 있어야 생성 가능)
 *
 * 개발 환경에서 위 값이 없으면 실제로 보내지 않고 서버 콘솔에 내용을 출력한다.
 */

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
    return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransporter(): Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                // 앱 비밀번호는 공백 포함으로 복사되는 경우가 많아 제거
                pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
            },
        });
    }
    return transporter;
}

export interface SendMailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendMail({ to, subject, text, html }: SendMailOptions): Promise<void> {
    if (!isMailConfigured()) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                `\n[mail:dev] GMAIL_USER/GMAIL_APP_PASSWORD 미설정 — 실제 발송 대신 출력합니다.\n` +
                    `  To: ${to}\n  Subject: ${subject}\n  ${text.replace(/\n/g, '\n  ')}\n`
            );
            return;
        }
        throw new Error('메일 발송 설정(GMAIL_USER, GMAIL_APP_PASSWORD)이 없습니다');
    }

    await getTransporter().sendMail({
        from: `"모여라" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    });
}

export async function sendPasswordResetCode(to: string, code: string, minutes: number): Promise<void> {
    const subject = `[모여라] 비밀번호 재설정 인증코드: ${code}`;
    const text =
        `모여라 비밀번호 재설정 인증코드는 ${code} 입니다.\n` +
        `${minutes}분 안에 입력해주세요.\n\n` +
        `본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.`;
    const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
  <h1 style="font-size:20px;margin:0 0 8px">모여라 비밀번호 재설정</h1>
  <p style="margin:0 0 24px;color:#555;font-size:14px">아래 인증코드를 비밀번호 찾기 화면에 입력해주세요.</p>
  <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:20px;background:#f4f4f5;border-radius:12px">${code}</div>
  <p style="margin:24px 0 0;color:#555;font-size:13px">이 코드는 <b>${minutes}분</b> 동안만 유효합니다.<br/>본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.</p>
</div>`;
    await sendMail({ to, subject, text, html });
}
