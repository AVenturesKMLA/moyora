'use client';

import { useEffect, useState } from 'react';
import { X, PartyPopper } from 'lucide-react';

// 무료 프로모션 종료 시점 — 이 날짜가 지나면 공지를 더 이상 띄우지 않는다
const FREE_UNTIL = new Date('2027-02-27T23:59:59+09:00');
const STORAGE_KEY = 'moyeora:free-period-notice-hidden-until';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function FreePeriodNotice() {
    // 서버/클라이언트 렌더 불일치를 피하려고 마운트 후에만 판단한다
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (Date.now() > FREE_UNTIL.getTime()) return;

        try {
            const hiddenUntil = window.localStorage.getItem(STORAGE_KEY);
            if (hiddenUntil && Date.now() < Number(hiddenUntil)) return;
        } catch {
            // localStorage를 못 쓰는 환경이면 그냥 표시
        }

        setVisible(true);
    }, []);

    const close = () => setVisible(false);

    const hideForAWeek = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(Date.now() + WEEK_MS));
        } catch {
            // 저장 실패해도 이번 세션에서는 닫는다
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#1b1e26] shadow-2xl">
                <button
                    onClick={close}
                    className="absolute right-3 top-3 rounded p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="닫기"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="px-8 py-10 text-center">
                    <PartyPopper className="mx-auto mb-5 h-12 w-12 text-[#4d9fff]" />

                    <p className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                        <span className="text-[#4d9fff]">2027년 2월 27일</span>까지는
                        <br />
                        동아리 개설이 <span className="text-[#4d9fff]">무료</span>로 진행됩니다
                    </p>

                    <p className="mt-4 text-sm text-white/50">
                        지금 동아리를 개설하고 모여라의 모든 기능을 사용해보세요.
                    </p>
                </div>

                <div className="flex border-t border-white/10">
                    <button
                        onClick={hideForAWeek}
                        className="flex-1 border-r border-white/10 py-4 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        일주일 간 보지 않기
                    </button>
                    <button
                        onClick={close}
                        className="flex-1 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
