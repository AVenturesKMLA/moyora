import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Restrict diagnostics to superadmin only.
        const user = session.user as { role?: string };
        if (user.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: {
                active_db_name: mongoose.connection.db?.databaseName || 'unknown',
                ready_state: mongoose.connection.readyState,
                node_env: process.env.NODE_ENV,
            },
        });
    } catch (error) {
        console.error('Diagnostics error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
