import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { authOptions } from '@/lib/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/login');
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== 'superadmin') {
        redirect('/dashboard');
    }

    return <>{children}</>;
}
