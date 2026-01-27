import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Providers from '@/components/Providers';
import { NotificationProvider } from '@/context/NotificationContext';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: '모여라 - 고등학교 동아리 이벤트 플랫폼',
    description: '전국 고등학교 동아리가 모여 대회, 포럼, 공동연구를 함께하는 플랫폼',
    keywords: ['동아리', '고등학교', '대회', '포럼', '공동연구', '모여라'],
};

import StyledJsxRegistry from '@/lib/registry';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body className={notoSansKr.className}>
                <StyledJsxRegistry>
                    <Providers>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </Providers>
                </StyledJsxRegistry>
                <Analytics />
            </body>
        </html>
    );
}
