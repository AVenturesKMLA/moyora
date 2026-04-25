'use client';

import { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, MoreHorizontal, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

// Mock Data for Projects
const MOCK_PROJECTS = [
    {
        id: 'p1',
        title: '전국 BM 케이스 스프린트: 핀테크 혁신',
        team: ['PRAGMATISM', 'Quant Forge'],
        description: '다양한 핀테크 앱의 BM을 분석하고 새로운 비즈니스 모델을 제안하는 단기 스프린트입니다.',
        progress: 48,
        status: 'in_progress',
        dueDate: '2025-02-15',
        type: 'Contest'
    },
    {
        id: 'p2',
        title: '환경 데이터 수집 봉사 + 리포트 발간',
        team: ['BioEdge', 'S2 Lab'],
        description: '지역별 대기질 및 수질 데이터를 직접 측정하고 이를 분석하여 환경 리포트를 작성합니다.',
        progress: 26,
        status: 'in_progress',
        dueDate: '2025-03-01',
        type: 'Co-Research'
    },
    {
        id: 'p3',
        title: 'AI 안전/윤리? 대신 시스템 리스크 연구',
        team: ['S2 Lab'],
        description: 'AI 모델의 시스템적 리스크를 식별하고 이를 완화하기 위한 기술적 방안을 논의합니다.',
        progress: 10,
        status: 'in_progress',
        dueDate: '2025-02-28',
        type: 'Forum'
    },
    {
        id: 'p4',
        title: '무대기술 교류전: 조명/음향/안전',
        team: ['StageCraft'],
        description: '각 학교의 무대 기술 노하우를 공유하고 안전 가이드라인을 수립하는 네트워킹 행사입니다.',
        progress: 90,
        status: 'completed',
        dueDate: '2025-01-10',
        type: 'Bootcamp'
    }
];

export default function ProjectsPage() {
    const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

    const filteredProjects = MOCK_PROJECTS.filter(p => {
        if (filter === 'all') return true;
        return p.status === filter;
    });

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <main className="container mx-auto max-w-5xl px-4 pt-8 md:px-6 md:pt-12 space-y-8 animate-fade-in relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">진행 중인 프로젝트</h1>
                        <p className="text-muted-foreground text-sm">
                            현재 참여 중이거나 관리 중인 모든 프로젝트의 현황을 한눈에 확인하세요.
                        </p>
                    </div>
                    <Button className="rounded-full shadow-md">
                        새 프로젝트 시작
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)} className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                        <TabsTrigger value="all">전체</TabsTrigger>
                        <TabsTrigger value="in_progress">진행 중</TabsTrigger>
                        <TabsTrigger value="completed">완료</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Project List */}
                <div className="space-y-4">
                    {filteredProjects.map(project => (
                        <ProjectListCard key={project.id} project={project} />
                    ))}

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                            <p className="text-muted-foreground">해당하는 프로젝트가 없습니다.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

function ProjectListCard({ project }: { project: typeof MOCK_PROJECTS[0] }) {
    const isCompleted = project.status === 'completed';

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer group border-border/60">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between">

                    {/* Left: Info */}
                    <div className="space-y-3 flex-1">
                        <div className="flex items-start justify-between md:justify-start gap-3">
                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-muted/20 border-0 h-6">
                                {project.type}
                            </Badge>
                            {isCompleted && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 h-6">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> 완료됨
                                </Badge>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {project.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground items-center pt-1">
                            <span>Team: <span className="text-foreground font-medium">{project.team.join(', ')}</span></span>
                            <span className="text-border mx-1">|</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.dueDate} 마감</span>
                        </div>
                    </div>

                    {/* Right: Progress & Action */}
                    <div className="w-full md:w-[250px] flex flex-col justify-end space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className={isCompleted ? "text-green-600" : "text-primary"}>
                                    {isCompleted ? '100%' : `${project.progress}% 달성`}
                                </span>
                                <span className="text-muted-foreground">
                                    {isCompleted ? '종료' : '진행중'}
                                </span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="ghost" size="sm" className="bg-muted/10 hover:bg-muted font-medium text-xs h-8">
                                프로젝트 룸 입장 <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    )
}
