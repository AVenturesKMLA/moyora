import Link from 'next/link';
import {
  ArrowLeft,
  Rocket,
  Users2,
  Globe,
  Code2,
  Palette,
  Megaphone,
  Handshake,
  FileBadge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5">
            About A:ventures
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            어벤쳐스 (A:ventures)
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            민족사관고등학교 기반의 학생 주도 경영·창업 동아리
          </p>
          <div className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed pt-4">
            어벤쳐스는 단순한 교내 활동을 넘어, 학생 주도의 기획과 실행을 통해
            실제로 작동하는 프로젝트를 만들고 운영하는 실행 중심의 팀입니다.
          </div>
        </div>
      </section>

      {/* Quick Overview Grid */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-secondary/20 transition-all hover:bg-secondary/30">
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileBadge className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">운영 기반</CardTitle>
                <CardDescription>공식적인 활동 증명</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                정식 사업자 등록을 완료하여 프로젝트 추진과 대외 활동을 제도적으로 뒷받침하고 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-secondary/20 transition-all hover:bg-secondary/30">
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">핵심 프로젝트: ‘모여라’</CardTitle>
                <CardDescription>전국 동아리 학술 교류 플랫폼</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                학교 간의 단절을 해소하고, 동아리 간 지식과 자료가 자연스럽게 교류되는 환경을 구축합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Description Section */}
      <section className="container max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-8 prose dark:prose-invert max-w-none">
          <div className="relative pl-6 border-l-4 border-primary/20">
            <p className="text-lg text-muted-foreground">
              어벤쳐스는 교내 행사 참여, 외부 포럼 참여 등 오프라인 활동을 꾸준히 이어오고 있으며,
              교내 굿즈 기획·제작·판매를 통해 제품 브랜딩부터 유통까지 전 과정을 직접 경험합니다.
              우리는 프로젝트를 단순한 &ldquo;아이디어&rdquo;가 아닌 &ldquo;운영 가능한 사업&rdquo;으로 다룹니다.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Globe className="h-8 w-8 text-primary" />
              학술 교류의 새로운 표준, &lsquo;모여라&rsquo;
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              &lsquo;모여라&rsquo;는 전국 동아리들이 하나의 플랫폼에서 자유롭게 학문적 교류를 진행할 수 있도록 돕습니다.
              게시판 수준을 넘어 자료 공유, 협업 제안, 활동 성과 아카이빙으로 이어지는 흐름을 설계하여
              청소년 학술·창업 생태계를 확대하는 것을 목표로 합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Users2 className="h-8 w-8 text-primary" />
            조직 구조
          </h2>
          <p className="text-muted-foreground">분야별 전문성을 기반으로 한 유기적인 협업 체계</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marketing */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">마케팅부</h3>
            <ul className="space-y-2 text-muted-foreground text-sm list-disc list-inside">
              <li>핵심 경영 및 홍보 전략 수립</li>
              <li>파트너십 및 대외협력</li>
              <li>서비스 운영 및 커뮤니티 확장</li>
            </ul>
          </div>

          {/* Design */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20">
              <Palette className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">디자인부</h3>
            <ul className="space-y-2 text-muted-foreground text-sm list-disc list-inside">
              <li>UX/UI 디자인 고도화</li>
              <li>제품 디자인 및 로고 제작</li>
              <li>브랜드 아이덴티티 구축</li>
            </ul>
          </div>

          {/* Development */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">개발부</h3>
            <ul className="space-y-2 text-muted-foreground text-sm list-disc list-inside">
              <li>플랫폼 기능 구현 및 유지보수</li>
              <li>서비스 운영 구조 설계</li>
              <li>기술 기반 시스템 자동화</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="container max-w-4xl mx-auto px-4 py-16">
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center space-y-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-4">
            <Handshake className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold">협력 희망 대상</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '전국 동아리', '학생단체', '교육 기관',
              '청소년 지원 기관', '기업 파트너', '기관 파트너'
            ].map((target) => (
              <Badge key={target} variant="secondary" className="px-5 py-2 text-sm font-semibold">
                {target}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground pt-4">
            어벤쳐스는 공동 프로젝트 및 후원·파트너십을 향해 항상 열려 있습니다.
          </p>
        </div>
      </section>

      {/* Footer / Contact CTA Placeholder */}
      <section className="container max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 A:ventures. All rights reserved. <br />
          민족사관고등학교(KMLA) 학생 주도 프로젝트
        </p>
      </section>
    </div>
  );
}
