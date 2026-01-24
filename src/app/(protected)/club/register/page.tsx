'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';

const FloatingShapes = dynamic(() => import('@/components/canvas/FloatingShapes'), { ssr: false });

interface FormErrors {
    [key: string]: string;
}

export default function ClubRegisterPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        schoolName: '',
        clubTheme: '',
        clubName: '',
        presidentName: '',
        presidentEmail: '',
        presidentPhone: '',
        clubEmail: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Populate form with session data when available
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setFormData((prev) => ({
                ...prev,
                presidentName: session.user?.name || prev.presidentName,
                presidentEmail: session.user?.email || prev.presidentEmail,
            }));
        }
    }, [session, status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: FormErrors = {};

        if (!formData.schoolName) newErrors.schoolName = '학교명을 입력해주세요';
        if (!formData.clubTheme) newErrors.clubTheme = '동아리 분야를 선택해주세요';
        if (!formData.clubName) newErrors.clubName = '동아리명을 입력해주세요';
        if (!formData.presidentName) newErrors.presidentName = '회장 이름을 입력해주세요';
        if (!formData.presidentEmail) newErrors.presidentEmail = '회장 이메일을 입력해주세요';
        if (!formData.presidentPhone) newErrors.presidentPhone = '회장 전화번호를 입력해주세요';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/clubs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Club registration failed:', data);
                if (data.errors) {
                    const fieldErrors: FormErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => {
                        fieldErrors[err.field] = err.message;
                    });
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: data.message || '등록 중 오류가 발생했습니다' });
                }
                setIsLoading(false);
                return;
            }

            setSuccess(true);
            // Redirect immediately after showing success message
            setTimeout(() => {
                router.replace('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Club registration error:', err);
            setErrors({ general: '서버와 연결할 수 없습니다. 다시 시도해주세요.' });
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="success-page">
                <div className="success-island glass-card anim-scale-in">
                    <div className="check-icon-box">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1>등록 요청 완료</h1>
                    <p>동아리 정보가 성공적으로 제출되었습니다.</p>
                    <div className="loading-bar">
                        <div className="loading-progress"></div>
                    </div>
                </div>
                <style jsx>{`
                    .success-page {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #F2F2F7;
                        padding: 24px;
                    }
                    .success-island {
                        text-align: center;
                        padding: 60px 48px;
                        max-width: 440px;
                        width: 100%;
                    }
                    .check-icon-box {
                        width: 80px;
                        height: 80px;
                        background: #34C759;
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                        box-shadow: 0 10px 30px rgba(52, 199, 89, 0.3);
                    }
                    h1 { font-size: 1.8rem; font-weight: 800; color: #111; margin-bottom: 12px; }
                    p { color: #666; font-size: 1.05rem; }
                    .loading-bar {
                        margin-top: 32px;
                        height: 4px;
                        background: #E5E7EB;
                        border-radius: 2px;
                        overflow: hidden;
                    }
                    .loading-progress {
                        height: 100%;
                        background: #34C759;
                        width: 100%;
                        animation: progress 1.5s linear forwards;
                    }
                    @keyframes progress { from { width: 0; } to { width: 100%; } }
                    .anim-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
                    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="register-page">
            <NavBar />
            <FloatingShapes />

            <main className="register-main">
                <div className="container container-sm">
                    <div className="page-header">
                        <h1 className="page-title">동아리 등록하기</h1>
                        <p className="page-subtitle">모여라의 동아리 회원이 되어 다양한 활동을 시작해보세요</p>
                    </div>

                    <div className="form-card-apple glass-card">
                        {errors.general && (
                            <div className="toast-apple error">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>{errors.general}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="apple-form">
                            <div className="form-section-apple">
                                <div className="section-title-apple">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    <h3>학교 정보</h3>
                                </div>

                                <div className="input-field-apple">
                                    <label>학교명 *</label>
                                    <input
                                        type="text"
                                        name="schoolName"
                                        placeholder="재학 중인 학교 이름을 입력하세요"
                                        className={errors.schoolName ? 'error' : ''}
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                    />
                                    {errors.schoolName && <span className="error-hint">{errors.schoolName}</span>}
                                </div>
                            </div>

                            <div className="form-section-apple">
                                <div className="section-title-apple">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    <h3>동아리 정보</h3>
                                </div>

                                <div className="row-apple">
                                    <div className="input-field-apple flex-1">
                                        <label>분야 *</label>
                                        <select
                                            name="clubTheme"
                                            className={errors.clubTheme ? 'error' : ''}
                                            value={formData.clubTheme}
                                            onChange={handleChange}
                                        >
                                            <option value="">분야 선택</option>
                                            <option value="학술">학술</option>
                                            <option value="과학">과학</option>
                                            <option value="예술">예술</option>
                                            <option value="체육">체육</option>
                                            <option value="봉사">봉사</option>
                                            <option value="언론">언론</option>
                                            <option value="기타">기타</option>
                                        </select>
                                        {errors.clubTheme && <span className="error-hint">{errors.clubTheme}</span>}
                                    </div>

                                    <div className="input-field-apple flex-2">
                                        <label>동아리명 *</label>
                                        <input
                                            type="text"
                                            name="clubName"
                                            placeholder="동아리 공식 명칭"
                                            className={errors.clubName ? 'error' : ''}
                                            value={formData.clubName}
                                            onChange={handleChange}
                                        />
                                        {errors.clubName && <span className="error-hint">{errors.clubName}</span>}
                                    </div>
                                </div>

                                <div className="input-field-apple">
                                    <label>동아리 대표 이메일 (선택)</label>
                                    <input
                                        type="email"
                                        name="clubEmail"
                                        placeholder="club@example.com"
                                        value={formData.clubEmail}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-section-apple">
                                <div className="section-title-apple">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <h3>회장 정보</h3>
                                </div>

                                <div className="input-field-apple">
                                    <label>이름 *</label>
                                    <input
                                        type="text"
                                        name="presidentName"
                                        className={errors.presidentName ? 'error' : ''}
                                        value={formData.presidentName}
                                        onChange={handleChange}
                                    />
                                    {errors.presidentName && <span className="error-hint">{errors.presidentName}</span>}
                                </div>

                                <div className="row-apple">
                                    <div className="input-field-apple flex-1">
                                        <label>이메일 *</label>
                                        <input
                                            type="email"
                                            name="presidentEmail"
                                            className={errors.presidentEmail ? 'error' : ''}
                                            value={formData.presidentEmail}
                                            onChange={handleChange}
                                        />
                                        {errors.presidentEmail && <span className="error-hint">{errors.presidentEmail}</span>}
                                    </div>

                                    <div className="input-field-apple flex-1">
                                        <label>전화번호 *</label>
                                        <input
                                            type="tel"
                                            name="presidentPhone"
                                            placeholder="010-0000-0000"
                                            className={errors.presidentPhone ? 'error' : ''}
                                            value={formData.presidentPhone}
                                            onChange={handleChange}
                                        />
                                        {errors.presidentPhone && <span className="error-hint">{errors.presidentPhone}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions-apple">
                                <Link href="/dashboard" className="btn-apple-cancel">취소</Link>
                                <button
                                    type="submit"
                                    className={`btn-apple-submit ${isLoading ? 'loading' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '등록 중...' : '동아리 등록 신청하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .register-page {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                }

                .register-main {
                    padding: 40px 0 100px;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 48px;
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    margin-bottom: 12px;
                }

                .page-subtitle {
                    color: var(--color-text-secondary);
                    font-size: 1.1rem;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .form-card-apple {
                    padding: 48px;
                    max-width: 680px;
                    margin: 0 auto;
                }

                .apple-form {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                }

                .form-section-apple {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .section-title-apple {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--color-text-primary);
                    margin-bottom: 8px;
                }

                .section-title-apple h3 {
                    font-size: 1.25rem;
                    font-weight: 800;
                }

                .row-apple {
                    display: flex;
                    gap: 16px;
                }

                .flex-1 { flex: 1; }
                .flex-2 { flex: 2; }

                .input-field-apple {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .input-field-apple label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    padding-left: 4px;
                }

                .input-field-apple input, 
                .input-field-apple select {
                    padding: 16px;
                    border-radius: 16px;
                    border: 1px solid rgba(0,0,0,0.08);
                    background: #fff;
                    font-family: inherit;
                    font-size: 1rem;
                    transition: border 0.2s;
                }

                .input-field-apple input:focus,
                .input-field-apple select:focus {
                    border-color: #007AFF;
                    outline: none;
                }

                .input-field-apple input.error {
                    border-color: #FF3B30;
                    background: #FFF9F9;
                }

                .error-hint {
                    color: #FF3B30;
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding-left: 4px;
                }

                .form-actions-apple {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-top: 16px;
                }

                .btn-apple-cancel {
                    padding: 18px 32px;
                    border-radius: 20px;
                    font-weight: 700;
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .btn-apple-cancel:hover {
                    background: var(--glass-border);
                }

                .btn-apple-submit {
                    background: var(--color-text-primary);
                    color: var(--color-bg);
                    padding: 18px 40px;
                    border-radius: 20px;
                    border: none;
                    font-size: 1.05rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-apple-submit:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }

                .toast-apple {
                    padding: 14px 20px;
                    border-radius: 16px;
                    margin-bottom: 32px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .toast-apple.error {
                    background: #FFF2F2;
                    color: #FF3B30;
                    border: 1px solid rgba(255,59,48,0.1);
                }

                @media (max-width: 600px) {
                    .form-card-apple { padding: 32px 24px; }
                    .row-apple { flex-direction: column; }
                    .page-title { font-size: 2rem; }
                    .form-actions-apple { flex-direction: column-reverse; width: 100%; }
                    .btn-apple-submit { width: 100%; }
                    .btn-apple-cancel { text-align: center; width: 100%; }
                }
            `}</style>
        </div>
    );
}
