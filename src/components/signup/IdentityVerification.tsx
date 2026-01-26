'use client';

import { useState, useEffect } from 'react';

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
        // Load PortOne V2 SDK
        if (!document.getElementById('portone-sdk')) {
            const script = document.createElement('script');
            script.id = 'portone-sdk';
            script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

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

            // 1. Request Identity Verification via PortOne V2 SDK
            const response = await PortOne.requestIdentityVerification({
                storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-4ff4af41-85e3-4559-8eb8-0d08a2c6ceec',
                identityVerificationId,
                channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || 'channel-key-841961ee-5e13-4354-9e32-a548b29f9df3',
            });

            if (response.code !== undefined) {
                // Verification failed or canceled by user
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

            const verifyResult = await verifyRes.json();

            if (verifyResult.success) {
                onComplete(verifyResult.data);
            } else {
                setError(verifyResult.message || '인증 확인 중 오류가 발생했습니다.');
            }
        } catch (err) {
            console.error('PortOne Verification Error:', err);
            setError('인증 과정 중 예기치 못한 오류가 발생했습니다.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8 py-10">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 height-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1F4EF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">본인 인증</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
                    안전하고 신뢰할 수 있는 활동을 위해<br />
                    휴대폰 본인인증을 진행해 주세요.
                </p>
            </div>

            <div className="glass-card-container">
                <div className="verification-card">
                    <div className="auth-providers">
                        <span className="auth-label">지원 서비스</span>
                        <div className="provider-badges">
                            <span className="badge">SKT</span>
                            <span className="badge">KT</span>
                            <span className="badge">LG U+</span>
                            <span className="badge">알뜰폰</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePortOneVerify}
                        disabled={isVerifying}
                        className="btn-verify-main"
                    >
                        {isVerifying ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                인증 진행 중...
                            </span>
                        ) : '휴대폰 본인인증 시작하기'}
                    </button>

                    <div className="test-bypass">
                        <p>Credentials not ready? Use the simulator for testing:</p>
                        <button
                            type="button"
                            onClick={() => onComplete({
                                name: '이모여',
                                phone: '010-1234-5678',
                                birthday: '1995-01-01'
                            })}
                            className="btn-simulator"
                        >
                            인증 시뮬레이터 실행 (Test Bypass)
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {error}
                        </div>
                    )}

                    <p className="disclaimer">
                        본인인증 시 입력하신 개인정보는 본인확인 용도 외에<br />
                        별도로 저장되지 않으며, 암호화되어 보호됩니다.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .test-bypass {
                    margin-top: -16px;
                    padding: 16px;
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px dashed rgba(0, 0, 0, 0.1);
                    border-radius: 16px;
                    text-align: center;
                }
                .test-bypass p {
                    font-size: 12px;
                    color: #8e8e93;
                    margin-bottom: 8px;
                }
                .btn-simulator {
                    width: 100%;
                    padding: 10px;
                    background: #f1f3f5;
                    border: 1px solid #dee2e6;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #495057;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-simulator:hover {
                    background: #e9ecef;
                    border-color: #ced4da;
                }
                .glass-card-container {
                    perspective: 1000px;
                }
                .verification-card {
                    background: var(--glass-bg, rgba(255, 255, 255, 0.8));
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.4));
                    border-radius: 32px;
                    padding: 40px 32px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .auth-providers {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .auth-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #8e8e93;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .provider-badges {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .badge {
                    padding: 6px 12px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #505866;
                }
                .btn-verify-main {
                    height: 64px;
                    background: #1F4EF5;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 16px rgba(31, 78, 245, 0.2);
                }
                .btn-verify-main:hover {
                    transform: translateY(-2px);
                    background: #4880EE;
                    box-shadow: 0 12px 24px rgba(31, 78, 245, 0.3);
                }
                .btn-verify-main:active {
                    transform: translateY(0);
                }
                .btn-verify-main:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: center;
                    padding: 12px;
                    background: #fff5f5;
                    border-radius: 12px;
                    color: #ff3b30;
                    font-size: 14px;
                    font-weight: 500;
                }
                .disclaimer {
                    text-align: center;
                    font-size: 13px;
                    color: #8e8e93;
                    line-height: 1.6;
                }

                @media (prefers-color-scheme: dark) {
                    .verification-card {
                        background: rgba(26, 30, 39, 0.7);
                        border-color: rgba(255, 255, 255, 0.1);
                    }
                    .badge {
                        background: rgba(255, 255, 255, 0.1);
                        color: #B1B8C0;
                    }
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
