import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: '이메일', type: 'email' },
                password: { label: '비밀번호', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('이메일과 비밀번호를 입력해주세요');
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error('등록되지 않은 이메일입니다');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!isPasswordValid) {
                    throw new Error('비밀번호가 올바르지 않습니다');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    schoolName: user.schoolName,
                    schoolId: user.schoolId,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.schoolName = (user as { schoolName?: string }).schoolName;
                token.schoolId = (user as { schoolId?: string }).schoolId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.id as string;
                (session.user as { schoolName?: string }).schoolName = token.schoolName as string;
                (session.user as { schoolId?: string }).schoolId = token.schoolId as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
