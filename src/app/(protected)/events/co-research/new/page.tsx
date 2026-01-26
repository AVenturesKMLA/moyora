'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormErrors {
    [key: string]: string;
}

export default function NewCoResearchPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        researchName: '',
        researchType: '',
        researchDate: '',
        researchPlace: '',
        description: '',
        joiningClubs: '',
        notices: '',
        hostName: '',
        hostPhone: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/events/co-research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    const fieldErrors: FormErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => fieldErrors[err.field] = err.message);
                    setErrors(fieldErrors);
                } else setErrors({ general: data.message || '등록 중 오류가 발생했습니다' });
                return;
            }
            router.push('/schedule');
        } catch (err) {
            console.error('Co-research registration error:', err);
            setErrors({ general: '등록 중 오류가 발생했습니다' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="event-page">
            <nav className="nav">
                <div className="container nav-container">
                    <Link href="/dashboard" className="nav-logo"><div className="nav-logo-icon">🎓</div>모여라</Link>
                    <Link href="/dashboard" className="btn btn-outline btn-sm">← 대시보드</Link>
                </div>
            </nav>

            <main className="register-main">
                <div className="container container-sm">
                    <div className="page-header">
                        <h1 className="page-title">공동연구 등록</h1>
                        <p className="page-subtitle">공동연구 프로젝트를 등록하고 파트너를 찾으세요</p>
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
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                    <h3>기본 정보</h3>
                                </div>

                                <div className="input-field-apple">
                                    <label>공동연구명 *</label>
                                    <input
                                        type="text"
                                        name="researchName"
                                        placeholder="예: 고등학생 AI 윤리 연구 프로젝트"
                                        className={errors.researchName ? 'error' : ''}
                                        value={formData.researchName}
                                        onChange={handleChange}
                                    />
                                    {errors.researchName && <span className="error-hint">{errors.researchName}</span>}
                                </div>

                                <div className="row-apple">
                                    <div className="input-field-apple flex-1">
                                        <label>분야 *</label>
                                        <select
                                            name="researchType"
                                            className={errors.researchType ? 'error' : ''}
                                            value={formData.researchType}
                                            onChange={handleChange}
                                        >
                                            <option value="">분야 선택</option>
                                            <option value="과학">과학</option>
                                            <option value="사회">사회</option>
                                            <option value="환경">환경</option>
                                            <option value="기술">기술</option>
                                            <option value="인문">인문</option>
                                            <option value="기타">기타</option>
                                        </select>
                                        {errors.researchType && <span className="error-hint">{errors.researchType}</span>}
                                    </div>

                                    <div className="input-field-apple flex-1">
                                        <label>기한 *</label>
                                        <input
                                            type="date"
                                            name="researchDate"
                                            className={errors.researchDate ? 'error' : ''}
                                            value={formData.researchDate}
                                            onChange={handleChange}
                                        />
                                        {errors.researchDate && <span className="error-hint">{errors.researchDate}</span>}
                                    </div>
                                </div>

                                <div className="input-field-apple">
                                    <label>장소 *</label>
                                    <input
                                        type="text"
                                        name="researchPlace"
                                        placeholder="예: 온라인 또는 각 학교 과학실"
                                        className={errors.researchPlace ? 'error' : ''}
                                        value={formData.researchPlace}
                                        onChange={handleChange}
                                    />
                                    {errors.researchPlace && <span className="error-hint">{errors.researchPlace}</span>}
                                </div>
                            </div>

                            <div className="form-section-apple">
                                <div className="section-title-apple">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                                    </svg>
                                    <h3>상세 내용</h3>
                                </div>

                                <div className="input-field-apple">
                                    <label>설명 *</label>
                                    <textarea
                                        name="description"
                                        placeholder="연구 주제, 목표, 방법론 등을 설명하세요"
                                        className={errors.description ? 'error' : ''}
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                    {errors.description && <span className="error-hint">{errors.description}</span>}
                                </div>

                                <div className="input-field-apple">
                                    <label>참여 동아리 (선택)</label>
                                    <input
                                        type="text"
                                        name="joiningClubs"
                                        placeholder="쉼표로 구분"
                                        value={formData.joiningClubs}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="input-field-apple">
                                    <label>기타 안내사항</label>
                                    <textarea
                                        name="notices"
                                        placeholder="참가자들에게 전달할 안내사항"
                                        value={formData.notices}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="form-section-apple">
                                <div className="section-title-apple">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <h3>주최자 정보</h3>
                                </div>

                                <div className="row-apple">
                                    <div className="input-field-apple flex-1">
                                        <label>이름 *</label>
                                        <input
                                            type="text"
                                            name="hostName"
                                            className={errors.hostName ? 'error' : ''}
                                            value={formData.hostName}
                                            onChange={handleChange}
                                        />
                                        {errors.hostName && <span className="error-hint">{errors.hostName}</span>}
                                    </div>

                                    <div className="input-field-apple flex-1">
                                        <label>연락처 *</label>
                                        <input
                                            type="tel"
                                            name="hostPhone"
                                            placeholder="010-1234-5678"
                                            className={errors.hostPhone ? 'error' : ''}
                                            value={formData.hostPhone}
                                            onChange={handleChange}
                                        />
                                        {errors.hostPhone && <span className="error-hint">{errors.hostPhone}</span>}
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
                                    {isLoading ? '등록 중...' : '공동연구 등록하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .event-page {
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
                .input-field-apple select,
                .input-field-apple textarea {
                    padding: 16px;
                    border-radius: 16px;
                    border: 1px solid rgba(0,0,0,0.08);
                    background: #fff;
                    font-family: inherit;
                    font-size: 1rem;
                    transition: border 0.2s;
                    resize: vertical;
                }

                .input-field-apple input:focus,
                .input-field-apple select:focus,
                .input-field-apple textarea:focus {
                    border-color: #1F4EF5;
                    outline: none;
                }

                .input-field-apple input.error,
                .input-field-apple select.error,
                .input-field-apple textarea.error {
                    border-color: #1F4EF5;
                    background: #FFF9F9;
                }

                .error-hint {
                    color: #1F4EF5;
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
                    color: #1F4EF5;
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
