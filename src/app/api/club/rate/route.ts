import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Club } from '@/models';

interface RatingSubmission {
    clubId: string;
    rating: number; // 1 to 5
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const body = await request.json();
        const { collabId, ratings } = body;

        if (!collabId || !ratings || !Array.isArray(ratings)) {
            return NextResponse.json({ success: false, message: '잘못된 요청 파라미터입니다' }, { status: 400 });
        }

        await connectDB();

        // Process each rating
        for (const r of ratings as RatingSubmission[]) {
            const club = await Club.findById(r.clubId);
            if (club) {
                // Convert 1-5 star rating to 20-100 score
                const ratingScore = r.rating * 20;

                const currentScore = club.trustScore || 70;
                const currentCount = club.trustCount || 0;

                // Moving average formula for trust score
                const newScore = Math.round(((currentScore * currentCount) + ratingScore) / (currentCount + 1));
                
                club.trustScore = Math.max(0, Math.min(100, newScore));
                club.trustCount = currentCount + 1;
                
                await club.save();
            }
        }

        return NextResponse.json({ success: true, message: '평가가 성공적으로 제출되었습니다' });

    } catch (error) {
        console.error('Submit rating error:', error);
        return NextResponse.json({ success: false, message: '평가 제출 중 오류가 발생했습니다' }, { status: 500 });
    }
}
