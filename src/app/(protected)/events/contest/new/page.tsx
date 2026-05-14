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
import { AlertCircle, Calendar, MapPin, User, Phone, FileText, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormErrors {
    [key: string]: string;
}

export default function NewContestPage() {
    const router = useRouter();
    const { data: session } = useSession(); // Although not used for auth check in original, adding it is safer

    const [formData, setFormData] = useState({
        contestName: '',
        contestType: '',
        contestDate: '',
        contestPlace: '',
        description: '',
        enteringClubs: '',
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
        if (!formData.contestName.trim()) newErrors.contestName = '대회명을 입력해주세요';
        if (!formData.contestType) newErrors.contestType = '유형을 선택해주세요';
        if (!formData.contestDate) newErrors.contestDate = '일자를 선택해주세요';
        if (!formData.contestPlace.trim()) newErrors.contestPlace = '장소를 입력해주세요';
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
            const response = await fetch('/api/events/contest', {
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
            console.error('Contest registration error:', err);
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
                    <h1 className="text-3xl font-bold tracking-tight">대회 등록</h1>
                    <p className="text-muted-foreground">
                        대회 정보를 입력하고 전국의 동아리들에게 알리세요.
                    </p>
                </div>

                <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            대회 정보
                        </CardTitle>
                        <CardDescription>개최하려는 대회의 상세 정보를 입력해주세요.</CardDescription>
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
                                    <Label htmlFor="contestName">대회명 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="contestName"
                                        name="contestName"
                                        placeholder="예: 전국 고등학교 과학 토론 대회"
                                        value={formData.contestName}
                                        onChange={handleChange}
                                        className={errors.contestName ? "border-destructive" : ""}
                                    />
                                    {errors.contestName && <p className="text-xs text-destructive">{errors.contestName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contestType">유형 <span className="text-destructive">*</span></Label>
                                    <select
                                        id="contestType"
                                        name="contestType"
                                        className={cn(
                                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            errors.contestType ? "border-destructive" : ""
                                        )}
                                        value={formData.contestType}
                                        onChange={handleChange}
                                    >
                                        <option value="">유형 선택</option>
                                        <option value="토론">토론</option>
                                        <option value="발표">발표</option>
                                        <option value="실험">실험</option>
                                        <option value="프로젝트">프로젝트</option>
                                        <option value="기타">기타</option>
                                    </select>
                                    {errors.contestType && <p className="text-xs text-destructive">{errors.contestType}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contestDate">일자 <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="contestDate"
                                        name="contestDate"
                                        type="date"
                                        value={formData.contestDate}
                                        onChange={handleChange}
                                        className={errors.contestDate ? "border-destructive" : ""}
                                    />
                                    {errors.contestDate && <p className="text-xs text-destructive">{errors.contestDate}</p>}
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="contestPlace">장소 <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="contestPlace"
                                            name="contestPlace"
                                            placeholder="예: 서울시 강남구 OO센터"
                                            value={formData.contestPlace}
                                            onChange={handleChange}
                                            className={cn("pl-9", errors.contestPlace ? "border-destructive" : "")}
                                        />
                                    </div>
                                    {errors.contestPlace && <p className="text-xs text-destructive">{errors.contestPlace}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">설명 <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="대회에 대한 상세 설명을 입력하세요"
                                    className={cn("min-h-[120px] resize-y", errors.description ? "border-destructive" : "")}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="enteringClubs">참가 동아리 (선택)</Label>
                                <Input
                                    id="enteringClubs"
                                    name="enteringClubs"
                                    placeholder="쉼표로 구분 (예: 과학탐구반, 물리동아리)"
                                    value={formData.enteringClubs}
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
                                        '대회 등록하기'
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
