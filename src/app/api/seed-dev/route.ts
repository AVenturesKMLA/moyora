import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import bcrypt from 'bcryptjs';

// POST - Seed 10 developer test accounts
export async function POST() {
    try {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
        }

        // Ensure authentication and authorization
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const user = session.user as { role?: string };
        if (user.role !== 'superadmin') {
            return NextResponse.json({ success: false, message: '권한이 없습니다' }, { status: 403 });
        }

        await connectDB();

        const createdUsers = [];
        const existingUsers = [];
        const commonPasswordHash = await bcrypt.hash('dev1234!', 12);

        for (let i = 1; i <= 10; i++) {
            const email = `dev${i}@moyeora.kr`;
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                existingUsers.push(email);
                continue;
            }

            const newUser = await User.create({
                name: `개발자지원${i}`,
                email: email,
                password: commonPasswordHash,
                birthday: new Date('2000-01-01'),
                phone: `010-0000-${String(i).padStart(4, '0')}`,
                schoolName: '모여라 개발팀',
                schoolId: 'DEV-TEAM',
                role: 'user',
                agreedToTerms: true,
            });

            createdUsers.push(newUser.email);
        }

        return NextResponse.json({
            success: true,
            message: `개발자 테스트 계정 생성 완료. 생성됨: ${createdUsers.length}, 이미 존재함: ${existingUsers.length}`,
            data: {
                created: createdUsers,
                skipped: existingUsers
            }
        });

    } catch (error) {
        console.error('Seed dev accounts error:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        return NextResponse.json(
            { success: false, message: '계정 생성 중 오류가 발생했습니다', error: errorMessage },
            { status: 500 }
        );
    }
}
