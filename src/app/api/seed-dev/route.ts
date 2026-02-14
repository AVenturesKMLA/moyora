import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import bcrypt from 'bcryptjs';

export async function GET(_request: NextRequest) {
    try {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { role?: string };
        if (user.role !== 'superadmin') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        await connectDB();

        const createdUsers: string[] = [];
        const password = await bcrypt.hash('DevTeam123!', 12);

        for (let i = 1; i <= 10; i++) {
            const email = `dev${i}@moyora.kr`;
            const phone = `010-0000-${i.toString().padStart(4, '0')}`;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                createdUsers.push(`${email} (Already exists)`);
                continue;
            }

            try {
                const newUser = await User.create({
                    name: `개발자${i}`,
                    email,
                    password,
                    birthday: new Date('2000-01-01'),
                    phone,
                    schoolName: '모여라 개발팀',
                    schoolId: 'DEV-TEAM',
                    role: 'user',
                    agreedToTerms: true,
                });
                createdUsers.push(newUser.email);
            } catch (err) {
                console.error(`Failed to create user ${email}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Developer test accounts check/creation completed',
            createdUsers,
        });
    } catch (error) {
        console.error('Seed dev users error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to seed dev users', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
