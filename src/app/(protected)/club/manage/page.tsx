'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from '../../../../lib/useSession';
import NavBar from '@/components/NavBar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Club {
    _id: string;
    clubName: string;
    description: string;
    schoolName?: string;
    clubTheme?: string;
    presidentName?: string;
    role?: 'chief' | 'member';
    pendingCount?: number;
}

interface Application {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        schoolName: string;
        phone: string;
    };
    clubId: string;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function ClubManagePage() {
    const { data: session } = useSession();
    const [myClubs, setMyClubs] = useState<Club[]>([]);
    const [memberClubs, setMemberClubs] = useState<Club[]>([]);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingClubs, setLoadingClubs] = useState(true);
    const [loadingApps, setLoadingApps] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);

    // Fetch user's managed clubs
    useEffect(() => {
        if (!session?.user?.email) return;

        const fetchClubs = async () => {
            try {
                const res = await fetch('/api/club/my');
                const data = await res.json();
                if (data.success) {
                    const owned: Club[] = data.owned || [];
                    setMyClubs(owned);
                    setMemberClubs(data.memberOf || []);
                    if (owned.length > 0) {
                        setSelectedClub(owned[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch clubs:', error);
            } finally {
                setLoadingClubs(false);
            }
        };

        fetchClubs();
    }, [session]);

    // Fetch applications when selected club changes
    useEffect(() => {
        if (!selectedClub) return;

        const fetchApplications = async () => {
            setLoadingApps(true);
            try {
                const res = await fetch(`/api/club/apply?clubId=${selectedClub._id}`);
                const data = await res.json();
                if (data.success) {
                    setApplications(data.applications);
                }
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            } finally {
                setLoadingApps(false);
            }
        };

        fetchApplications();
    }, [selectedClub]);

    const handleUpdateStatus = async (appId: string, status: 'approved' | 'rejected') => {
        setUpdating(appId);
        try {
            const res = await fetch(`/api/club/application/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                setApplications((prev: Application[]) =>
                    prev.map(app => (app._id === appId ? { ...app, status } : app))
                );
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        } finally {
            setUpdating(null);
        }
    };

    if (loadingClubs) return (<div className="p-8 text-center">Loading...</div>) as JSX.Element;

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <div className="container py-8 animate-fade-in relative z-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">My Club</h1>
                    <p className="text-muted-foreground text-sm">
                        내가 운영 중인 동아리의 가입 신청을 관리하세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Club List Sidebar */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">내 동아리</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px]">
                                    <div className="p-4 space-y-2">
                                        {myClubs.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">운영 중인 동아리가 없습니다.</p>
                                        ) : (
                                            myClubs.map((club: Club) => (
                                                <button
                                                    key={club._id}
                                                    onClick={() => setSelectedClub(club)}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedClub?._id === club._id
                                                            ? 'bg-primary/5 border-primary shadow-sm'
                                                            : 'bg-card hover:bg-muted'
                                                        }`}
                                                >
                                                    <div className="font-semibold">{club.clubName}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{club.description}</div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Applications Area */}
                    <div className="md:col-span-8 lg:col-span-9">
                        <Card className="h-full">
                            {selectedClub ? (
                                <>
                                    <CardHeader className="border-b bg-muted/20">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle>{selectedClub.clubName}</CardTitle>
                                                <CardDescription>가입 신청 관리 ({applications.length})</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                    <span
                                                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-yellow-500/10 text-yellow-600 border-yellow-200"
                                                    >
                                                        대기 {applications.filter((a: Application) => a.status === 'pending').length}
                                                    </span>
                                                    <Button variant="outline" size="sm" className="h-7 px-3 text-xs" asChild>
                                                        <a href={`/club/${selectedClub._id}/chat`}>채팅</a>
                                                    </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <div className="p-0">
                                        {loadingApps ? (
                                            <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
                                        ) : applications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                <div className="w-10 h-10 mb-2 opacity-20 rounded-full border" aria-hidden="true" />
                                                <p>가입 신청 내역이 없습니다.</p>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>신청자</TableHead>
                                                        <TableHead className="hidden md:table-cell">메시지</TableHead>
                                                        <TableHead>신청일</TableHead>
                                                        <TableHead>상태</TableHead>
                                                        <TableHead className="text-right">관리</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                            {applications.map((app: Application) => (
                                                        <TableRow key={app._id}>
                                                            <TableCell>
                                                                <div className="font-medium">{app.userId.name}</div>
                                                                <div className="text-xs text-muted-foreground">{app.userId.schoolName}</div>
                                                                <div className="text-xs text-muted-foreground">{app.userId.email}</div>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell max-w-[250px]">
                                                                <p className="text-sm text-foreground/80 line-clamp-2" title={app.message}>
                                                                    {app.message || '-'}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {new Date(app.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span
                                                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                                                        app.status === 'approved'
                                                                            ? 'text-green-600 bg-green-50 border-green-200'
                                                                            : app.status === 'rejected'
                                                                                ? 'text-red-600 bg-red-50 border-red-200'
                                                                                : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                                                                    }`}
                                                                >
                                                                    {app.status === 'approved'
                                                                        ? '승인됨'
                                                                        : app.status === 'rejected'
                                                                            ? '거절됨'
                                                                            : '대기중'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {app.status === 'pending' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                            onClick={() => handleUpdateStatus(app._id, 'approved')}
                                                                            disabled={updating === app._id}
                                                                        >
                                                                            {updating === app._id ? (
                                                                                <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                                                            ) : (
                                                                                <span className="inline-block h-4 w-4 rounded-sm border border-current" aria-hidden="true" />
                                                                            )}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                                            disabled={updating === app._id}
                                                                        >
                                                                            {updating === app._id ? (
                                                                                <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                                                            ) : (
                                                                                <span className="inline-block h-4 w-4 rounded-sm border border-current" aria-hidden="true" />
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    왼쪽에서 동아리를 선택해주세요.
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* 소속 동아리 (멤버로 활동 중) */}
                <div className="mt-10">
                    <h2 className="text-xl font-bold tracking-tight">소속 동아리</h2>
                    <p className="text-muted-foreground text-sm mb-4">내가 멤버로 활동 중인 동아리입니다.</p>
                    {memberClubs.length === 0 ? (
                        <div className="rounded-xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                            아직 가입한 동아리가 없습니다.{' '}
                            <a href="/club/search" className="text-primary underline-offset-4 hover:underline">동아리 찾아보기</a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {memberClubs.map((club) => (
                                <Card key={club._id} className="transition-shadow hover:shadow-md">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle className="text-lg truncate">{club.clubName}</CardTitle>
                                            <span className="shrink-0 inline-flex items-center rounded-full border border-blue-200 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">멤버</span>
                                        </div>
                                        <CardDescription className="truncate">
                                            {club.schoolName}{club.clubTheme ? ` · ${club.clubTheme}` : ''}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {club.description || '소개가 없습니다.'}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>동아리장 {club.presidentName || '—'}</span>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                                                    <a href={`/club/${club._id}/chat`}>채팅</a>
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                                                    <a href={`/club/${club._id}`}>상세 보기</a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
