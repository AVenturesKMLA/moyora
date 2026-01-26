import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        const hashedPassword = await bcrypt.hash('password123', 10);

        const exampleUsers = [
            {
                name: '학생테스터',
                email: 'student@moyora.kr',
                password: hashedPassword,
                phone: '010-1111-1111',
                birthday: new Date('2008-01-01'),
                schoolName: '서울고등학교',
                schoolId: 'S0001',
                role: 'user',
                agreedToTerms: true,
            },
            {
                name: '동아리장테스터',
                email: 'leader@moyora.kr',
                password: hashedPassword,
                phone: '010-2222-2222',
                birthday: new Date('2007-01-01'),
                schoolName: '서울고등학교',
                schoolId: 'S0001',
                role: 'admin',
                agreedToTerms: true,
            },
            {
                name: '관리자',
                email: 'admin@moyora.kr',
                password: hashedPassword,
                phone: '010-3333-3333',
                birthday: new Date('1990-01-01'),
                schoolName: '운영국',
                schoolId: 'HQ001',
                role: 'superadmin',
                agreedToTerms: true,
            },
        ];

        let createdCount = 0;
        for (const userData of exampleUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                await User.create(userData);
                createdCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `${createdCount}개의 예시 계정이 생성되었습니다. (이미 존재하는 계정 제외)`,
            accounts: [
                { role: '일반 학생', email: 'student@moyora.kr', password: 'password123' },
                { role: '동아리장', email: 'leader@moyora.kr', password: 'password123' },
                { role: '최고 관리자', email: 'admin@moyora.kr', password: 'password123' },
            ]
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
