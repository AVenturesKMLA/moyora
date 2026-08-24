import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import GlobalChatPopup from '@/components/GlobalChatPopup';
import FreePeriodNotice from '@/components/FreePeriodNotice';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <>
            {children}
            <FreePeriodNotice />
            <GlobalChatPopup />
        </>
    );
}
