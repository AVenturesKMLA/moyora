import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { isDevAdminNoDbEnabled } from '@/lib/env-dev';
import User from '@/models/User';

async function ensureDevAdminUser(devKey: string) {
    const email =
        process.env.DEV_ADMIN_EMAIL?.toLowerCase().trim() ||
        process.env.DEV_ADMIN_SYNTHETIC_EMAIL?.toLowerCase().trim() ||
        'dev-admin@local.test';
    const hashedPassword = await bcrypt.hash(devKey, 12);

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name: 'Dev Admin',
            email,
            password: hashedPassword,
            birthday: new Date('2000-01-01'),
            phone: process.env.DEV_ADMIN_PHONE || `dev-admin-${Date.now()}`,
            schoolName: 'Dev Environment',
            schoolId: 'local',
            role: 'superadmin',
            agreedToTerms: true,
        });
    } else {
        let shouldSave = false;

        if (user.role !== 'superadmin') {
            user.role = 'superadmin';
            shouldSave = true;
        }

        const passwordMatches = await bcrypt.compare(devKey, user.password);
        if (!passwordMatches) {
            user.password = hashedPassword;
            shouldSave = true;
        }

        if (shouldSave) {
            await user.save();
        }
    }

    return user;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter your email and password.');
                }

                await connectDB();

                const email = credentials.email.toLowerCase().trim();
                const user = await User.findOne({ email });
                if (!user) {
                    throw new Error('No account exists for that email.');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!isPasswordValid) {
                    throw new Error('The password is incorrect.');
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

                if (isDevAdminNoDbEnabled()) {
                    const email =
                        process.env.DEV_ADMIN_SYNTHETIC_EMAIL || 'dev-admin@local.test';

                    return {
                        id: 'dev-local-superadmin',
                        email,
                        name: 'Dev Admin (no DB)',
                        schoolName: 'Dev Environment',
                        schoolId: 'local',
                        role: 'superadmin',
                    };
                }

                await connectDB();

                const user = await ensureDevAdminUser(expected);

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

                if (user.email) {
                    token.email = user.email;
                }

                token.schoolName = (user as { schoolName?: string }).schoolName;
                token.schoolId = (user as { schoolId?: string }).schoolId;
                token.role = (user as { role?: string }).role;

                if (user.id === 'dev-local-superadmin') {
                    token.devAdminNoDb = true;
                }
            }

            const devId = token.id ?? token.sub;
            if (devId === 'dev-local-superadmin') {
                token.devAdminNoDb = true;
                token.role = 'superadmin';
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id =
                    (token.id as string) || (token.sub as string);

                if (token.email) {
                    session.user.email = token.email as string;
                }

                (session.user as { schoolName?: string }).schoolName =
                    token.schoolName as string;
                (session.user as { schoolId?: string }).schoolId =
                    token.schoolId as string;
                (session.user as { role?: string }).role =
                    token.role as string | undefined;
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
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
