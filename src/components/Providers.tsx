'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "@/components/ThemeProvider";

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
}
