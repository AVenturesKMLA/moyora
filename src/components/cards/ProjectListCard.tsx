import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export interface ProjectData {
    id: string;
    title: string;
    team: string[];
    description: string;
    progress: number;
    status: 'in_progress' | 'completed';
    dueDate: string;
    type: string;
}

export function ProjectListCard({ project, onEnterRoom, buttonLabel }: { project: ProjectData, onEnterRoom?: () => void, buttonLabel?: string }) {
    const isCompleted = project.status === 'completed';

    return (
        <Card className="hover:shadow-md transition-shadow cursor-default group border-border/60">
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
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-muted/10 hover:bg-muted font-medium text-xs h-8"
                                onClick={onEnterRoom}
                            >
                                {buttonLabel || '프로젝트 룸 입장'} <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    )
}
