'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';

type Step = 'email' | 'code' | 'password';

const STEP_TEXT: Record<Step, { title: string; description: string }> = {
  email: { title: '비밀번호 찾기', description: '가입한 이메일로 6자리 인증코드를 보내드려요' },
  code: { title: '인증코드 입력', description: '메일로 받은 6자리 인증코드를 입력해주세요' },
  password: { title: '새 비밀번호 설정', description: '새로 사용할 비밀번호를 입력해주세요' },
};

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.success !== false, message: data.message as string | undefined };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async () => {
    setIsLoading(true);
    setError('');
    setNotice('');
    try {
      const { ok, message } = await post('/api/auth/forgot-password/request', { email });
      if (!ok) {
        setError(message ?? '인증코드 발송에 실패했습니다');
        return;
      }
      setNotice(message ?? '인증코드를 보냈습니다');
      setCode('');
      setCooldown(60);
      setStep('code');
    } catch {
      setError('요청 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { ok, message } = await post('/api/auth/forgot-password/verify', { email, code });
      if (!ok) {
        setError(message ?? '인증코드가 올바르지 않습니다');
        return;
      }
      setNotice('');
      setStep('password');
    } catch {
      setError('요청 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { ok, message } = await post('/api/auth/forgot-password/reset', {
        email,
        code,
        password,
        confirmPassword,
      });
      if (!ok) {
        setError(message ?? '비밀번호 변경에 실패했습니다');
        return;
      }
      router.push('/login?reset=1');
    } catch {
      setError('요청 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') sendCode();
    else if (step === 'code') verifyCode();
    else resetPassword();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          로그인으로 돌아가기
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">모여라</h1>
          <p className="mt-2 text-muted-foreground">고교 동아리 이벤트 플랫폼</p>
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{STEP_TEXT[step].title}</CardTitle>
            <CardDescription>{STEP_TEXT[step].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {notice && (
                <div className="flex items-start gap-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <MailCheck className="h-5 w-5 shrink-0" />
                  <span>{notice}</span>
                </div>
              )}
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">!</div>
                  {error}
                </div>
              )}

              {step === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.ac.kr"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                  />
                </div>
              )}

              {step === 'code' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="code">인증코드</Label>
                    <span className="text-xs text-muted-foreground">{email}</span>
                  </div>
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    disabled={isLoading}
                    className="text-center text-lg tracking-[0.5em]"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setStep('email');
                        setNotice('');
                        setError('');
                      }}
                    >
                      이메일 다시 입력
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary disabled:opacity-50"
                      onClick={sendCode}
                      disabled={isLoading || cooldown > 0}
                    >
                      {cooldown > 0 ? `코드 재발송 (${cooldown}초)` : '코드 재발송'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'password' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">새 비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">8자 이상, 대문자·소문자·숫자 포함</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || (step === 'code' && code.length !== 6)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 'email' ? '인증코드 받기' : step === 'code' ? '확인' : '비밀번호 변경'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm">
            <span className="text-muted-foreground">비밀번호가 기억나셨나요?&nbsp;</span>
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              로그인
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
