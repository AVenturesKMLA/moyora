'use client';

import { useState } from 'react';
import MobileGuard from '@/components/signup/MobileGuard';
import RoleSelection from '@/components/signup/RoleSelection';
import IdentityVerification from '@/components/signup/IdentityVerification';
import StudentIDScanner from '@/components/signup/StudentIDScanner';
import ClubRegistrationForm from '@/components/signup/ClubRegistrationForm';
import ClubSearchForm from '@/components/signup/ClubSearchForm';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<'MEMBER' | 'CHIEF' | null>(null);

  // State for data collected across steps
  const [identityData, setIdentityData] = useState<any>(null);
  const [studentIdData, setStudentIdData] = useState<any>(null);

  const handleRoleSelect = (selectedRole: 'MEMBER' | 'CHIEF') => {
    setRole(selectedRole);
    setStep(2); // Move to Identity Verification
  };

  const handleIdentityComplete = (data: any) => {
    setIdentityData(data);
    setStep(3); // Move to Student ID Scanner
  };

  const handleScanComplete = (data: any) => {
    setStudentIdData(data);
    setStep(4); // Move to Final Registration Form
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
            {step === 1 && '회원가입'}
            {step === 2 && '본인 인증'}
            {step === 3 && '학생증 인증'}
            {step === 4 && '정보 입력'}
          </h1>
          <div className="placeholder-w24"></div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <main className="signup-content">
          {step === 1 && (
            <RoleSelection onSelectRole={handleRoleSelect} />
          )}

          {step === 2 && (
            <IdentityVerification
              onComplete={handleIdentityComplete}
            />
          )}

          {step === 3 && (
            <StudentIDScanner
              onComplete={handleScanComplete}
            />
          )}

          {step === 4 && (
            <div className="w-full">
              {role === 'CHIEF' ? (
                <ClubRegistrationForm
                  identityData={identityData}
                  studentIdData={studentIdData}
                />
              ) : (
                <ClubSearchForm
                  identityData={identityData}
                  studentIdData={studentIdData}
                />
              )}
            </div>
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
