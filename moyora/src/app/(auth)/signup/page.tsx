'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MobileGuard from '@/components/signup/MobileGuard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';

const IdentityVerification = dynamic(() => import('@/components/signup/IdentityVerification'), {
  loading: () => <div className="py-8 text-center text-sm text-muted-foreground">인증 모듈 로딩 중...</div>,
});

const StudentIDScanner = dynamic(() => import('@/components/signup/StudentIDScanner'), {
  ssr: false,
  loading: () => <div className="py-8 text-center text-sm text-muted-foreground">학생증 스캐너 로딩 중...</div>,
});

const UserRegistrationForm = dynamic(() => import('@/components/signup/UserRegistrationForm'), {
  loading: () => <div className="py-8 text-center text-sm text-muted-foreground">회원가입 폼 로딩 중...</div>,
});

export default function SignupPage() {
  const [step, setStep] = useState<number>(1);

  // State for data collected across steps
  const [identityData, setIdentityData] = useState<any>(null);
  const [studentIdData, setStudentIdData] = useState<any>(null);

  // Safety check: Reset to step 1 if data is missing on refresh
  useEffect(() => {
    if (step > 1 && !identityData) {
      setStep(1);
    }
  }, [step, identityData]);

  const handleIdentityComplete = (data: any) => {
    setIdentityData(data);
    setStep(3); // Move to Final Registration Form (Skip Student ID Scanner)
  };

  const handleScanComplete = (data: any) => {
    setStudentIdData(data);
    setStep(3); // Move to Final Registration Form
  };

  return (
    <MobileGuard>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">
            {step === 1 && '본인 인증'}
            {step === 2 && '학생증 인증'}
            {step === 3 && '정보 입력'}
          </h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {/* Progress Bar */}
        <div className="px-4 pt-2">
          <Progress value={(step / 3) * 100} className="h-1.5" />
        </div>

        {/* Step Content */}
        <main className="container max-w-md px-4 pt-6">
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
      </div>
    </MobileGuard>
  );
}
