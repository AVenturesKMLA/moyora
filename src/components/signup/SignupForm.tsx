'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupSchema, INTEREST_OPTIONS } from '@/lib/validations';
import { ZodError } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SchoolNameInput from '@/components/ui/SchoolNameInput';

interface FormState {
    schoolName: string;
    schoolId: string;
    grade: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    interests: string[];
    agreedToTerms: boolean;
}

const INITIAL_STATE: FormState = {
    schoolName: '',
    schoolId: '',
    grade: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    interests: [],
    agreedToTerms: false,
};

interface SignupFormProps {
    step: number;
    onStepChange: (step: number) => void;
}

export default function SignupForm({ step, onStepChange }: SignupFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const clearError = (field: string) => {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const handleSchoolChange = (value: string) => {
        setFormData((prev) => ({ ...prev, schoolName: value, schoolId: value }));
        clearError('schoolName');
    };

    const handleGradeChange = (value: string) => {
        setFormData((prev) => ({ ...prev, grade: value }));
        clearError('grade');
    };

    const toggleInterest = (interest: string) => {
        setFormData((prev) => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest],
        }));
        clearError('interests');
    };

    const handleTermsChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, agreedToTerms: checked }));
        clearError('agreedToTerms');
    };

    // Validate only the fields belonging to step 1 before moving on
    const validateStepOne = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.schoolName || formData.schoolName.trim().length < 2) {
            newErrors.schoolName = '학교명을 입력해주세요';
        }
        if (![1, 2, 3].includes(Number(formData.grade))) {
            newErrors.grade = '학년을 선택해주세요';
        }
        if (!formData.name || formData.name.trim().length < 2) {
            newErrors.name = '이름은 2자 이상 입력해주세요';
        }
        if (!/^01[0-9][-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/.test(formData.phone)) {
            newErrors.phone = '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식을 입력해주세요';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate password fields before moving to interests
    const validateStepTwo = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (formData.password.length < 8) {
            newErrors.password = '비밀번호는 8자 이상이어야 합니다';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        setServerError('');
        if (step === 1 && validateStepOne()) {
            onStepChange(2);
        } else if (step === 2 && validateStepTwo()) {
            onStepChange(3);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError('');
        setErrors({});

        try {
            const validatedData = signupSchema.parse({
                ...formData,
                grade: Number(formData.grade),
            });

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validatedData),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const newErrors: { [key: string]: string } = {};
                    result.errors.forEach((err: { field: string; message: string }) => {
                        newErrors[err.field] = err.message;
                    });
                    setErrors(newErrors);
                    // Send the user back to the earliest step that has an error
                    if (['schoolName', 'schoolId', 'grade', 'name', 'phone', 'email'].some((f) => newErrors[f])) {
                        onStepChange(1);
                    } else if (['password', 'confirmPassword'].some((f) => newErrors[f])) {
                        onStepChange(2);
                    }
                } else {
                    setServerError(result.message || '회원가입 중 오류가 발생했습니다.');
                }
                return;
            }

            router.push('/login?registered=true');
        } catch (error) {
            if (error instanceof ZodError) {
                const newErrors: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
                if (['schoolName', 'schoolId', 'grade', 'name', 'phone', 'email'].some((f) => newErrors[f])) {
                    onStepChange(1);
                } else if (['password', 'confirmPassword'].some((f) => newErrors[f])) {
                    onStepChange(2);
                }
            } else {
                setServerError('시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const headings: Record<number, { title: string; desc: string }> = {
        1: { title: '기본 정보 입력', desc: '학교와 학년, 연락처 정보를 입력해주세요' },
        2: { title: '비밀번호 생성', desc: '로그인에 사용할 비밀번호를 만들어주세요' },
        3: { title: '관심분야 선택', desc: '관심 있는 분야를 모두 골라주세요 (1개 이상)' },
    };

    return (
        <div className="space-y-6 pb-10 pt-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{headings[step]?.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{headings[step]?.desc}</p>
            </div>

            <Card className="border-border/40 shadow-sm">
                <CardContent className="space-y-4 pt-6">
                    {serverError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="schoolName">학교명</Label>
                                <SchoolNameInput
                                    id="schoolName"
                                    name="schoolName"
                                    value={formData.schoolName}
                                    onChange={handleSchoolChange}
                                    hasError={!!errors.schoolName}
                                />
                                {errors.schoolName && <p className="text-xs text-destructive">{errors.schoolName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">학년</Label>
                                <Select value={formData.grade} onValueChange={handleGradeChange}>
                                    <SelectTrigger
                                        id="grade"
                                        className={errors.grade ? 'border-destructive focus:ring-destructive' : ''}
                                    >
                                        <SelectValue placeholder="학년을 선택해주세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1학년</SelectItem>
                                        <SelectItem value="2">2학년</SelectItem>
                                        <SelectItem value="3">3학년</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="이름을 입력해주세요"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">전화번호</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="010-1234-5678"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <Button type="button" className="w-full" size="lg" onClick={handleNext}>
                                다음
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="8자 이상, 대소문자 및 숫자 포함"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="비밀번호 다시 입력"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                            </div>

                            <Button type="button" className="w-full" size="lg" onClick={handleNext}>
                                다음
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>관심분야</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {INTEREST_OPTIONS.map((interest) => {
                                        const selected = formData.interests.includes(interest);
                                        return (
                                            <button
                                                type="button"
                                                key={interest}
                                                onClick={() => toggleInterest(interest)}
                                                aria-pressed={selected}
                                                className={cn(
                                                    'relative flex items-center justify-center rounded-lg border px-2 py-3 text-sm font-medium transition-colors',
                                                    selected
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border bg-background text-foreground hover:bg-accent'
                                                )}
                                            >
                                                {selected && <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5" />}
                                                {interest}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.interests && <p className="text-xs text-destructive">{errors.interests}</p>}
                            </div>

                            <div className="pt-2">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={formData.agreedToTerms}
                                        onCheckedChange={(checked) => handleTermsChange(checked === true)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="terms"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            이용약관 및 개인정보 처리방침에 동의합니다 (필수)
                                        </Label>
                                    </div>
                                </div>
                                {errors.agreedToTerms && <p className="mt-2 text-xs text-destructive">{errors.agreedToTerms}</p>}
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? '가입 중...' : '회원가입 완료하기'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
