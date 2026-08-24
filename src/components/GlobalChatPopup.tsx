'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Globe, Minus, Send, Smile, Loader2 } from 'lucide-react';

interface ChatMessage {
    _id: string;
    userId: string;
    userName: string;
    schoolName: string;
    content: string;
    createdAt: string;
}

// 닉네임 색상 팔레트 — 같은 사용자는 항상 같은 색으로 보이도록 userId 해시로 고른다
const NAME_COLORS = [
    '#4d9fff',
    '#5ac8fa',
    '#7c9cff',
    '#9b8cff',
    '#4dd0e1',
    '#6ea8ff',
    '#8ab4f8',
    '#a78bfa',
];

function nameColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    }
    return NAME_COLORS[hash % NAME_COLORS.length];
}

const EMOJIS = ['😊', '😂', 'ㅋㅋ', '👍', '🔥', '🎉', '😭', '😮', '❤️', '🙏', '👏', '💯'];

export default function GlobalChatPopup() {
    const { status } = useSession();
    const pathname = usePathname();
    // /chat 은 같은 채팅의 전체 화면 버전이라 팝업을 겹쳐 띄우지 않는다
    const hidden = pathname === '/chat';

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const [input, setInput] = useState('');
    const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');
    const [sending, setSending] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/chat/global');
            if (!res.ok) {
                setLoadState('error');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
                setCurrentUserId(data.currentUserId);
                setLoadState('ok');
            } else {
                setLoadState('error');
            }
        } catch {
            setLoadState('error');
        }
    }, []);

    // 열려 있을 때만 폴링해서 불필요한 요청을 줄인다
    useEffect(() => {
        if (status !== 'authenticated' || !open || hidden) return;
        load();
        const timer = setInterval(load, 3000);
        return () => clearInterval(timer);
    }, [status, open, hidden, load]);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        setShowEmojis(false);
        try {
            const res = await fetch('/api/chat/global', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text }),
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

    const addEmoji = (emoji: string) => {
        setInput((prev) => (prev + emoji).slice(0, 2000));
        setShowEmojis(false);
        inputRef.current?.focus();
    };

    if (status !== 'authenticated' || hidden) return null;

    // 닫힌 상태: 좌측 상단에 작은 런처 버튼만 남긴다
    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed left-4 top-20 z-50 flex items-center gap-2 rounded-lg border border-white/10 bg-[#23262e] px-3 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-[#2c303a]"
                aria-label="전체 채팅 열기"
            >
                <Globe className="h-4 w-4 text-[#4d9fff]" />
                전체 채팅
            </button>
        );
    }

    return (
        <div className="fixed left-4 top-20 z-50 flex h-[560px] max-h-[calc(100vh-6rem)] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1b1e26] shadow-2xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#23262e] px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Globe className="h-4 w-4 text-[#4d9fff]" />
                    전체 채팅
                </div>
                <button
                    onClick={() => setOpen(false)}
                    className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="전체 채팅 닫기"
                >
                    <Minus className="h-4 w-4" />
                </button>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
                {loadState === 'loading' ? (
                    <div className="flex h-full items-center justify-center text-white/40">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                ) : loadState === 'error' ? (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/40">
                        채팅을 불러오지 못했습니다
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/40">
                        아직 메시지가 없습니다. 첫 메시지를 남겨보세요!
                    </div>
                ) : (
                    messages.map((m) => (
                        <div
                            key={m._id}
                            className={`flex items-start gap-1.5 rounded px-2 py-1.5 text-sm leading-relaxed transition-colors hover:bg-white/[0.04] ${
                                m.userId === currentUserId ? 'bg-white/[0.03]' : ''
                            }`}
                        >
                            <span
                                className="mt-0.5 shrink-0 text-xs"
                                title={m.schoolName || undefined}
                                aria-hidden="true"
                            >
                                🎓
                            </span>
                            <span className="min-w-0 break-words text-[#e8e8e8]">
                                <span
                                    className="font-bold"
                                    style={{ color: nameColor(m.userId) }}
                                    title={m.schoolName || undefined}
                                >
                                    {m.userName}
                                </span>
                                <span className="text-white/40"> : </span>
                                {m.content}
                            </span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* 입력창 */}
            <div className="relative border-t border-white/10 p-2">
                {showEmojis && (
                    <div className="absolute bottom-full right-2 mb-1 grid grid-cols-6 gap-1 rounded-lg border border-white/10 bg-[#23262e] p-2 shadow-xl">
                        {EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => addEmoji(emoji)}
                                className="rounded px-1.5 py-1 text-base transition-colors hover:bg-white/10"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-1.5">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        maxLength={2000}
                        autoComplete="off"
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#2a2d36] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#4d9fff] focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowEmojis((v) => !v)}
                        className="shrink-0 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="이모지"
                    >
                        <Smile className="h-5 w-5" />
                    </button>
                    <button
                        type="submit"
                        disabled={sending || !input.trim()}
                        className="shrink-0 rounded-lg bg-[#4d9fff] p-2 text-white transition-colors hover:bg-[#3d8fef] disabled:opacity-40"
                        aria-label="보내기"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
