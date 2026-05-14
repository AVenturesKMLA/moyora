import type { Metadata } from 'next';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Club from '@/models/Club';
import ClubDetailClient from './club-detail-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return { title: '동아리 | 모여라' };
    }
    try {
        await connectDB();
        const club = await Club.findById(id).select('clubName schoolName description').lean();
        if (!club) {
            return { title: '동아리를 찾을 수 없습니다 | 모여라' };
        }
        const name = (club as { clubName?: string }).clubName || '동아리';
        const school = (club as { schoolName?: string }).schoolName;
        const desc = (club as { description?: string }).description;
        const description =
            typeof desc === 'string' && desc.trim()
                ? desc.trim().slice(0, 155) + (desc.trim().length > 155 ? '…' : '')
                : `${school ? school + ' ' : ''}${name} 동아리 정보`;
        return {
            title: `${name} | 모여라`,
            description,
            openGraph: {
                title: `${name} | 모여라`,
                description,
            },
        };
    } catch {
        return { title: '동아리 | 모여라' };
    }
}

export default async function ClubDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ClubDetailClient clubId={id} />;
}
