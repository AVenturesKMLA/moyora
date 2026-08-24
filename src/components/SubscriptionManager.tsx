'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, CreditCard } from 'lucide-react';
import { formatKRW } from '@/lib/billing';

interface Subscription {
    id: string;
    clubName: string | null;
    plan: string;
    amount: number;
    currency: string;
    status: 'active' | 'canceled' | 'past_due';
    nextBillingDate: string;
    lastChargedAt: string | null;
}

const STATUS_META: Record<Subscription['status'], { label: string; className: string }> = {
    active: { label: '이용 중', className: 'bg-primary text-primary-foreground' },
    canceled: { label: '해지됨', className: 'bg-muted text-muted-foreground' },
    past_due: { label: '결제 실패', className: 'bg-destructive text-destructive-foreground' },
};

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return iso;
    }
}

export default function SubscriptionManager() {
    const [subs, setSubs] = useState<Subscription[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [target, setTarget] = useState<Subscription | null>(null);
    const [canceling, setCanceling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            const res = await fetch('/api/subscriptions/club');
            const data = await res.json();
            if (data.success) setSubs(data.subscriptions);
            else setSubs([]);
        } catch {
            setSubs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCancel = async () => {
        if (!target) return;
        setCanceling(true);
        setError(null);
        try {
            const res = await fetch(`/api/subscriptions/club/${target.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || '해지에 실패했습니다.');
                return;
            }
            setTarget(null);
            await load();
        } catch {
            setError('서버 오류가 발생했습니다.');
        } finally {
            setCanceling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // 구독이 없으면 관리 섹션을 표시하지 않음
    if (!subs || subs.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto w-full space-y-4">
            <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">내 정기결제</h2>
            </div>

            <div className="grid gap-4">
                {subs.map((sub) => {
                    const meta = STATUS_META[sub.status];
                    return (
                        <Card key={sub.id} className="border-border/60">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-lg">
                                        {sub.clubName ? `${sub.clubName} 멤버십` : '동아리 멤버십'}
                                    </CardTitle>
                                    <Badge className={meta.className}>{meta.label}</Badge>
                                </div>
                                <CardDescription>
                                    월 {formatKRW(sub.amount)}원 · 동아리 당
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                {sub.status === 'active' && (
                                    <p>다음 청구 예정일: <span className="font-medium text-foreground">{formatDate(sub.nextBillingDate)}</span></p>
                                )}
                                {sub.status === 'past_due' && (
                                    <p className="text-destructive">결제에 실패했습니다. 카드 정보를 확인하고 동아리를 다시 개설해주세요.</p>
                                )}
                                {sub.lastChargedAt && (
                                    <p>최근 결제일: {formatDate(sub.lastChargedAt)}</p>
                                )}
                                {sub.status === 'active' && (
                                    <div className="pt-2">
                                        <Button variant="outline" size="sm" onClick={() => { setError(null); setTarget(sub); }}>
                                            정기결제 해지
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!target} onOpenChange={(o) => { if (!canceling && !o) setTarget(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>정기결제를 해지할까요?</DialogTitle>
                        <DialogDescription>
                            해지하면 다음 결제부터 청구되지 않습니다. 이미 결제된 이번 달 이용분은 환불되지 않습니다.
                        </DialogDescription>
                    </DialogHeader>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setTarget(null)} disabled={canceling}>
                            유지하기
                        </Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={canceling}>
                            {canceling ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 해지 중...</>
                            ) : (
                                '해지하기'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
