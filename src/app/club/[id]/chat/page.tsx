'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, MessageSquare, Lock } from 'lucide-react';

interface ChatMessage {
    _id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function ClubChatPage() {
    const params = useParams();
    const router = useRouter();
    const { status } = useSession();
    const clubId = String(params?.id || '');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [clubName, setClubName] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [input, setInput] = useState('');
    const [loadState, setLoadState] = useState<'loading' | 'ok' | 'forbidden' | 'error'>('loading');
    const [sending, setSending] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/club/chat?clubId=${encodeURIComponent(clubId)}`);
            if (res.status === 401) {
                router.push(`/login?callbackUrl=${encodeURIComponent(`/club/${clubId}/chat`)}`);
                return;
            }
            if (res.status === 403) {
                setLoadState('forbidden');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
                setClubName(data.clubName);
                setCurrentUserId(data.currentUserId);
                setLoadState('ok');
            } else {
                setLoadState('error');
            }
        } catch {
            setLoadState('error');
        }
    }, [clubId, router]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/login?callbackUrl=${encodeURIComponent(`/club/${clubId}/chat`)}`);
            return;
        }
        if (status !== 'authenticated') return;
        load();
        const timer = setInterval(load, 3000); // 3초마다 새 메시지 확인
        return () => clearInterval(timer);
    }, [status, load, clubId, router]);

    // 새 메시지가 오면 맨 아래로 스크롤
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        try {
            const res = await fetch('/api/club/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clubId, content: text }),
            });
            const data = await res.json();
            if (data.success) {
                setInput('');
                setMessages((prev) => [...prev, data.message]);
            }
        } catch {
            // 조용히 무시 (다음 폴링에서 반영)
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavBar />

            <main className="flex-1 container max-w-3xl w-full px-4 py-6 flex flex-col">
                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="-ml-2">
                        <Link href={`/club/${clubId}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="flex items-center gap-2 text-lg font-bold truncate">
                            <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                            {clubName ? `${clubName} 채팅` : '동아리 채팅'}
                        </h1>
                        <p className="text-xs text-muted-foreground">동아리 멤버들과 대화하세요.</p>
                    </div>
                </div>

                {loadState === 'forbidden' ? (
                    <Card className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
                        <Lock className="h-10 w-10 text-muted-foreground" />
                        <p className="font-medium">이 동아리의 멤버만 채팅에 참여할 수 있습니다.</p>
                        <p className="text-sm text-muted-foreground">가입 신청 후 승인되면 채팅을 이용할 수 있어요.</p>
                        <Button asChild variant="outline" className="mt-2">
                            <Link href={`/club/${clubId}`}>동아리 보기</Link>
                        </Button>
                    </Card>
                ) : (
                    <Card className="flex flex-1 flex-col overflow-hidden">
                        {/* Messages */}
                        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[50vh]">
                            {loadState === 'loading' ? (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                                    <MessageSquare className="mb-2 h-8 w-8 opacity-30" />
                                    아직 메시지가 없습니다. 첫 메시지를 남겨보세요!
                                </div>
                            ) : (
                                messages.map((m) => {
                                    const mine = m.userId === currentUserId;
                                    return (
                                        <div key={m._id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                                            {!mine && (
                                                <Link
                                                    href={`/messages/${m.userId}`}
                                                    className="mb-0.5 px-1 text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
                                                    title="1:1 메시지 보내기"
                                                >
                                                    {m.userName}
                                                </Link>
                                            )}
                                            <div className={`flex items-end gap-1.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
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
                                        </div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-3">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="메시지를 입력하세요..."
                                maxLength={2000}
                                disabled={loadState !== 'ok'}
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={sending || !input.trim() || loadState !== 'ok'}>
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </Card>
                )}
            </main>
        </div>
    );
}
