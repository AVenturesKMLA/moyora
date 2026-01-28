'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Check, X, AlertCircle } from "lucide-react";

interface Club {
    _id: string;
    clubName: string;
    description: string;
    userId: string; // owner id
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
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function ClubManagePage() {
    const { data: session } = useSession();
    const [myClubs, setMyClubs] = useState<Club[]>([]);
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
                const res = await fetch('/api/clubs');
                const data = await res.json();
                if (data.success) {
                    // Filter clubs where current user is the owner (userId matches)
                    // Note: session.user.id might not be available directly in types depending on configuration,
                    // but usually we can match structure or relying on updated API that returns only my clubs if prompted.
                    // Effectively, the /api/clubs returns ALL clubs in school.
                    // We need to filter by `club.userId === session.user.id`.
                    // But session.user.id might be missing in client session type.
                    // A better way is to check `club.presidentEmail === session.user.email` as a fallback or similar.
                    const userEmail = session.user?.email;
                    const owned = data.clubs.filter((c: any) =>
                        c.presidentEmail === userEmail || c.userId === (session.user as any).id
                    );
                    setMyClubs(owned);
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
                setApplications(prev => prev.map(app =>
                    app._id === appId ? { ...app, status } : app
                ));
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        } finally {
            setUpdating(null);
        }
    };

    if (loadingClubs) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <div className="container py-8 animate-fade-in relative z-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">동아리 관리</h1>
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
                                            myClubs.map(club => (
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
                                            <div className="flex gap-2 text-sm">
                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                                    대기 {applications.filter(a => a.status === 'pending').length}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <div className="p-0">
                                        {loadingApps ? (
                                            <div className="p-8 text-center text-muted-foreground">불러오는 중...</div>
                                        ) : applications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
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
                                                    {applications.map((app) => (
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
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        app.status === 'approved' ? 'text-green-600 bg-green-50 border-green-200' :
                                                                            app.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-200' :
                                                                                'text-yellow-600 bg-yellow-50 border-yellow-200'
                                                                    }
                                                                >
                                                                    {app.status === 'approved' ? '승인됨' :
                                                                        app.status === 'rejected' ? '거절됨' : '대기중'}
                                                                </Badge>
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
                                                                            {updating === app._id ? <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <Check className="h-4 w-4" />}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                                            disabled={updating === app._id}
                                                                        >
                                                                            {updating === app._id ? <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <X className="h-4 w-4" />}
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
            </div>
        </div>
    );
}
