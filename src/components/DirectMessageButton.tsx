'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

// 안 읽은 1:1 메시지 개수를 주기적으로 확인해 뱃지로 표시
export default function DirectMessageButton() {
    const [count, setCount] = useState(0);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/dm/unread');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) setCount(data.count || 0);
        } catch {
            // 무시
        }
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, 20000);
        return () => clearInterval(timer);
    }, [load]);

    return (
        <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/messages" aria-label="메시지">
                <Mail className="h-5 w-5" />
                {count > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
                        {count > 9 ? '9+' : count}
                    </span>
                ) : null}
            </Link>
        </Button>
    );
}
