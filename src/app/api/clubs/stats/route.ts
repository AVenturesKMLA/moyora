import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Club from '@/models/Club';

// GET /api/clubs/stats — returns total club count and clubs by category
export async function GET() {
    try {
        await connectDB();
        const [count, categoryGroups] = await Promise.all([
            Club.countDocuments(),
            Club.aggregate([
                { $group: { _id: '$clubTheme', count: { $sum: 1 }, clubs: { $push: { id: '$_id', name: '$clubName', school: '$schoolName', score: '$trustScore' } } } },
                { $sort: { count: -1 } }
            ])
        ]);
        return NextResponse.json({ success: true, count, categoryGroups });
    } catch (error) {
        console.error('Club stats error:', error);
        return NextResponse.json({ success: false, count: 0, categoryGroups: [] });
    }
}
