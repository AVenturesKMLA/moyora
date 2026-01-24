import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Providers from '@/components/Providers';
import { authOptions } from '@/lib/auth';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return <Providers>{children}</Providers>;
}
