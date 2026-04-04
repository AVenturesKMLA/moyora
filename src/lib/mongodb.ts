import mongoose from 'mongoose';
import { isDevAdminNoDbEnabled } from '@/lib/env-dev';

const MONGODB_URI = process.env.MONGODB_URI;

/** When true (dev only), app can boot without MONGODB_URI for local admin preview; DB calls still fail until URI is set. */
const devMongoOptional = isDevAdminNoDbEnabled();

if (!MONGODB_URI && !devMongoOptional) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (!MONGODB_URI) {
        throw new Error(
            'MONGODB_URI가 없습니다. `.env.local`에 연결 문자열을 넣으세요. (개발 환경에서는 기본적으로 URI 없이도 앱이 뜹니다.)'
        );
    }

    if (cached?.conn) {
        return cached.conn;
    }

    if (!cached?.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (e) {
        cached!.promise = null;
        throw e;
    }

    return cached!.conn;
}

export default connectDB;
