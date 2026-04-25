'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, MapPin, User, Phone, FileText, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormErrors {
    [key: string]: string;
}

export default function NewForumPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        forumName: '',
        forumType: '',
        forumDate: '',
        forumPlace: '',
        description: '',
        forumClubs: '',
        notices: '',
        hostName: '',
        hostPhone: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};
        if (!formData.forumName.trim()) newErrors.forumName = '포럼명을 입력해주세요';
        if (!formData.forumType) newErrors.forumType = '유형을 선택해주세요';
        if (!formData.forumDate) newErrors.forumDate = '일자를 선택해주세요';
        if (!formData.forumPlace.trim()) newErrors.forumPlace = '장소를 입력해주세요';
        if (!formData.description.trim()) newErrors.description = '설명을 입력해주세요';
        if (!formData.hostName.trim()) newErrors.hostName = '주최자 이름을 입력해주세요';
        if (!formData.hostPhone.trim()) newErrors.hostPhone = '연락처를 입력해주세요';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/events/forum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const fieldErrors: FormErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => {
                        fieldErrors[err.field] = err.message;
                    });
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: data.message || '등록 중 오류가 발생했습니다' });
                }
                return;
            }

            router.push('/schedule');
        } catch (err) {
            console.error('Forum registration error:', err);
            setErrors({ general: '등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col">
            <NavBar />

            <main className="flex-1 container max-w-3xl py-12 relative z-10">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">포럼 등록</h1>
                    <p className="text-muted-foreground">
                        포럼 정보를 입력하고 참가자를 모집하세요.
                    </p>
                </div>

                <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            포럼 정보
                        </CardTitle>
                        <CardDescription>개최하려는 포럼의 상세 정보를 입력해주세요.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {errors.general && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>오류</AlertTitle>
                                    <AlertDescription>{errors.general}</AlertDescription>
                                </Alert>
                            )}

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="forumName">포럼명 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="forumName"
                                        name="forumName"
                                        placeholder="예: 청소년 환경 보호 포럼"
                                        value={formData.forumName}
                                        onChange={handleChange}
                                        className={errors.forumName ? "border-destructive" : ""}
                                    />
                                    {errors.forumName && <p className="text-xs text-destructive">{errors.forumName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="forumType">유형 <span className="text-destructive">*</span></Label>
                                    <select
                                        id="forumType"
                                        name="forumType"
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            errors.forumType ? "border-destructive" : ""
                                        )}
                                        value={formData.forumType}
                                        onChange={handleChange}
                                    >
                                        <option value="">유형 선택</option>
                                        <option value="토론">토론</option>
                                        <option value="세미나">세미나</option>
                                        <option value="워크샵">워크샵</option>
                                        <option value="네트워킹">네트워킹</option>
                                        <option value="기타">기타</option>
                                    </select>
                                    {errors.forumType && <p className="text-xs text-destructive">{errors.forumType}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="forumDate">일자 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="forumDate"
                                        name="forumDate"
                                        type="date"
                                        value={formData.forumDate}
                                        onChange={handleChange}
                                        className={errors.forumDate ? "border-destructive" : ""}
                                    />
                                    {errors.forumDate && <p className="text-xs text-destructive">{errors.forumDate}</p>}
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="forumPlace">장소 <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="forumPlace"
                                            name="forumPlace"
                                            placeholder="예: 온라인 또는 서울시 OO센터"
                                            value={formData.forumPlace}
                                            onChange={handleChange}
                                            className={cn("pl-9", errors.forumPlace ? "border-destructive" : "")}
                                        />
                                    </div>
                                    {errors.forumPlace && <p className="text-xs text-destructive">{errors.forumPlace}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">설명 <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="포럼에 대한 상세 설명을 입력하세요"
                                    className={cn("min-h-[120px] resize-y", errors.description ? "border-destructive" : "")}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="forumClubs">참여 동아리 (선택)</Label>
                                <Input
                                    id="forumClubs"
                                    name="forumClubs"
                                    placeholder="쉼표로 구분"
                                    value={formData.forumClubs}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notices">기타 안내사항</Label>
                                <Textarea
                                    id="notices"
                                    name="notices"
                                    placeholder="참가자들에게 전달할 안내사항"
                                    className="min-h-[80px]"
                                    value={formData.notices}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Host Info */}
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="h-4 w-4" /> 주최자 정보
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="hostName">이름 <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="hostName"
                                            name="hostName"
                                            value={formData.hostName}
                                            onChange={handleChange}
                                            className={errors.hostName ? "border-destructive" : ""}
                                        />
                                        {errors.hostName && <p className="text-xs text-destructive">{errors.hostName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hostPhone">연락처 <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="hostPhone"
                                            name="hostPhone"
                                            type="tel"
                                            placeholder="010-0000-0000"
                                            value={formData.hostPhone}
                                            onChange={handleChange}
                                            className={errors.hostPhone ? "border-destructive" : ""}
                                        />
                                        {errors.hostPhone && <p className="text-xs text-destructive">{errors.hostPhone}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4 justify-end">
                                <Button variant="outline" type="button" onClick={() => router.back()}>
                                    취소
                                </Button>
                                <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                                            등록 중...
                                        </>
                                    ) : (
                                        '포럼 등록하기'
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
