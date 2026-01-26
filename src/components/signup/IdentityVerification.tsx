'use client';

import { useState, useEffect } from 'react';

interface IdentityData {
    name: string;
    phone: string;
    carrier: string;
    rrnFirst: string;
    rrnSecond: string;
}

interface IdentityVerificationProps {
    onComplete: (data: IdentityData) => void;
}

export default function IdentityVerification({ onComplete }: IdentityVerificationProps) {
    const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
    const [formData, setFormData] = useState<IdentityData>({
        name: '',
        phone: '',
        carrier: '',
        rrnFirst: '',
        rrnSecond: '',
    });

    // OTP State
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(180); // 3 minutes
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'OTP' && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Input masking for RRN
        if (name === 'rrnFirst' && value.length > 6) return;
        if (name === 'rrnSecond' && value.length > 1) return;

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendSMS = async () => {
        // Basic validation
        if (!formData.name || !formData.phone || !formData.carrier || !formData.rrnFirst || !formData.rrnSecond) {
            setError('모든 정보를 입력해주세요.');
            return;
        }

        setIsSending(true);
        setError('');

        // Mock API call simulation
        setTimeout(() => {
            setIsSending(false);
            setStep('OTP');
            setTimer(180);
        }, 1500);
    };

    const handleVerifyOTP = () => {
        if (otp === '123456') {
            onComplete(formData);
        } else {
            setError('인증번호가 올바르지 않습니다.');
        }
    };

    const handleResend = () => {
        setTimer(180);
        setError('');
        // Logic to resend...
    };

    if (step === 'FORM') {
        return (
            <div className="animate-fade-in space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">휴대폰 본인인증</h2>
                    <p className="text-gray-500 text-sm mt-2">안전한 서비스 이용을 위해 본인인증을 진행해주세요</p>
                </div>

                <div className="glass-form">
                    <div className="form-group">
                        <label>통신사</label>
                        <select
                            name="carrier"
                            value={formData.carrier}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">선택해주세요</option>
                            <option value="SKT">SKT</option>
                            <option value="KT">KT</option>
                            <option value="LGU+">LG U+</option>
                            <option value="SKT_MVNO">SKT 알뜰폰</option>
                            <option value="KT_MVNO">KT 알뜰폰</option>
                            <option value="LGU_MVNO">LG U+ 알뜰폰</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>이름</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="실명 입력"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label>주민등록번호</label>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <input
                                type="text"
                                name="rrnFirst"
                                placeholder="생년월일 6자리"
                                className="input-field text-center w-full min-w-0"
                                value={formData.rrnFirst}
                                onChange={handleChange}
                                inputMode="numeric"
                            />
                            <span className="text-gray-400 px-1">-</span>
                            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                                <input
                                    type="text"
                                    name="rrnSecond"
                                    placeholder="●"
                                    className="input-field text-center w-8 sm:w-12 flex-shrink-0"
                                    value={formData.rrnSecond}
                                    onChange={handleChange}
                                    inputMode="numeric"
                                />
                                <span className="text-gray-400 text-base sm:text-lg tracking-normal sm:tracking-widest whitespace-nowrap">●●●●●●</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>휴대폰번호</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="- 없이 입력"
                            className="input-field"
                            value={formData.phone}
                            onChange={handleChange}
                            inputMode="tel"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        onClick={handleSendSMS}
                        disabled={isSending}
                        className="btn-primary"
                    >
                        {isSending ? '전송 중...' : '인증번호 전송'}
                    </button>
                </div>

                <style jsx>{`
                    .glass-form {
                        background: var(--glass-bg, rgba(255,255,255,0.7));
                        border: 1px solid var(--glass-border, rgba(0,0,0,0.1));
                        border-radius: 20px;
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .form-group {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .form-group label {
                        font-size: 13px;
                        font-weight: 600;
                        color: #505866;
                        padding-left: 4px;
                    }
                    .input-field {
                        padding: 14px 16px;
                        border-radius: 12px;
                        border: 1px solid rgba(0,0,0,0.1);
                        background: rgba(255,255,255,0.8);
                        font-size: 16px;
                        outline: none;
                        transition: border-color 0.2s;
                    }
                    .input-field:focus {
                        border-color: #1F4EF5;
                    }
                    .btn-primary {
                        margin-top: 12px;
                        background: #1F4EF5;
                        color: white;
                        padding: 16px;
                        border-radius: 14px;
                        font-weight: 600;
                        font-size: 16px;
                        transition: opacity 0.2s;
                    }
                    .btn-primary:active { opacity: 0.8; }
                    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        );
    }

    // OTP Step
    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">인증번호 입력</h2>
                <p className="text-gray-500 text-sm mt-2">전송된 인증번호를 입력해주세요</p>
                <p className="text-blue-600 font-medium mt-1">{formData.phone}</p>
            </div>

            <div className="glass-form">
                <div className="form-group">
                    <label>인증번호 6자리</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            className="input-field w-full tracking-widest text-lg"
                            maxLength={6}
                            inputMode="numeric"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 font-medium text-sm">
                            {formatTime(timer)}
                        </span>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                    onClick={handleVerifyOTP}
                    className="btn-primary"
                >
                    확인
                </button>

                <div className="text-center mt-4">
                    <button
                        onClick={handleResend}
                        className="text-gray-500 text-sm underline"
                    >
                        문자가 안 왔어요 &gt;
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        인증번호가 오지 않는 경우 스팸함 확인 또는<br />재전송 버튼을 눌러주세요.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .glass-form {
                    background: var(--glass-bg, rgba(255,255,255,0.7));
                    border: 1px solid var(--glass-border, rgba(0,0,0,0.1));
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #505866;
                    padding-left: 4px;
                }
                .input-field {
                    padding: 14px 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.8);
                    font-size: 16px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    border-color: #1F4EF5;
                }
                .btn-primary {
                    margin-top: 12px;
                    background: #1F4EF5;
                    color: white;
                    padding: 16px;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: opacity 0.2s;
                }
                .btn-primary:active { opacity: 0.8; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
