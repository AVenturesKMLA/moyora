'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CollabRegisterPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        dateStart: '',
        dateEnd: '',
        location: '',
        description: '',
        budget: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요';
        if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
        if (!formData.dateStart) newErrors.dateStart = '시작일을 선택해주세요';
        if (!formData.description.trim()) newErrors.description = '상세 내용을 입력해주세요';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        // Simulate API Call
        try {
            // In a real app, this would be a POST to /api/collab
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Success
            router.push('/collab');
        } catch (error) {
            setErrors({ submit: '등록 중 오류가 발생했습니다.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col pb-20">
            <NavBar />

            <main className="container max-w-2xl py-12 relative z-10 animate-fade-in">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">협업 모집 등록</h1>
                    <p className="text-muted-foreground">
                        새로운 협업 프로젝트를 시작하고 파트너 동아리를 찾아보세요.
                    </p>
                </div>

                <Card className="border-border/60 shadow-lg">
                    <CardHeader>
                        <CardTitle>모집 공고 작성</CardTitle>
                        <CardDescription>
                            협업의 목적과 일정, 필요한 역할을 상세히 적어주세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errors.submit && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>오류</AlertTitle>
                                    <AlertDescription>{errors.submit}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="title">공고 제목 <span className="text-destructive">*</span></Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="예: 전국 고교 연합 해커톤 함께하실 분"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={errors.title ? "border-destructive" : ""}
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">카테고리 <span className="text-destructive">*</span></Label>
                                <Select onValueChange={(val) => handleSelectChange('category', val)}>
                                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                                        <SelectValue placeholder="카테고리 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contest">통합 대회</SelectItem>
                                        <SelectItem value="forum">연합 포럼</SelectItem>
                                        <SelectItem value="research">공동 연구</SelectItem>
                                        <SelectItem value="other">기타</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dateStart">시작일 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="dateStart"
                                        name="dateStart"
                                        type="date"
                                        value={formData.dateStart}
                                        onChange={handleChange}
                                        className={errors.dateStart ? "border-destructive" : ""}
                                    />
                                    {errors.dateStart && <p className="text-xs text-destructive">{errors.dateStart}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateEnd">종료일 (선택)</Label>
                                    <Input
                                        id="dateEnd"
                                        name="dateEnd"
                                        type="date"
                                        value={formData.dateEnd}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">장소 / 방식</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="예: 서울 강남구 / 온라인 Zoom"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">예산 / 비용 (선택)</Label>
                                <Input
                                    id="budget"
                                    name="budget"
                                    placeholder="예: 회비 1만원 / 스폰서 지원"
                                    value={formData.budget}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">상세 내용 <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="협업의 구체적인 목표, 대상, 커리큘럼 등을 자세히 적어주세요."
                                    className={cn("min-h-[150px] resize-y", errors.description ? "border-destructive" : "")}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button variant="outline" type="button" onClick={() => router.back()}>취소</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? '등록 중...' : '모집 공고 등록'}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
