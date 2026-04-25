'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

/**
 * MobileGuard Component
 * 
 * Guards its children to be only visible on mobile devices.
 * Shows a "Mobile Only" warning screen on desktop.
 */
export default function MobileGuard({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
            // Standard mobile regex check
            if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream) {
                return true;
            }
            // Additional check for mobile screen width as fallback/supplement
            if (window.innerWidth <= 768) {
                return true;
            }
            // Detect devtools mobile emulation (often userAgent checks work, but sometimes fails if not strict)
            return false;
        };

        setIsMobile(checkMobile());

        const handleResize = () => {
            setIsMobile(checkMobile());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent hydration mismatch by rendering nothing initially
    if (isMobile === null) {
        return <div className="min-h-screen bg-background" />;
    }

    if (!isMobile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse">
                    <Smartphone className="h-10 w-10" />
                </div>
                <h1 className="mb-3 text-2xl font-bold text-foreground">모바일 전용 서비스입니다</h1>
                <p className="mb-4 max-w-[320px] text-muted-foreground leading-relaxed">
                    본 회원가입 서비스는 모바일 환경(Android, iOS)에서만 이용하실 수 있습니다.
                </p>
                <p className="text-xs text-muted-foreground/60">스마트폰으로 접속해주세요.</p>
            </div>
        );
    }

    return <>{children}</>;
}
