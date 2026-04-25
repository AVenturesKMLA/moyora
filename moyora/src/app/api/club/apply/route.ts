import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Club, ClubApplication, User, ClubMember } from '@/models';
import mongoose from 'mongoose';

// POST: Apply to a club
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const { clubId, message } = await request.json();

        if (!clubId) {
            return NextResponse.json({ success: false, message: '동아리 ID가 필요합니다' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, message: '사용자를 찾을 수 없습니다' }, { status: 404 });
        }

        const club = await Club.findById(clubId);
        if (!club) {
            return NextResponse.json({ success: false, message: '동아리를 찾을 수 없습니다' }, { status: 404 });
        }

        // Check if already a member
        const isMember = await ClubMember.findOne({ userId: user._id, clubId });
        if (isMember) {
            return NextResponse.json({ success: false, message: '이미 이 동아리의 멤버입니다' }, { status: 400 });
        }

        // Check if already applied
        const existingApplication = await ClubApplication.findOne({ userId: user._id, clubId, status: 'pending' });
        if (existingApplication) {
            return NextResponse.json({ success: false, message: '이미 처리 중인 가입 신청이 있습니다' }, { status: 400 });
        }

        // Create Application
        await ClubApplication.create({
            userId: user._id,
            clubId,
            message,
            status: 'pending'
        });

        return NextResponse.json({ success: true, message: '가입 신청이 완료되었습니다' });

    } catch (error) {
        console.error('Club apply error:', error);
        return NextResponse.json({ success: false, message: '가입 신청 중 오류가 발생했습니다' }, { status: 500 });
    }
}

// GET: Fetch applications (For Club Chief)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

        if (!clubId) {
            // If no clubId provided, maybe return applications made BY the user?
            // For now, let's assume this endpoint is for fetching incoming applications for a club.
            return NextResponse.json({ success: false, message: '동아리 ID가 필요합니다' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ success: false }, { status: 404 });

        // Verify User is Chief of this club
        // We can check Club document (userId) OR ClubMember (role='chief')
        // The Club model has userId as the creator. Let's stick to that for simplicity, or check ClubMember.
        // Let's use ClubMember for robust role checking if available, but Club.userId is the owner.
        const club = await Club.findById(clubId);
        if (!club) return NextResponse.json({ success: false, message: 'Club not found' }, { status: 404 });

        if (club.userId.toString() !== user._id.toString()) {
            // Also check if they are a chief in ClubMember
            const memberRecord = await ClubMember.findOne({ userId: user._id, clubId, role: 'chief' });
            if (!memberRecord) {
                return NextResponse.json({ success: false, message: '권한이 없습니다' }, { status: 403 });
            }
        }

        const applications = await ClubApplication.find({ clubId })
            .populate('userId', 'name email schoolName phone') // Populate applicant details
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, applications });

    } catch (error) {
        console.error('Fetch applications error:', error);
        return NextResponse.json({ success: false, message: '신청 내역 조회 중 오류가 발생했습니다' }, { status: 500 });
    }
}
