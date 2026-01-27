'use client';

import { useEffect, useState } from 'react';

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
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
    }

    if (!isMobile) {
        return (
            <div className="mobile-only-warning">
                <style jsx>{`
                    .mobile-only-warning {
                        min-h-screen;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #D6DADF;
                        padding: 24px;
                        text-align: center;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }
                    .icon-container {
                        width: 80px;
                        height: 80px;
                        background: #1F4EF5;
                        border-radius: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        margin-bottom: 24px;
                        box-shadow: 0 10px 20px rgba(31, 78, 245, 0.3);
                        animation: pulse 2s infinite;
                    }
                    h1 {
                        font-size: 1.5rem;
                        font-weight: 800;
                        color: #1A1E27;
                        margin-bottom: 12px;
                    }
                    p {
                        color: #B1B8C0;
                        font-size: 1rem;
                        line-height: 1.5;
                        max-width: 320px;
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(31, 78, 245, 0.4); }
                        70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(31, 78, 245, 0); }
                        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(31, 78, 245, 0); }
                    }
                `}</style>
                <div className="icon-container">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                </div>
                <h1>모바일 전용 서비스입니다</h1>
                <p>본 회원가입 서비스는 모바일 환경(Android, iOS)에서만 이용하실 수 있습니다.</p>
                <p className="mt-4 text-xs">스마트폰으로 접속해주세요.</p>
            </div>
        );
    }

    return <>{children}</>;
}
