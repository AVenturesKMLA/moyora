'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trophy, MessageSquare, Microscope, CheckCircle2 } from 'lucide-react';

const NetworkMap3D = dynamic(() => import('@/components/canvas/NetworkMap3D'), { ssr: false });

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden pb-16 pt-32 text-center md:pb-24 md:pt-48 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
          <NetworkMap3D />
        </div>

        {/* Grid Overlay Texture */}
        <div className="absolute inset-0 z-0 bg-background/20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, transparent, black)' }} />

        <div className="container relative z-10 flex max-w-[64rem] flex-col items-center gap-6 px-4">
          <Badge variant="secondary" className="px-4 py-2 text-sm backdrop-blur-md bg-background/50 border-input">
            전국을 연결하는 네트워크
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            동아리 활동의<br />
            <span className="text-primary">새로운 차원</span>
          </h1>

          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            전국 고등학교 동아리들이 모여라에서 만나고 협력하며 성장합니다.<br className="hidden sm:inline" />
            대회, 포럼, 공동연구까지 한 곳에서 경험하세요.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-12 rounded-full px-8 text-lg shadow-lg">
                  대시보드 열기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" className="h-12 rounded-full px-8 text-lg shadow-lg">
                  회원 가입하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/schedule">
              <Button variant="outline" size="lg" className="h-12 rounded-full px-8 text-lg backdrop-blur-sm bg-background/50">
                {session ? "일정 둘러보기" : "체험해보기"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section id="features" className="container py-12 md:py-24 lg:py-32 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">모여라의 기능</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            학교의 경계를 넘어 새로운 가능성을 발견하세요.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Card 1: Contest (Span 2 cols on tablet/desktop) */}
          <Card className="md:col-span-2 overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Trophy className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">통합 대회</CardTitle>
              <CardDescription className="text-lg">
                전국 규모의 동아리 대회에 참가하고 실력을 증명하세요.<br />
                다양한 분야의 경진대회가 여러분을 기다립니다.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2: Forum */}
          <Card className="border-border/50 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">연합 포럼</CardTitle>
              <CardDescription>
                다른 학교와 아이디어를 공유하고 토론하세요.<br />
                지식 공유의 장이 열립니다.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3: Research (Span 3 cols or 1 depending on layout choice, let's keep it consistent) */}
          <Card className="md:col-span-3 border-border/50 shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
            <CardHeader className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Microscope className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">공동 연구</CardTitle>
                <CardDescription className="text-base">
                  관심 분야가 같은 여러 동아리와 함께 프로젝트를 진행해보세요. 학교 간 장벽 없는 연구 협력이 가능합니다.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center pb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">3단계로 시작하는 동아리 활동</h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl">
              복잡한 절차 없이, 오직 활동에만 집중하세요.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">01</div>
              <h3 className="text-xl font-bold">신원 검증</h3>
              <p className="text-muted-foreground">학생증을 통한 철저한 본인인증으로<br />신뢰할 수 있는 커뮤니티를 보장합니다.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">02</div>
              <h3 className="text-xl font-bold">활동 참여</h3>
              <p className="text-muted-foreground">전국 곳곳의 동아리들과 협력하며<br />탄탄한 스펙과 경험을 쌓으세요.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">03</div>
              <h3 className="text-xl font-bold">상호 평가</h3>
              <p className="text-muted-foreground">활동 후 서로를 평가하며<br />건강한 동아리 생태계를 만들어갑니다.</p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="container py-12 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 text-center text-primary-foreground md:px-12 md:py-32 shadow-2xl">
          <div className="relative z-10 mx-auto max-w-4xl space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">지금 바로 시작하세요.</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80">전국의 100+ 동아리가 이미 활동 중입니다. 여러분의 동아리를 세상에 알리세요.</p>
            {!session && (
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="mt-4 h-14 rounded-full px-10 text-lg font-semibold shadow-lg">
                  회원 가입하기
                </Button>
              </Link>
            )}
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute left-[-10%] top-[-50%] h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[-10%] bottom-[-50%] h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>

    </div>
  );
}
