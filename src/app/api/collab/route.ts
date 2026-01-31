import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, Schedule, User, Club } from '@/models';
import { authOptions } from '@/lib/auth';
import { IClub } from '@/models/Club';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const body = await request.json();
        const { title, category, dateStart, dateEnd, location, description, budget } = body;

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, message: '사용자를 찾을 수 없습니다' }, { status: 404 });
        }

        let event;
        const eventData = {
            userId: user._id,
            description,
            hostName: user.name,
            hostPhone: user.phone,
            schoolId: user.schoolId,
            notices: budget ? `예산: ${budget}` : '',
        };

        if (category === 'contest') {
            event = await Contest.create({
                ...eventData,
                contestName: title,
                contestType: '통합 대회',
                contestDate: new Date(dateStart),
                contestPlace: location || '미정',
            });
        } else if (category === 'forum') {
            event = await Forum.create({
                ...eventData,
                forumName: title,
                forumType: '연합 포럼',
                forumDate: new Date(dateStart),
                forumPlace: location || '미정',
            });
        } else if (category === 'research') {
            event = await CoResearch.create({
                ...eventData,
                researchName: title,
                researchType: '공동 연구',
                researchDate: new Date(dateStart),
                researchPlace: location || '미정',
            });
        } else {
            return NextResponse.json({ success: false, message: '올바른 카테고리가 아닙니다' }, { status: 400 });
        }

        // Create Schedule entry
        await Schedule.create({
            eventType: category,
            eventId: event._id,
            eventName: title,
            eventDate: new Date(dateStart),
            eventPlace: location || '미정',
            isPublic: true,
            schoolId: user.schoolId,
            userId: user._id,
        });

        return NextResponse.json({ success: true, message: '등록되었습니다', event }, { status: 201 });
    } catch (error) {
        console.error('Create collab error:', error);
        return NextResponse.json({ success: false, message: '등록 중 오류가 발생했습니다' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Fetch clubs to match with users
        const clubs = await Club.find();
        const clubMap = new Map();
        clubs.forEach((c: IClub) => clubMap.set(c.userId.toString(), c));

        // Fetch all types and merge
        const [contests, forums, researches] = await Promise.all([
            Contest.find().sort({ createdAt: -1 }).populate('userId', 'name schoolName'),
            Forum.find().sort({ createdAt: -1 }).populate('userId', 'name schoolName'),
            CoResearch.find().sort({ createdAt: -1 }).populate('userId', 'name schoolName'),
        ]);

        const formatItem = (item: any, type: string, titleField: string, dateField: string, placeField: string) => {
            const userId = item.userId?._id?.toString();
            const club = userId ? clubMap.get(userId) : null;

            return {
                id: item._id.toString(),
                club_id: userId || 'unknown',
                type: type,
                title: item[titleField],
                dateStart: item[dateField].toISOString(),
                region: item.userId?.schoolName || '전국',
                method: 'offline',
                address: item[placeField],
                budget: item.notices?.replace('예산: ', '') || '협의',
                status: 'open',
                description: item.description,
                // Virtual club info for frontend
                virtualClub: club ? {
                    name: club.clubName,
                    school: club.schoolName
                } : {
                    name: item.userId?.name + '의 활동',
                    school: item.userId?.schoolName
                }
            };
        };

        const formatted = [
            ...contests.map(c => formatItem(c, '통합 대회', 'contestName', 'contestDate', 'contestPlace')),
            ...forums.map(f => formatItem(f, '연합 포럼', 'forumName', 'forumDate', 'forumPlace')),
            ...researches.map(r => formatItem(r, '공동 연구', 'researchName', 'researchDate', 'researchPlace')),
        ].sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());

        return NextResponse.json({ success: true, collabs: formatted });
    } catch (error) {
        console.error('Fetch collabs error:', error);
        return NextResponse.json({ success: false, message: '활동을 불러오는 중 오류가 발생했습니다' }, { status: 500 });
    }
}
