import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import { Club, ClubApplication, User, ClubMember } from '@/models';
import mongoose from 'mongoose';

// PATCH: Approve / Reject Application
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await request.json();

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, message: '유효하지 않은 상태입니다' }, { status: 400 });
        }

        await connectDB();

        const application = await ClubApplication.findById(id);
        if (!application) {
            return NextResponse.json({ success: false, message: '신청 내역을 찾을 수 없습니다' }, { status: 404 });
        }

        // Verify permission (User must be chief of the club)
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ success: false }, { status: 404 });

        const club = await Club.findById(application.clubId);
        if (!club) return NextResponse.json({ success: false }, { status: 404 });

        const isCreator = club.userId.toString() === user._id.toString();
        const isChiefMember = await ClubMember.findOne({ userId: user._id, clubId: club._id, role: 'chief' });

        if (!isCreator && !isChiefMember) {
            return NextResponse.json({ success: false, message: '권한이 없습니다' }, { status: 403 });
        }

        // Processing
        if (status === 'approved') {
            // Check if already a member to be safe
            const existingMember = await ClubMember.findOne({ userId: application.userId, clubId: application.clubId });
            if (!existingMember) {
                // Add to ClubMember
                await ClubMember.create({
                    userId: application.userId,
                    clubId: application.clubId,
                    schoolId: club.schoolId, // Inherit schoolId from club
                    role: 'member'
                });
            }
        }

        // Update Application Status
        application.status = status;
        await application.save();

        return NextResponse.json({ success: true, message: `신청이 ${status === 'approved' ? '승인' : '거절'}되었습니다` });

    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json({ success: false, message: '처리 중 오류가 발생했습니다' }, { status: 500 });
    }
}
