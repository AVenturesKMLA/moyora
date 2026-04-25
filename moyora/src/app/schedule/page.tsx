'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin } from 'lucide-react';

interface ScheduleEvent {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
    isPublic: boolean;
}

function typeLabel(type: ScheduleEvent['eventType']) {
    if (type === 'contest') return '대회';
    if (type === 'forum') return '포럼';
    return '공동연구';
}

export default function SchedulePage() {
    const { status } = useSession();
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | ScheduleEvent['eventType']>('all');
    const [showMyPrivate, setShowMyPrivate] = useState(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams();
                qs.set('limit', '100');
                if (filterType !== 'all') qs.set('type', filterType);
                if (showMyPrivate && status === 'authenticated') qs.set('includePrivate', 'true');

                const res = await fetch(`/api/schedule?${qs.toString()}`);
                const data = await res.json();
                if (data.success) {
                    setEvents(data.events);
                }
            } catch (error) {
                console.error('Failed to load schedule:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [filterType, showMyPrivate, status]);

    const grouped = useMemo(() => {
        return events.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
            const key = new Date(event.eventDate).toLocaleDateString('ko-KR');
            if (!acc[key]) acc[key] = [];
            acc[key].push(event);
            return acc;
        }, {});
    }, [events]);

    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <main className="container mx-auto max-w-5xl px-4 pt-8 md:px-6 md:pt-12 space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">일정</h1>
                        <p className="text-sm text-muted-foreground">공개 일정과 내 비공개 일정을 한 번에 확인하세요.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="유형" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체</SelectItem>
                                <SelectItem value="contest">대회</SelectItem>
                                <SelectItem value="forum">포럼</SelectItem>
                                <SelectItem value="co-research">공동연구</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="my-private"
                                checked={showMyPrivate}
                                onCheckedChange={setShowMyPrivate}
                                disabled={status !== 'authenticated'}
                            />
                            <Label htmlFor="my-private" className="text-sm">내 비공개 일정 포함</Label>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">일정을 불러오는 중...</CardContent>
                    </Card>
                ) : Object.keys(grouped).length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">표시할 일정이 없습니다.</CardContent>
                    </Card>
                ) : (
                    Object.entries(grouped).map(([date, list]) => (
                        <Card key={date}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{date}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {list.map((event) => (
                                    <div key={event._id} className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Badge variant="secondary">{typeLabel(event.eventType)}</Badge>
                                            <Badge variant={event.isPublic ? 'outline' : 'default'}>
                                                {event.isPublic ? '공개' : '비공개'}
                                            </Badge>
                                        </div>
                                        <h3 className="font-semibold">{event.eventName}</h3>
                                        <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(event.eventDate).toLocaleString('ko-KR')}</span>
                                            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.eventPlace}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
}
