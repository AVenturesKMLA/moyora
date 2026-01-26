'use client';

import { useState } from 'react';
import MobileGuard from '@/components/signup/MobileGuard';
import IdentityVerification from '@/components/signup/IdentityVerification';
import StudentIDScanner from '@/components/signup/StudentIDScanner';
import UserRegistrationForm from '@/components/signup/UserRegistrationForm';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState<number>(1);

  // State for data collected across steps
  const [identityData, setIdentityData] = useState<any>(null);
  const [studentIdData, setStudentIdData] = useState<any>(null);

  const handleIdentityComplete = (data: any) => {
    setIdentityData(data);
    setStep(2); // Move to Student ID Scanner
  };

  const handleScanComplete = (data: any) => {
    setStudentIdData(data);
    setStep(3); // Move to Final Registration Form
  };

  return (
    <MobileGuard>
      <div className="signup-flow-container">
        {/* Header (Simplified for Steps) */}
        <div className="signup-header">
          <Link href="/" className="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Link>
          <h1 className="header-title">
            {step === 1 && '본인 인증'}
            {step === 2 && '학생증 인증'}
            {step === 3 && '정보 입력'}
          </h1>
          <div className="placeholder-w24"></div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <main className="signup-content">
          {step === 1 && (
            <IdentityVerification
              onComplete={handleIdentityComplete}
            />
          )}

          {step === 2 && (
            <StudentIDScanner
              onComplete={handleScanComplete}
            />
          )}

          {step === 3 && (
            <UserRegistrationForm
              identityData={identityData}
              studentIdData={studentIdData}
            />
          )}
        </main>

        <style jsx>{`
                    .signup-flow-container {
                        min-height: 100vh;
                        background: #D6DADF; /* Apple-like light gray */
                        display: flex;
                        flex-direction: column;
                    }
                    @media (prefers-color-scheme: dark) {
                        .signup-flow-container {
                            background: #000000;
                        }
                    }
                    .signup-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 16px;
                        background: var(--glass-bg, rgba(255,255,255,0.8));
                        backdrop-filter: blur(10px);
                        position: sticky;
                        top: 0;
                        z-index: 50;
                    }
                    .back-button {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        color: #1F4EF5;
                    }
                    .header-title {
                        font-size: 17px;
                        font-weight: 600;
                        color: #1A1E27;
                    }
                    .placeholder-w24 { width: 40px; }
                    
                    .progress-bar-container {
                        padding: 0 16px;
                        margin-bottom: 24px;
                    }
                    .progress-track {
                        height: 4px;
                        background: #D6DADF;
                        border-radius: 2px;
                        overflow: hidden;
                    }
                    .progress-fill {
                        height: 100%;
                        background: #1F4EF5;
                        transition: width 0.3s ease;
                    }

                    .signup-content {
                        flex: 1;
                        padding: 0 20px 40px;
                        max-width: 600px;
                        width: 100%;
                        margin: 0 auto;
                    }

                     @media (prefers-color-scheme: dark) {
                        .header-title { color: #fff; }
                        .progress-track { background: #1A1E27; }
                     }
                `}</style>
      </div>
    </MobileGuard>
  );
}
