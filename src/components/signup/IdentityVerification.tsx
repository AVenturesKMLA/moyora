'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ShieldCheck, Smartphone } from 'lucide-react';

interface IdentityData {
    name: string;
    phone: string;
    birthday: string;
}

interface IdentityVerificationProps {
    onComplete: (data: IdentityData) => void;
}

export default function IdentityVerification({ onComplete }: IdentityVerificationProps) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Load PortOne V2 SDK
        if (!document.getElementById('portone-sdk')) {
            const script = document.createElement('script');
            script.id = 'portone-sdk';
            script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
            script.async = true;
            document.body.appendChild(script);
        }

        // 2. Handle redirect return
        const handleRedirectReturn = async () => {
            const params = new URLSearchParams(window.location.search);
            const identityVerificationId = params.get('identityVerificationId');
            const code = params.get('code');
            const message = params.get('message');

            if (identityVerificationId && !code) {
                setIsVerifying(true);
                try {
                    const verifyRes = await fetch('/api/auth/verify-identity', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ identityVerificationId }),
                    });

                    const verifyResult = await verifyRes.json();
                    if (verifyResult.success) {
                        onComplete(verifyResult.data);
                    } else {
                        setError(verifyResult.message || '인증 확인 중 오류가 발생했습니다.');
                    }
                } catch (err) {
                    console.error('Redirect verification error:', err);
                    setError('인증 확인 중 오류가 발생했습니다.');
                } finally {
                    setIsVerifying(false);
                }
            } else if (code) {
                setError(message || '인증이 취소되었거나 실패했습니다.');
            }
        };

        handleRedirectReturn();
    }, [onComplete]);

    const handlePortOneVerify = async () => {
        if (!(window as any).PortOne) {
            setError('인증 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const PortOne = (window as any).PortOne;
            const identityVerificationId = `identity-verification-${crypto.randomUUID()}`;

            const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
            const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

            if (!storeId || !channelKey) {
                console.error('PortOne configuration missing:', { storeId, channelKey });
                setError('본인인증 설정(Store ID/Channel Key)이 누락되었습니다. Vercel에서 환경 변수 설정 후 새 배포가 필요할 수 있습니다.');
                setIsVerifying(false);
                return;
            }

            // 1. Request Identity Verification via PortOne V2 SDK
            console.log('Requesting PortOne V2 with:', { storeId, channelKey, identityVerificationId });
            const response = await PortOne.requestIdentityVerification({
                storeId,
                identityVerificationId,
                channelKey,
                redirectUrl: window.location.origin + window.location.pathname,
            });

            console.log('PortOne Response:', response);

            // The code property is only present if an error occurred during the verification request
            if (response.code !== undefined) {
                console.error('PortOne Error Code:', response.code, 'Message:', response.message);
                setError(response.message || '인증이 취소되었거나 실패했습니다.');
                setIsVerifying(false);
                return;
            }

            // 2. Verify result on server
            const verifyRes = await fetch('/api/auth/verify-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identityVerificationId }),
            });

            if (!verifyRes.ok) {
                const errorData = await verifyRes.json();
                throw new Error(errorData.message || '서버 인증 확인 실패');
            }

            const verifyResult = await verifyRes.json();

            if (verifyResult.success) {
                onComplete(verifyResult.data);
            } else {
                setError(verifyResult.message || '인증 확인 중 오류가 발생했습니다.');
            }
        } catch (err: any) {
            console.error('PortOne Verification Error Details:', err);
            setError(`오류 발생: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-8 py-4">
            <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 mb-6">
                    <ShieldCheck className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">본인 인증</h2>
                <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
                    안전하고 신뢰할 수 있는 활동을 위해<br />
                    휴대폰 본인인증을 진행해 주세요.
                </p>
            </div>

            <Card className="border-border/40 shadow-sm">
                <CardContent className="flex flex-col gap-6 pt-6">
                    <div className="flex flex-col items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">지원 서비스</span>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['SKT', 'KT', 'LG U+', '알뜰폰'].map((provider) => (
                                <span key={provider} className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                    {provider}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="h-16 w-full rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
                        onClick={handlePortOneVerify}
                        disabled={isVerifying}
                    >
                        {isVerifying ? (
                            <span className="flex items-center gap-2">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                인증 진행 중...
                            </span>
                        ) : '휴대폰 본인인증 시작하기'}
                    </Button>

                    <div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-center">
                        <p className="mb-2 text-xs text-muted-foreground text-center">테스트용 인증 시뮬레이터</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => onComplete({
                                name: '이모여',
                                phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
                                birthday: '1995-01-01'
                            })}
                        >
                            임의 번호로 인증 성공 처리
                        </Button>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <p className="text-center text-xs text-muted-foreground leading-normal">
                        본인인증 시 입력하신 개인정보는 본인확인 용도 외에<br />
                        별도로 저장되지 않으며, 암호화되어 보호됩니다.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
