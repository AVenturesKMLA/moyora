'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

// 3D Removed

interface FormErrors {
    [key: string]: string;
}

export default function ClubRegisterPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        clubName: '',
        schoolName: '',
        category: '',
        description: '',
        location: '',
        meetingTime: '',
        recruitStatus: 'open', // open, close
        contactPhone: '',
        maxMembers: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.clubName.trim()) newErrors.clubName = '동아리명을 입력해주세요';
        if (!formData.schoolName.trim()) newErrors.schoolName = '학교명을 입력해주세요';
        if (!formData.category) newErrors.category = '분야를 선택해주세요';
        if (!formData.description.trim()) newErrors.description = '소개를 입력해주세요';
        if (formData.description.length < 20) newErrors.description = '소개는 최소 20자 이상 입력해주세요';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = '연락처를 입력해주세요';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/clubs', { // Updated endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Success
                router.push('/dashboard');
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || '등록에 실패했습니다.' });
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setErrors({ submit: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            <NavBar />

            {/* Background Decorations */}

            <main className="flex-1 container max-w-3xl py-12 relative z-10">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">새 동아리 등록</h1>
                    <p className="text-muted-foreground">
                        동아리를 등록하고 전국 100+ 동아리와 교류를 시작하세요.
                    </p>
                </div>

                <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>기본 정보</CardTitle>
                        <CardDescription>동아리의 가장 중요한 정보를 입력해주세요.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {errors.submit && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>오류</AlertTitle>
                                    <AlertDescription>
                                        {errors.submit}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="clubName">동아리명 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="clubName"
                                        name="clubName"
                                        placeholder="예: 사이언스랩"
                                        value={formData.clubName}
                                        onChange={handleChange}
                                        className={errors.clubName ? "border-destructive" : ""}
                                    />
                                    {errors.clubName && <p className="text-xs text-destructive">{errors.clubName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">학교명 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="schoolName"
                                        name="schoolName"
                                        placeholder="예: 서울과학고등학교"
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                        className={errors.schoolName ? "border-destructive" : ""}
                                    />
                                    {errors.schoolName && <p className="text-xs text-destructive">{errors.schoolName}</p>}
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="category">활동 분야 <span className="text-destructive">*</span></Label>
                                    <select
                                        id="category"
                                        name="category"
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            errors.category ? "border-destructive" : ""
                                        )}
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">분야 선택</option>
                                        <option value="science">과학 / 공학</option>
                                        <option value="math">수학</option>
                                        <option value="humanities">인문 / 사회</option>
                                        <option value="arts">예술 / 체육</option>
                                        <option value="startup">창업 / 경영</option>
                                        <option value="other">기타</option>
                                    </select>
                                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">대표 연락처 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="contactPhone"
                                        name="contactPhone"
                                        type="tel"
                                        placeholder="010-0000-0000"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        className={errors.contactPhone ? "border-destructive" : ""}
                                    />
                                    {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">동아리 소개 <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="동아리의 목표, 주요 활동 등을 상세히 적어주세요."
                                    className={cn("min-h-[120px] resize-y", errors.description ? "border-destructive" : "")}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                                <p className="text-xs text-muted-foreground text-right">{formData.description.length} / 20자 이상</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="location">주 활동 장소</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="예: 과학동 301호"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meetingTime">정기 모임 시간</Label>
                                    <Input
                                        id="meetingTime"
                                        name="meetingTime"
                                        placeholder="예: 매주 금요일 16:30"
                                        value={formData.meetingTime}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="maxMembers">최대 인원</Label>
                                    <Input
                                        id="maxMembers"
                                        name="maxMembers"
                                        type="number"
                                        placeholder="제한 없음"
                                        value={formData.maxMembers}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="recruitStatus">모집(면접) 상태</Label>
                                    <select
                                        id="recruitStatus"
                                        name="recruitStatus"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.recruitStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="open">모집 중 (면접 가능)</option>
                                        <option value="close">모집 마감</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4 justify-end">
                                <Button variant="outline" type="button" onClick={() => router.back()}>
                                    취소
                                </Button>
                                <Button type="submit" disabled={isLoading} className="w-full md:w-auto min-w-[120px]">
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                                            등록 중...
                                        </>
                                    ) : (
                                        '동아리 등록하기'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
