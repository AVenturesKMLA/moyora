'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const isDev = process.env.NODE_ENV === 'development';
/** Must match server `DEV_ADMIN_LOGIN_KEY` in `.env.local` (same string as NEXT_PUBLIC_*). */
const devKey = (process.env.NEXT_PUBLIC_DEV_ADMIN_LOGIN_KEY ?? '').trim();

export function DevAdminLoginButton() {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');

    if (!isDev) return null;

    if (!devKey) {
        return (
            <p className="text-center text-xs text-muted-foreground">
                개발용 관리자 로그인: `.env.local`에 `DEV_ADMIN_LOGIN_KEY`와 동일한 값으로
                `NEXT_PUBLIC_DEV_ADMIN_LOGIN_KEY`를 설정하세요.
            </p>
        );
    }

    async function handleClick() {
        setError('');
        setPending(true);
        try {
            let status: {
                serverHasKey?: boolean;
                keyMatches?: boolean;
                noDbMode?: boolean;
            };
            try {
                const check = await fetch('/api/dev/verify-admin-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ devKey }),
                });
                status = await check.json();
                if (!check.ok) {
                    setError('키 검증 요청이 실패했습니다. 개발 서버가 실행 중인지 확인하세요.');
                    return;
                }
            } catch {
                setError('네트워크 오류로 키를 확인할 수 없습니다.');
                return;
            }
            if (!status.serverHasKey) {
                setError(
                    '서버에 DEV_ADMIN_LOGIN_KEY가 없습니다. .env.local에 넣고 dev 서버를 재시작하세요.'
                );
                return;
            }
            if (!status.keyMatches) {
                setError(
                    '클라이언트 키와 서버 키가 다릅니다. DEV_ADMIN_LOGIN_KEY와 NEXT_PUBLIC_DEV_ADMIN_LOGIN_KEY를 동일한 문자열로 맞추고, npm run dev를 다시 실행하세요.'
                );
                return;
            }

            const result = await signIn('dev-admin', {
                devKey,
                redirect: false,
                callbackUrl: '/admin',
            });
            if (!result?.ok) {
                const err = result?.error ? ` (${result.error})` : '';
                const hint =
                    status.noDbMode === false
                        ? ' DEV_ADMIN_NO_DB가 꺼져 있으면 MongoDB에 사용자가 있어야 합니다.'
                        : '';
                setError(
                    `로그인 실패${err}.${hint} 터미널 오류가 있으면 서버 로그를 확인하세요.`
                );
                return;
            }
            window.location.href = '/admin';
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="space-y-1">
            <p className="text-center text-[11px] text-muted-foreground">
                개발 모드에서는 DB 없이 관리자 UI가 기본입니다. 실제 Mongo를 쓰려면{' '}
                <code className="rounded bg-muted px-1">DEV_ADMIN_NO_DB=false</code>로 끄세요.
            </p>
            <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-violet-500/50 text-violet-800 hover:bg-violet-50 dark:text-violet-200 dark:hover:bg-violet-950/40"
                disabled={pending}
                onClick={handleClick}
            >
                {pending ? '로그인 중…' : '[개발 전용] 관리자로 로그인'}
            </Button>
            {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
        </div>
    );
}
