'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, MessageSquare, Search, ChevronRight } from 'lucide-react';

interface Conversation {
    otherUserId: string;
    otherUserName: string;
    otherUserSchool: string;
    lastContent: string;
    lastAt: string;
    lastFromMe: boolean;
    unread: number;
}

interface FoundUser {
    id: string;
    name: string;
    schoolName: string;
    grade: number | null;
}

function formatWhen(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
        ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

export default function MessagesInboxPage() {
    const router = useRouter();
    const { status } = useSession();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoundUser[]>([]);
    const [searching, setSearching] = useState(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/dm/conversations');
            if (res.status === 401) {
                router.push('/login?callbackUrl=/messages');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
                setLoadState('ok');
            } else {
                setLoadState('error');
            }
        } catch {
            setLoadState('error');
        }
    }, [router]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/messages');
            return;
        }
        if (status !== 'authenticated') return;
        load();
        const timer = setInterval(load, 5000);
        return () => clearInterval(timer);
    }, [status, load, router]);

    // 상대 검색 (디바운스)
    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        const q = query.trim();
        if (!q) {
            setResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        searchTimer.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                if (data.success) setResults(data.users);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, [query]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar />
            <main className="flex-1 container max-w-2xl w-full px-4 py-6">
                <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    메시지
                </h1>
                <p className="mb-5 text-sm text-muted-foreground">누구에게나 1:1 메시지를 보낼 수 있습니다.</p>

                {/* 상대 검색 */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="이름으로 사람 찾기..."
                        className="pl-9"
                        autoComplete="off"
                    />
                    {query.trim() ? (
                        <Card className="absolute z-20 mt-1 w-full overflow-hidden">
                            {searching ? (
                                <div className="flex items-center justify-center py-4 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : results.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
                            ) : (
                                results.map((u) => (
                                    <Link
                                        key={u.id}
                                        href={`/messages/${u.id}`}
                                        className="flex items-center justify-between px-4 py-3 text-sm hover:bg-accent"
                                    >
                                        <div>
                                            <span className="font-medium">{u.name}</span>
                                            {u.grade ? <span className="text-muted-foreground"> · {u.grade}학년</span> : null}
                                            <div className="text-xs text-muted-foreground">{u.schoolName}</div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                ))
                            )}
                        </Card>
                    ) : null}
                </div>

                {/* 대화 목록 */}
                {loadState === 'loading' ? (
                    <div className="flex justify-center py-16 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="rounded-xl border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
                        아직 대화가 없습니다. 위에서 사람을 찾아 대화를 시작해보세요.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((c) => (
                            <Link
                                key={c.otherUserId}
                                href={`/messages/${c.otherUserId}`}
                                className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    {c.otherUserName.substring(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate font-semibold">{c.otherUserName}</span>
                                        <span className="shrink-0 text-xs text-muted-foreground">{formatWhen(c.lastAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm text-muted-foreground">
                                            {c.lastFromMe ? '나: ' : ''}{c.lastContent}
                                        </p>
                                        {c.unread > 0 ? (
                                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
                                                {c.unread > 99 ? '99+' : c.unread}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
