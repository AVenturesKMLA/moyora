import { NextResponse } from 'next/server';
import { isDevAdminNoDbEnabled } from '@/lib/env-dev';

/**
 * 개발 전용: 클라이언트가 보내는 키가 서버 `DEV_ADMIN_LOGIN_KEY`와 같은지 확인 (키 값은 응답에 넣지 않음).
 */
export async function POST(req: Request) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { devKey?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const expected = process.env.DEV_ADMIN_LOGIN_KEY?.trim();
    const received = String(body.devKey ?? '').trim();

    return NextResponse.json({
        serverHasKey: Boolean(expected),
        keyMatches: Boolean(expected && received === expected),
        noDbMode: isDevAdminNoDbEnabled(),
    });
}
