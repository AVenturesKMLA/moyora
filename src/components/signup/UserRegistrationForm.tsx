'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupSchema, SignupInput } from '@/lib/validations';
import { ZodError } from 'zod';

interface IdentityData {
    name?: string;
    birthday?: string;
    phone?: string;
}

interface StudentIdData {
    schoolName?: string;
}

interface UserRegistrationFormProps {
    identityData: IdentityData;
    studentIdData: StudentIdData;
}

export default function UserRegistrationForm({ identityData, studentIdData }: UserRegistrationFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<SignupInput>>({
        name: identityData?.name || '',
        email: '',
        password: '',
        confirmPassword: '',
        birthday: identityData?.birthday || '',
        phone: identityData?.phone || '',
        schoolName: studentIdData?.schoolName || '',
        schoolId: studentIdData?.schoolName || 'UNKNOWN_SCHOOL', // Fallback to schoolName
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError('');
        setErrors({});

        try {
            // Validation
            const validatedData = signupSchema.parse(formData);

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validatedData),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const newErrors: { [key: string]: string } = {};
                    result.errors.forEach((err: { field: string; message: string }) => {
                        newErrors[err.field] = err.message;
                    });
                    setErrors(newErrors);
                } else {
                    setServerError(result.message || '회원가입 중 오류가 발생했습니다.');
                }
                return;
            }

            router.push('/login?registered=true');
        } catch (error) {
            if (error instanceof ZodError) {
                const newErrors: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                setServerError('시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in pb-10">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">마지막 단계</h2>
                <p className="text-gray-500 text-sm mt-2">로그인에 사용할 정보를 입력해주세요</p>
                <div className="mt-3 inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                    학교: {formData.schoolName}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
                {serverError && (
                    <div className="error-alert">
                        {serverError}
                    </div>
                )}

                <div className="form-section">
                    <div className="input-field-group">
                        <label>이름</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            readOnly
                            className="bg-gray-100 dark:bg-gray-800 text-gray-500"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="input-field-group flex-1">
                            <label>생년월일</label>
                            <input
                                type="text"
                                name="birthday"
                                value={formData.birthday}
                                readOnly
                                className="bg-gray-100 dark:bg-gray-800 text-gray-500"
                            />
                        </div>
                        <div className="input-field-group flex-1">
                            <label>휴대폰번호</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                readOnly
                                className="bg-gray-100 dark:bg-gray-800 text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="input-field-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            className={errors.email ? 'error' : ''}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {errors.email && <span className="error-hint">{errors.email}</span>}
                    </div>

                    <div className="input-field-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="8자 이상, 대소문자 및 숫자 포함"
                            className={errors.password ? 'error' : ''}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {errors.password && <span className="error-hint">{errors.password}</span>}
                    </div>

                    <div className="input-field-group">
                        <label>비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="비밀번호 다시 입력"
                            className={errors.confirmPassword ? 'error' : ''}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        {errors.confirmPassword && <span className="error-hint">{errors.confirmPassword}</span>}
                    </div>
                </div>

                <div className="terms-container">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="agreedToTerms"
                            checked={formData.agreedToTerms}
                            onChange={handleChange}
                        />
                        <span>이용약관 및 개인정보 처리방침에 동의합니다 (필수)</span>
                    </label>
                    {errors.agreedToTerms && <span className="error-hint">{errors.agreedToTerms}</span>}
                </div>

                <button
                    type="submit"
                    className="btn-submit"
                    disabled={isLoading}
                >
                    {isLoading ? '가입 중...' : '회원가입 완료하기'}
                </button>
            </form>

            <style jsx>{`
                .signup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .form-section {
                    background: #fff;
                    padding: 24px;
                    border-radius: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .input-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 20px;
                }
                .input-field-group:last-child { margin-bottom: 0; }
                
                label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #505866;
                }
                input {
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #D6DADF;
                    font-size: 16px;
                    transition: all 0.2s;
                }
                input:focus {
                    outline: none;
                    border-color: #1F4EF5;
                    box-shadow: 0 0 0 4px rgba(31, 78, 245, 0.1);
                }
                input.error {
                    border-color: #ff3b30;
                }
                .error-hint {
                    color: #ff3b30;
                    font-size: 12px;
                    margin-top: 4px;
                }
                .error-alert {
                    padding: 12px;
                    background: #fff5f5;
                    border: 1px solid #feb2b2;
                    color: #c53030;
                    border-radius: 12px;
                    font-size: 14px;
                    text-align: center;
                }
                
                .terms-container {
                    padding: 0 8px;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #505866;
                    font-weight: 500;
                }
                .checkbox-label input {
                    width: 20px;
                    height: 20px;
                    accent-color: #1F4EF5;
                }

                .btn-submit {
                    background: #1F4EF5;
                    color: white;
                    padding: 20px;
                    border-radius: 18px;
                    font-size: 18px;
                    font-weight: 700;
                    border: none;
                    box-shadow: 0 8px 16px rgba(31, 78, 245, 0.2);
                    transition: all 0.2s;
                }
                .btn-submit:active {
                    transform: scale(0.98);
                }
                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (prefers-color-scheme: dark) {
                    .form-section { background: #1A1E27; }
                    input { 
                        background: #2c2c2e; 
                        border-color: #3a3a3c; 
                        color: #fff; 
                    }
                    input.bg-gray-100 { background: #1c1c1e; color: #8e8e93; }
                    label { color: #8e8e93; }
                    .checkbox-label { color: #fff; }
                    .error-alert { background: #1a0606; border-color: #441a1a; color: #ff8080; }
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
