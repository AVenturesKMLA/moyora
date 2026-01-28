'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PlanPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-5xl mx-auto space-y-8">
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

                <div className="mx-auto flex flex-col items-center justify-center gap-4 text-center pb-8">
                    <h1 className="text-3xl font-bold tracking-tighter md:text-5xl">멤버십 플랜</h1>
                    <p className="max-w-[85%] text-muted-foreground md:text-xl">
                        동아리의 규모와 필요에 맞는 최적의 플랜을 선택하세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                    {/* Basic */}
                    <Card className="flex flex-col border-border/50 transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">Basic</CardTitle>
                            <CardDescription>모든 동아리를 위한 기본 활동 지원</CardDescription>
                            <div className="mt-4 text-4xl font-bold">Free</div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 gap-4">
                            <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 동아리 프로필 생성</li>
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 교내 대회 참가</li>
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 기본 커뮤니티 접근</li>
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 프로젝트 룸 개설 (제한적)</li>
                            </ul>
                            <Button className="w-full mt-4" variant={session ? "outline" : "default"} asChild>
                                <Link href={session ? "/dashboard" : "/signup"}>{session ? "현재 이용중" : "무료로 시작하기"}</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Plus */}
                    <Card className="flex flex-col border-primary shadow-lg relative bg-primary/5 transition-all hover:shadow-xl">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 ">
                            <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1 text-sm">BEST</Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary">Plus</CardTitle>
                            <CardDescription>더 넓은 교류를 원하는 성장하는 동아리</CardDescription>
                            <div className="mt-4 text-4xl font-bold">Coming Soon</div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 gap-4">
                            <ul className="space-y-3 text-sm text-muted-foreground flex-1 opacity-75">
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 모든 Basic 기능 포함</li>
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 전국 연합 대회 참가 자격</li>
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 프리미엄 멘토링 매칭</li>
                                <li className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> 동아리 홍보 부스트</li>
                            </ul>
                            <Button className="w-full mt-4" size="lg" disabled>Coming Soon</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
