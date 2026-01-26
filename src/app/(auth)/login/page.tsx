'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다');
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

      <div className="auth-container">
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
            <h1 className="auth-title">모여라</h1>
            <p className="auth-subtitle">고교 동아리 이벤트 플랫폼에 오신 것을 환영합니다</p>
          </div>

          {/* Login Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {registered && (
              <div className="auth-success">
                <div className="success-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="success-text">
                  <span className="success-title">회원가입 완료!</span>
                  <span className="success-desc">로그인하여 시작하세요.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="example@school.ac.kr"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg w-full ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? '' : '로그인'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>또는</span>
          </div>

          {/* Sign Up Link */}
          <div className="auth-footer">
            <p>
              아직 계정이 없으신가요?{' '}
              <Link href="/signup">회원가입</Link>
            </p>
          </div>
        </div>

        {/* Floating Badge */}
        <div className="auth-badge">
          <div className="badge-icon">🎓</div>
          <div className="badge-text">
            <span className="badge-title">대한민국 고등학교</span>
            <span className="badge-subtitle">동아리를 위한 플랫폼</span>
          </div>
        </div>
      </div>

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
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(129, 199, 132, 0.1));
          animation: float 20s ease-in-out infinite;
          filter: blur(60px);
        }

        .decoration-1 {
          width: 600px;
          height: 600px;
          top: -200px;
          right: -200px;
          animation-delay: 0s;
        }

        .decoration-2 {
          width: 400px;
          height: 400px;
          bottom: -100px;
          left: -100px;
          animation-delay: -5s;
        }

        .decoration-3 {
          width: 300px;
          height: 300px;
          top: 50%;
          left: 10%;
          animation-delay: -10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -20px) rotate(5deg);
          }
          50% {
            transform: translate(-10px, 10px) rotate(-3deg);
          }
          75% {
            transform: translate(15px, 15px) rotate(3deg);
          }
        }

        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
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
          box-shadow: 0 8px 16px rgba(31, 78, 245, 0.2);
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
          box-shadow: 0 8px 20px rgba(31, 78, 245, 0.2);
        }

        .btn-lg {
          padding: 16px;
          font-size: 18px;
        }
        
        .w-full {
          width: 100%;
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

        /* Success Message */
        .auth-success {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: rgba(72, 128, 238, 0.1);
            border: 1px solid rgba(72, 128, 238, 0.3);
            border-radius: 16px;
            margin-bottom: 24px;
            animation: slideDown 0.4s ease-out;
        }

        .success-icon {
            width: 32px;
            height: 32px;
            background: #4880EE;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }

        .success-text {
            display: flex;
            flex-direction: column;
        }

        .success-title {
            font-weight: 700;
            color: #1b5e20;
            font-size: 15px;
        }

        .success-desc {
            font-size: 13px;
            color: #2e7d32;
        }
        
        /* Error Message */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 12px;
          color: #d32f2f;
          font-size: 14px;
          margin-bottom: 20px;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Badge (Hidden on mobile) */
        .auth-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .badge-icon {
          font-size: 32px;
        }

        .badge-text {
          display: flex;
          flex-direction: column;
        }

        .badge-title {
          font-weight: 600;
          color: #1b5e20;
          font-size: 14px;
        }

        .badge-subtitle {
          font-size: 12px;
          color: #757575;
        }

        @media (max-width: 480px) {
          .auth-badge {
            display: none;
          }
          .auth-card {
            padding: 24px 16px;
          }
          .auth-title {
            font-size: 20px;
          }
          .auth-subtitle {
            font-size: 13px;
          }
        }
        @media (max-width: 360px) {
          .auth-page {
            padding: 12px;
          }
          .auth-card {
            padding: 20px 12px;
          }
        }
      `}</style>
    </div>
  );
}
