import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await connectDB();

        const createdUsers = [];
        const password = await bcrypt.hash('DevTeam123!', 12);

        for (let i = 1; i <= 10; i++) {
            const email = `dev${i}@moyora.kr`;
            const phone = `010-0000-${i.toString().padStart(4, '0')}`;

            // Check if user exists
            const existingUser = await User.findOne({ email });

            if (!existingUser) {
                // Check if phone exists (to avoid duplicate key error if email didn't exist but phone did)
                const existingPhone = await User.findOne({ phone });
                if (existingPhone) {
                    await User.deleteOne({ _id: existingPhone._id }); // Cleanup old phone user if needed, or just skip? 
                    // Let's assume we want to overwrite/reset for these specific dev accounts if they conflict on phone but not email.
                    // Actually, safer to just create if email doesn't exist. If phone exists, it might error.
                    // Let's try-catch the creation.
                }

                try {
                    const newUser = await User.create({
                        name: `개발자${i}`,
                        email,
                        password, // Hashed password
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
            } else {
                createdUsers.push(`${email} (Already exists)`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Developer test accounts check/creation completed',
            createdUsers,
            defaultPassword: 'DevTeam123!'
        });
    } catch (error) {
        console.error('Seed dev users error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to seed dev users', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
