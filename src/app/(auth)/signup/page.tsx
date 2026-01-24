'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormErrors {
  [key: string]: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    schoolName: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상 입력해주세요';
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '대문자, 소문자, 숫자를 포함해야 합니다';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};

    if (!formData.birthday) {
      newErrors.birthday = '생년월일을 입력해주세요';
    }
    if (!formData.schoolName || formData.schoolName.length < 2) {
      newErrors.schoolName = '학교명을 입력해주세요';
    }
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = '이용약관에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: FormErrors = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.message || '회원가입 중 오류가 발생했습니다' });
        }
        return;
      }

      // Success - redirect to login
      router.push('/login?registered=true');
    } catch {
      setErrors({ general: '회원가입 중 오류가 발생했습니다' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link href="/" className="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        돌아가기
      </Link>

      {/* Decorative Elements */}
      <div className="auth-decorations">
        <div className="decoration-circle decoration-1"></div>
        <div className="decoration-circle decoration-2"></div>
        <div className="decoration-circle decoration-3"></div>
      </div>

      <div className="auth-container container-sm">
        <div className="auth-card fade-in">
          {/* Logo & Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h1 className="auth-title">회원가입</h1>
            <p className="auth-subtitle">모여라에 참여하고 동아리 활동을 시작하세요</p>
          </div>

          {/* Progress Indicator */}
          <div className="signup-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span className="step-label">계정 정보</span>
            </div>
            <div className="progress-line">
              <div className={`progress-fill ${step >= 2 ? 'filled' : ''}`}></div>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span className="step-label">학교 정보</span>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step fade-in">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">이름</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">이메일</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    placeholder="example@school.ac.kr"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">비밀번호</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                    placeholder="대문자, 소문자, 숫자 포함 8자 이상"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">비밀번호 확인</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-lg w-full"
                  onClick={handleNext}
                >
                  다음 단계
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step fade-in">
                <div className="form-group">
                  <label htmlFor="birthday" className="form-label">생년월일</label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    className={`form-input ${errors.birthday ? 'form-input-error' : ''}`}
                    value={formData.birthday}
                    onChange={handleChange}
                  />
                  {errors.birthday && <p className="form-error">{errors.birthday}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="schoolName" className="form-label">학교명</label>
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    className={`form-input ${errors.schoolName ? 'form-input-error' : ''}`}
                    placeholder="OO고등학교"
                    value={formData.schoolName}
                    onChange={handleChange}
                  />
                  {errors.schoolName && <p className="form-error">{errors.schoolName}</p>}
                </div>

                <div className="form-group">
                  <div className="form-checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="agreedToTerms"
                      name="agreedToTerms"
                      className="form-checkbox"
                      checked={formData.agreedToTerms}
                      onChange={handleChange}
                    />
                    <label htmlFor="agreedToTerms" className="form-checkbox-label">
                      <button
                        type="button"
                        className="terms-link"
                        onClick={() => setShowTerms(true)}
                      >
                        이용약관
                      </button>
                      {' '}및{' '}
                      <button
                        type="button"
                        className="terms-link"
                        onClick={() => setShowTerms(true)}
                      >
                        개인정보처리방침
                      </button>
                      에 동의합니다
                    </label>
                  </div>
                  {errors.agreedToTerms && <p className="form-error">{errors.agreedToTerms}</p>}
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleBack}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    이전
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary flex-1 ${isLoading ? 'btn-loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? '' : '가입 완료'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>또는</span>
          </div>

          {/* Login Link */}
          <div className="auth-footer">
            <p>
              이미 계정이 있으신가요?{' '}
              <Link href="/login">로그인</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>이용약관</h2>
              <button className="modal-close" onClick={() => setShowTerms(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <h3>제1조 (목적)</h3>
              <p>본 약관은 모여라 서비스(이하 &quot;서비스&quot;)의 이용에 관한 조건 및 절차에 관한 기본적인 사항을 규정함을 목적으로 합니다.</p>

              <h3>제2조 (서비스의 목적)</h3>
              <p>본 서비스는 대한민국 고등학교 동아리들의 대회, 포럼, 공동연구 활동을 지원하기 위한 플랫폼입니다.</p>

              <h3>제3조 (개인정보 보호)</h3>
              <p>회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.</p>

              <h3>제4조 (서비스 이용)</h3>
              <p>회원은 서비스를 이용하여 동아리 활동 정보를 공유하고, 다른 동아리와 교류할 수 있습니다.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowTerms(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background-color: var(--color-bg);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .auth-decorations {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .back-link {
            position: absolute;
            top: 24px;
            left: 24px;
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--color-text-secondary);
            font-weight: 600;
            font-size: 15px;
            text-decoration: none;
            z-index: 10;
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(10px);
            border-radius: 99px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.2s;
        }

        .back-link:hover {
            background: rgba(255, 255, 255, 0.8);
            transform: translateX(-4px);
            color: var(--color-text-primary);
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(0, 122, 255, 0.1));
          animation: float 20s ease-in-out infinite;
          filter: blur(60px);
        }

        .decoration-1 {
          width: 600px;
          height: 600px;
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .decoration-2 {
          width: 400px;
          height: 400px;
          bottom: -100px;
          right: -100px;
          animation-delay: -7s;
        }

        .decoration-3 {
          width: 250px;
          height: 250px;
          top: 40%;
          right: 5%;
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(15px, -25px) rotate(5deg);
          }
          66% {
            transform: translate(-15px, 15px) rotate(-5deg);
          }
        }

        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 500px;
        }

        .auth-card {
          background: var(--glass-bg);
          backdrop-filter: var(--material-thick);
          -webkit-backdrop-filter: var(--material-thick);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 40px;
          box-shadow: var(--glass-shadow);
        }

        .auth-logo {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--color-blue), var(--color-teal));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 24px;
          box-shadow: 0 8px 16px rgba(0, 122, 255, 0.2);
        }

        .auth-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--color-text-primary);
          text-align: center;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          font-size: 15px;
          color: var(--color-text-secondary);
          text-align: center;
          margin-bottom: 32px;
        }

        .signup-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--glass-border);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .progress-step.active .step-number {
          background: var(--color-blue);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }

        .step-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .progress-step.active .step-label {
          color: var(--color-blue);
        }

        .progress-line {
          width: 60px;
          height: 3px;
          background: var(--glass-border);
          border-radius: 2px;
          margin: 0 12px;
          margin-bottom: 28px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 0;
          background: var(--color-blue);
          transition: width 0.3s ease;
        }

        .progress-fill.filled {
          width: 100%;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.3);
          border-radius: 12px;
          color: var(--color-red);
          font-size: 14px;
          margin-bottom: 20px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          padding-left: 4px;
        }

        .form-input {
          padding: 14px 16px;
          background: var(--color-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--color-text-primary);
          font-family: inherit;
          font-size: 15px;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: var(--color-blue);
          box-shadow: 0 0 0 4px rgba(0, 122, 244, 0.1);
          outline: none;
        }

        .form-input-error {
          border-color: var(--color-red);
          background: rgba(255, 59, 48, 0.05);
        }

        .form-error {
          font-size: 12px;
          color: var(--color-red);
          font-weight: 500;
          padding-left: 4px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: var(--color-blue);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 122, 255, 0.2);
        }

        .btn-secondary {
          background: var(--glass-border);
          color: var(--color-text-primary);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 32px 0;
          color: var(--color-text-tertiary);
          font-size: 13px;
        }

        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--glass-border);
        }

        .auth-footer {
          text-align: center;
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .auth-footer a {
          color: var(--color-blue);
          font-weight: 600;
          text-decoration: none;
        }

        .terms-link {
          background: none;
          border: none;
          color: var(--color-blue);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-size: inherit;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .modal-content {
          background: var(--color-card);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--glass-shadow);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid var(--glass-border);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--color-text-secondary);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          color: var(--color-text-primary);
        }

        .modal-body h3 {
          font-size: 15px;
          font-weight: 700;
          margin-top: 20px;
          margin-bottom: 8px;
        }

        .modal-body p {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
