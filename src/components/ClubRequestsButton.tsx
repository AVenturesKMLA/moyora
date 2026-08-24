'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserPlus } from 'lucide-react';

interface ClubRequest {
    applicationId: string;
    clubId: string;
    clubName: string;
    applicantName: string;
    applicantSchool: string;
    applicantGrade: number | null;
    message: string;
    createdAt: string;
}

// 회장이 받은 대기중 가입 요청을 주기적으로 확인해 뱃지로 알림
export default function ClubRequestsButton() {
    const [requests, setRequests] = useState<ClubRequest[]>([]);
    const [count, setCount] = useState(0);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/club/requests');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests);
                setCount(data.count);
            }
        } catch {
            // 조용히 무시 (네트워크 일시 오류 등)
        }
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, 30000); // 30초마다 갱신
        return () => clearInterval(timer);
    }, [load]);

    // 소유한 동아리가 없거나 요청이 없으면 버튼 자체를 숨김
    if (count === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <UserPlus className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
                        {count > 9 ? '9+' : count}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>동아리 가입 요청</span>
                    <span className="text-xs font-normal text-muted-foreground">{count}건 대기중</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-72 overflow-y-auto">
                    {requests.slice(0, 6).map((r) => (
                        <div key={r.applicationId} className="px-3 py-2.5 text-sm">
                            <div className="font-medium">
                                {r.applicantName}
                                {r.applicantGrade ? <span className="text-muted-foreground font-normal"> · {r.applicantGrade}학년</span> : null}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <span className="text-primary">{r.clubName}</span> 가입 신청
                            </div>
                            {r.message ? (
                                <p className="mt-1 line-clamp-2 text-xs text-foreground/70">“{r.message}”</p>
                            ) : null}
                        </div>
                    ))}
                    {count > 6 ? (
                        <p className="px-3 py-2 text-center text-xs text-muted-foreground">외 {count - 6}건 더</p>
                    ) : null}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                    <Button asChild className="w-full" size="sm">
                        <Link href="/club/manage">신청 관리하기</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
