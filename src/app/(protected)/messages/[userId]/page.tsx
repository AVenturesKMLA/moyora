'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, MessageSquare } from 'lucide-react';

interface DMMessage {
    _id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function DirectMessagePage() {
    const params = useParams();
    const router = useRouter();
    const { status } = useSession();
    const otherId = String(params?.userId || '');

    const [messages, setMessages] = useState<DMMessage[]>([]);
    const [otherName, setOtherName] = useState('');
    const [otherSchool, setOtherSchool] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [input, setInput] = useState('');
    const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');
    const [sending, setSending] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/dm/messages?userId=${encodeURIComponent(otherId)}`);
            if (res.status === 401) {
                router.push(`/login?callbackUrl=${encodeURIComponent(`/messages/${otherId}`)}`);
                return;
            }
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
                setOtherName(data.otherUser.name);
                setOtherSchool(data.otherUser.schoolName);
                setCurrentUserId(data.currentUserId);
                setLoadState('ok');
            } else {
                setLoadState('error');
            }
        } catch {
            setLoadState('error');
        }
    }, [otherId, router]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/login?callbackUrl=${encodeURIComponent(`/messages/${otherId}`)}`);
            return;
        }
        if (status !== 'authenticated') return;
        load();
        const timer = setInterval(load, 3000);
        return () => clearInterval(timer);
    }, [status, load, otherId, router]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        try {
            const res = await fetch('/api/dm/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: otherId, content: text }),
            });
            const data = await res.json();
            if (data.success) {
                setInput('');
                setMessages((prev) => [...prev, data.message]);
            }
        } catch {
            // 다음 폴링에서 반영
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar />
            <main className="flex-1 container max-w-3xl w-full px-4 py-6 flex flex-col">
                <div className="mb-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="-ml-2">
                        <Link href="/messages">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold truncate">{otherName || '대화'}</h1>
                        {otherSchool ? <p className="text-xs text-muted-foreground truncate">{otherSchool}</p> : null}
                    </div>
                </div>

                <Card className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[55vh]">
                        {loadState === 'loading' ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                                <MessageSquare className="mb-2 h-8 w-8 opacity-30" />
                                아직 대화가 없습니다. 먼저 인사를 건네보세요!
                            </div>
                        ) : (
                            messages.map((m) => {
                                const mine = m.senderId === currentUserId;
                                return (
                                    <div key={m._id} className={`flex items-end gap-1.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div
                                            className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                                                mine
                                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                    : 'bg-muted text-foreground rounded-bl-sm'
                                            }`}
                                        >
                                            {m.content}
                                        </div>
                                        <span className="pb-0.5 text-[10px] text-muted-foreground">{formatTime(m.createdAt)}</span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            maxLength={2000}
                            disabled={loadState === 'loading'}
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={sending || !input.trim() || loadState === 'loading'}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </Card>
            </main>
        </div>
    );
}
