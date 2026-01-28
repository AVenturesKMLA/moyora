
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const uri = process.env.MONGODB_URI || 'UNDEFINED';
        // Mask the password for security
        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');

        await connectDB();
        const dbName = mongoose.connection.db?.databaseName || 'unknown';
        const host = mongoose.connection.host;

        const email = 'psalm10435@gmail.com';
        const user = await User.findOne({ email });

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
                target_email: email,
                found: !!user,
                user_id: user?._id || null,
                user_role: user?.role || null
            }
        });
    } catch (error) {
        return NextResponse.json({
            error: (error as Error).message,
            stack: (error as Error).stack
        }, { status: 500 });
    }
}
