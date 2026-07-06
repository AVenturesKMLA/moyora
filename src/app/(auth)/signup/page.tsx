'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';

const SignupForm = dynamic(() => import('@/components/signup/SignupForm'), {
  loading: () => <div className="py-8 text-center text-sm text-muted-foreground">회원가입 폼 로딩 중...</div>,
});

const TOTAL_STEPS = 3;

const STEP_TITLES: Record<number, string> = {
  1: '정보 입력',
  2: '비밀번호 생성',
  3: '관심분야 선택',
};

export default function SignupPage() {
  const [step, setStep] = useState<number>(1);

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {step > 1 ? (
          <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
        )}
        <h1 className="text-lg font-semibold">{STEP_TITLES[step]}</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-2">
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
      </div>

      {/* Step Content */}
      <main className="container max-w-md px-4 pt-6">
        <SignupForm step={step} onStepChange={setStep} />
      </main>
    </div>
  );
}
