'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClubRegistrationFormProps {
    identityData: any;
    studentIdData: any;
}

interface FormErrors {
    [key: string]: string;
}

export default function ClubRegistrationForm({ identityData, studentIdData }: ClubRegistrationFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        schoolName: studentIdData?.schoolName || '',
        clubTheme: '',
        clubName: '',
        presidentName: identityData?.name || studentIdData?.studentName || '',
        presidentEmail: '',
        presidentPhone: identityData?.phone || '',
        clubEmail: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

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

        // Mock Submission
        setTimeout(() => {
            setIsLoading(false);
            // In real app: call API to register user + club
            router.push('/login?registered=true'); // Redirect to login
        }, 1500);
    };

    return (
        <div className="animate-fade-in pb-10">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">동아리 등록</h2>
                <p className="text-gray-500 text-sm mt-2">운영할 동아리 정보를 입력해주세요</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-section">
                    <h3>학교 정보</h3>
                    <div className="input-field-group">
                        <label>학교명 *</label>
                        <input
                            type="text"
                            name="schoolName"
                            className={errors.schoolName ? 'error' : ''}
                            value={formData.schoolName}
                            onChange={handleChange}
                            readOnly={!!studentIdData?.schoolName} // Lock if detected
                        />
                        {errors.schoolName && <span className="error-hint">{errors.schoolName}</span>}
                    </div>
                </div>

                <div className="form-section">
                    <h3>동아리 정보</h3>
                    <div className="input-field-group">
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

                    <div className="input-field-group">
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

                <div className="form-section">
                    <h3>회장 정보</h3>
                    <div className="input-field-group">
                        <label>이름 *</label>
                        <input
                            type="text"
                            name="presidentName"
                            value={formData.presidentName}
                            onChange={handleChange}
                            readOnly={!!identityData?.name}
                        />
                    </div>
                    <div className="input-field-group">
                        <label>전화번호 *</label>
                        <input
                            type="tel"
                            name="presidentPhone"
                            value={formData.presidentPhone}
                            onChange={handleChange}
                            readOnly={!!identityData?.phone}
                        />
                    </div>
                    <div className="input-field-group">
                        <label>이메일 *</label>
                        <input
                            type="email"
                            name="presidentEmail"
                            placeholder="example@school.ac.kr"
                            value={formData.presidentEmail}
                            onChange={handleChange}
                        />
                        {errors.presidentEmail && <span className="error-hint">{errors.presidentEmail}</span>}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-submit"
                    disabled={isLoading}
                >
                    {isLoading ? '등록 중...' : '등록 및 회원가입 완료하기'}
                </button>
            </form>

            <style jsx>{`
                .signup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .form-section {
                    background: #fff;
                    padding: 20px;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .form-section h3 {
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: #1A1E27;
                    border-bottom: 2px solid #D6DADF;
                    padding-bottom: 8px;
                }
                .input-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .input-field-group:last-child { margin-bottom: 0; }
                
                label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #505866;
                }
                input, select {
                    padding: 14px;
                    border-radius: 12px;
                    border: 1px solid #D6DADF;
                    font-size: 16px;
                    background: #f9f9f9;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #1F4EF5;
                    background: #fff;
                }
                input.error, select.error {
                    border-color: #1F4EF5;
                }
                .error-hint {
                    color: #1F4EF5;
                    font-size: 12px;
                }
                
                .btn-submit {
                    background: #1F4EF5;
                    color: white;
                    padding: 18px;
                    border-radius: 16px;
                    font-size: 17px;
                    font-weight: 700;
                    border: none;
                    margin-top: 12px;
                    box-shadow: 0 4px 12px rgba(31, 78, 245, 0.3);
                }
                .btn-submit:disabled {
                    opacity: 0.7;
                }

                @media (prefers-color-scheme: dark) {
                    .form-section { background: #1A1E27; }
                    .form-section h3 { color: #fff; border-color: #2c2c2e; }
                    input, select { background: #2c2c2e; border-color: #64768C; color: #fff; }
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
