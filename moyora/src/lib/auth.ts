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

                // In development, allow admin login without DB
                if (process.env.NODE_ENV === 'development' && 
                    process.env.DEV_ADMIN_EMAIL && 
                    process.env.DEV_ADMIN_PASSWORD &&
                    credentials.email === process.env.DEV_ADMIN_EMAIL &&
                    credentials.password === process.env.DEV_ADMIN_PASSWORD) {
                    return {
                        id: 'dev-admin',
                        email: process.env.DEV_ADMIN_EMAIL,
                        name: '개발자 관리자',
                        schoolName: '모여라 개발팀',
                        schoolId: 'ADMIN',
                        role: 'superadmin',
                    };
                }

                try {
                    await connectDB();
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        throw new Error('데이터베이스 연결에 실패했습니다. 개발 환경에서는 관리자 로그인을 사용해주세요.');
                    }
                    throw error;
                }

                const email = credentials.email.toLowerCase().trim();
                const user = await User.findOne({ email });
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
                    role: user.role,
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
