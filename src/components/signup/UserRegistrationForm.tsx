'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupSchema, SignupInput } from '@/lib/validations';
import { ZodError } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface IdentityData {
    name?: string;
    birthday?: string;
    phone?: string;
}

interface StudentIdData {
    schoolName?: string;
}

interface UserRegistrationFormProps {
    identityData: IdentityData;
    studentIdData: StudentIdData;
}

export default function UserRegistrationForm({ identityData, studentIdData }: UserRegistrationFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<SignupInput>>({
        name: identityData?.name || '',
        email: '',
        password: '',
        confirmPassword: '',
        birthday: identityData?.birthday || '',
        phone: identityData?.phone || '',
        schoolName: studentIdData?.schoolName || '',
        schoolId: studentIdData?.schoolName || 'UNKNOWN_SCHOOL', // Fallback to schoolName
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            agreedToTerms: checked,
        }));
        if (errors.agreedToTerms) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.agreedToTerms;
                return newErrors;
            });
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError('');
        setErrors({});

        try {
            // Validation
            const validatedData = signupSchema.parse(formData);

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
            } else {
                setServerError('시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 pt-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">마지막 단계</h2>
                <p className="mt-2 text-sm text-muted-foreground">로그인에 사용할 정보를 입력해주세요</p>
                <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30">
                    <span className="truncate">학교: {formData.schoolName}</span>
                </div>
            </div>

            <Card className="border-border/40 shadow-sm">
                <CardContent className="space-y-4 pt-6">
                    {serverError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthday">생년월일</Label>
                                <Input
                                    id="birthday"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    className="bg-background"
                                />
                            </div>
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
                                required
                                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="8자 이상, 대소문자 및 숫자 포함"
                                value={formData.password}
                                onChange={handleChange}
                                required
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
                                required
                                className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                        </div>

                        <div className="pt-2">
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={formData.agreedToTerms}
                                    onCheckedChange={handleCheckboxChange}
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
                </CardContent>
            </Card>
        </div>
    );
}
