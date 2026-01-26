import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClubMember extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    clubId: mongoose.Types.ObjectId;
    schoolId: string;
    role: 'chief' | 'member';
    joinedAt: Date;
}

const ClubMemberSchema = new Schema<IClubMember>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 ID가 필요합니다'],
        },
        clubId: {
            type: Schema.Types.ObjectId,
            ref: 'Club',
            required: [true, '동아리 ID가 필요합니다'],
        },
        schoolId: {
            type: String,
            required: [true, '학교 고유 ID가 필요합니다'],
            index: true,
        },
        role: {
            type: String,
            enum: ['chief', 'member'],
            default: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ClubMemberSchema.index({ userId: 1, clubId: 1 }, { unique: true });
ClubMemberSchema.index({ clubId: 1 });
ClubMemberSchema.index({ userId: 1 });
ClubMemberSchema.index({ schoolId: 1 });

const ClubMember: Model<IClubMember> =
    mongoose.models.ClubMember || mongoose.model<IClubMember>('ClubMember', ClubMemberSchema);

export default ClubMember;
