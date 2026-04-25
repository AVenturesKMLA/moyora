import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClubApplication extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    clubId: mongoose.Types.ObjectId;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const ClubApplicationSchema = new Schema<IClubApplication>(
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
        message: {
            type: String,
            maxlength: [500, '메시지는 500자 이내로 입력해주세요'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ClubApplicationSchema.index({ userId: 1, clubId: 1 }, { unique: true }); // Prevent duplicate applications
ClubApplicationSchema.index({ clubId: 1 });
ClubApplicationSchema.index({ userId: 1 });

const ClubApplication: Model<IClubApplication> =
    mongoose.models.ClubApplication || mongoose.model<IClubApplication>('ClubApplication', ClubApplicationSchema);

export default ClubApplication;
