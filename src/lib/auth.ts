import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { isDevAdminNoDbEnabled } from '@/lib/env-dev';
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
                };
            },
        }),
        CredentialsProvider({
            id: 'dev-admin',
            name: 'Dev Admin',
            credentials: {
                devKey: { label: 'Dev key', type: 'password' },
            },
            async authorize(credentials) {
                if (process.env.NODE_ENV !== 'development') {
                    return null;
                }
                const expected = process.env.DEV_ADMIN_LOGIN_KEY?.trim();
                const received =
                    typeof credentials?.devKey === 'string'
                        ? credentials.devKey.trim()
                        : '';
                if (!expected || received !== expected) {
                    return null;
                }

                // MongoDB 없이 로컬 관리자 화면만 볼 때 (데이터 API는 여전히 DB 필요)
                if (isDevAdminNoDbEnabled()) {
                    const email =
                        process.env.DEV_ADMIN_SYNTHETIC_EMAIL || 'dev-admin@local.test';
                    return {
                        id: 'dev-local-superadmin',
                        email,
                        name: 'Dev Admin (no DB)',
                        schoolName: '—',
                        schoolId: 'local',
                    };
                }

                await connectDB();

                const emailEnv = process.env.DEV_ADMIN_EMAIL?.toLowerCase().trim();
                let user;

                if (emailEnv) {
                    // Match by email only — same email may still be `user` in DB
                    user = await User.findOne({ email: emailEnv });
                    if (!user) {
                        return null;
                    }
                    if (user.role !== 'superadmin') {
                        user.role = 'superadmin';
                        await user.save();
                    }
                } else {
                    // No DEV_ADMIN_EMAIL: prefer an existing superadmin
                    user = await User.findOne({ role: 'superadmin' }).sort({ createdAt: 1 });
                    if (!user) {
                        // Dev fallback: DB에 superadmin이 없으면 가장 오래된 사용자를 승격
                        const fallback = await User.findOne().sort({ createdAt: 1 });
                        if (!fallback) {
                            return null;
                        }
                        fallback.role = 'superadmin';
                        await fallback.save();
                        user = fallback;
                    }
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
                if (user.email) {
                    token.email = user.email;
                }
                token.schoolName = (user as { schoolName?: string }).schoolName;
                token.schoolId = (user as { schoolId?: string }).schoolId;
                if (user.id === 'dev-local-superadmin') {
                    token.devAdminNoDb = true;
                }
            }
            // Refresh: keep flags without `user` present
            const devId = token.id ?? token.sub;
            if (devId === 'dev-local-superadmin') {
                token.devAdminNoDb = true;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = (token.id as string) || (token.sub as string);
                if (token.email) {
                    session.user.email = token.email as string;
                }
                (session.user as { schoolName?: string }).schoolName = token.schoolName as string;
                (session.user as { schoolId?: string }).schoolId = token.schoolId as string;
                (session.user as { devAdminNoDb?: boolean }).devAdminNoDb = Boolean(
                    token.devAdminNoDb
                );
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
