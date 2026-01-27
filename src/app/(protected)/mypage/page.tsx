'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
    name: string;
    email: string;
    birthday: string;
    schoolName: string;
    role: string;
    createdAt: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function MyPage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Profile form
    const [profileForm, setProfileForm] = useState({
        name: '',
        schoolName: '',
        birthday: '',
    });
    const [profileErrors, setProfileErrors] = useState<FormErrors>({});
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.user);
                setProfileForm({
                    name: data.user.name || '',
                    schoolName: data.user.schoolName || '',
                    birthday: data.user.birthday ? new Date(data.user.birthday).toISOString().split('T')[0] : '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileErrors({});
        setProfileSuccess('');

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    const errors: FormErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => {
                        errors[err.field] = err.message;
                    });
                    setProfileErrors(errors);
                } else {
                    setProfileErrors({ general: data.message });
                }
            } else {
                setProfileSuccess('프로필이 업데이트되었습니다');
                setTimeout(() => setProfileSuccess(''), 3000);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setProfileErrors({ general: '프로필 업데이트 중 오류가 발생했습니다' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordSaving(true);
        setPasswordErrors({});
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordErrors({ confirmPassword: '새 비밀번호가 일치하지 않습니다' });
            setPasswordSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    const errors: FormErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => {
                        errors[err.field] = err.message;
                    });
                    setPasswordErrors(errors);
                } else {
                    setPasswordErrors({ general: data.message });
                }
            } else {
                setPasswordSuccess('비밀번호가 변경되었습니다');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setPasswordSuccess(''), 3000);
            }
        } catch (error) {
            console.error('Password change error:', error);
            setPasswordErrors({ general: '비밀번호 변경 중 오류가 발생했습니다' });
        } finally {
            setPasswordSaving(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin':
                return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-100">슈퍼관리자</span>;
            case 'admin':
                return <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">관리자</span>;
            default:
                return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">일반회원</span>;
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <NavBar />

            <main className="container max-w-2xl py-12">
                {/* Profile Header */}
                <div className="mb-12 flex flex-col items-center text-center">
                    <Avatar className="mb-6 h-28 w-28 border-4 border-background shadow-xl">
                        <AvatarFallback className="bg-primary text-4xl font-bold text-primary-foreground">
                            {profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>

                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">{profile?.name}</h1>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        {profile && getRoleBadge(profile.role)}
                        <span className="text-sm">{profile?.email}</span>
                    </div>
                </div>

                {/* Settings Tabs */}
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="profile">프로필</TabsTrigger>
                        <TabsTrigger value="password">보안</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>기본 정보</CardTitle>
                                <CardDescription>
                                    성함과 소속 학교 정보를 최신으로 유지하세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {profileSuccess && (
                                    <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                        {profileSuccess}
                                    </div>
                                )}
                                {profileErrors.general && (
                                    <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive dark:text-red-400">
                                        {profileErrors.general}
                                    </div>
                                )}

                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">이름</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className={profileErrors.name ? 'border-destructive' : ''}
                                        />
                                        {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="school">소속 학교</Label>
                                        <Input
                                            id="school"
                                            type="text"
                                            value={profileForm.schoolName}
                                            onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                                            className={profileErrors.schoolName ? 'border-destructive' : ''}
                                        />
                                        {profileErrors.schoolName && <p className="text-xs text-destructive">{profileErrors.schoolName}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="birthday">생년월일</Label>
                                        <Input
                                            id="birthday"
                                            type="date"
                                            value={profileForm.birthday}
                                            onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={profileSaving}>
                                        {profileSaving ? '저장 중...' : '저장하기'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="password">
                        <Card>
                            <CardHeader>
                                <CardTitle>비밀번호 변경</CardTitle>
                                <CardDescription>
                                    계정 보안을 위해 주기적으로 비밀번호를 변경하는 것이 좋습니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {passwordSuccess && (
                                    <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                        {passwordSuccess}
                                    </div>
                                )}
                                {passwordErrors.general && (
                                    <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive dark:text-red-400">
                                        {passwordErrors.general}
                                    </div>
                                )}

                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">현재 비밀번호</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className={passwordErrors.currentPassword ? 'border-destructive' : ''}
                                        />
                                        {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">새 비밀번호</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            placeholder="8자 이상, 영문/숫자 조합"
                                            className={passwordErrors.newPassword ? 'border-destructive' : ''}
                                        />
                                        {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">비밀번호 확인</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
                                        />
                                        {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={passwordSaving}>
                                        {passwordSaving ? '변경 중...' : '변경 완료'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
