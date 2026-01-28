'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-3xl space-y-8">
        {/* Back Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Link>
        </div>

        <div className="text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-primary">
            Company Introduction
          </h1>
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>
              어벤처스(AVentures)는 교내/교외 모든 활동의 시작과 끝을 함께합니다.
            </p>
            <p>
              더 많은 정보가 곧 업데이트될 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
