
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admins or superadmins to see diagnostics
        const user = session.user as { role?: string; email?: string };
        if (user.role !== 'admin' && user.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const uri = process.env.MONGODB_URI || 'UNDEFINED';
        // Mask the password for security
        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');

        await connectDB();
        const dbName = mongoose.connection.db?.databaseName || 'unknown';
        const host = mongoose.connection.host;

        const targetEmail = 'psalm10435@gmail.com';
        const targetUser = await User.findOne({ email: targetEmail });

        return NextResponse.json({
            status: 'Diagnostics',
            timestamp: new Date().toISOString(),
            environment: {
                active_db_name: dbName,
                host: host,
                uri_mask: maskedUri,
                node_env: process.env.NODE_ENV
            },
            user_check: {
                target_email: targetEmail,
                found: !!targetUser,
                user_id: targetUser?._id || null,
                user_role: targetUser?.role || null
            }
        });
    } catch (error) {
        console.error('Diagnostics error:', error);
        return NextResponse.json({
            error: 'Internal Server Error'
        }, { status: 500 });
    }
}
