import mongoose, { Schema, Document, Model } from 'mongoose';
import { EventType } from './Schedule';

export interface IClubRating extends Document {
    _id: mongoose.Types.ObjectId;
    eventType: EventType;
    eventId: mongoose.Types.ObjectId;
    hostUserId: mongoose.Types.ObjectId;
    targetClubId: mongoose.Types.ObjectId;
    score: number;
    professionalism: number;
    reliability: number;
    collaborationIntent: number;
    createdAt: Date;
    updatedAt: Date;
}

const ClubRatingSchema = new Schema<IClubRating>(
    {
        eventType: {
            type: String,
            enum: ['contest', 'forum', 'co-research'],
            required: [true, '이벤트 유형이 필요합니다'],
        },
        eventId: {
            type: Schema.Types.ObjectId,
            required: [true, '이벤트 ID가 필요합니다'],
        },
        hostUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '평가자 정보가 필요합니다'],
        },
        targetClubId: {
            type: Schema.Types.ObjectId,
            ref: 'Club',
            required: [true, '평가 대상 동아리 정보가 필요합니다'],
        },
        score: {
            type: Number,
            required: [true, '점수가 필요합니다'],
            min: 1,
            max: 5,
        },
        professionalism: {
            type: Number,
            required: [true, '전문성 점수가 필요합니다'],
            min: 1,
            max: 5,
        },
        reliability: {
            type: Number,
            required: [true, '신뢰성 점수가 필요합니다'],
            min: 1,
            max: 5,
        },
        collaborationIntent: {
            type: Number,
            required: [true, '재협업 의향 점수가 필요합니다'],
            min: 1,
            max: 5,
        },
    },
    {
        timestamps: true,
    }
);

ClubRatingSchema.index({ targetClubId: 1, createdAt: -1 });
ClubRatingSchema.index({ eventType: 1, eventId: 1 });
ClubRatingSchema.index(
    { eventType: 1, eventId: 1, hostUserId: 1, targetClubId: 1 },
    { unique: true }
);

const ClubRating: Model<IClubRating> =
    mongoose.models.ClubRating || mongoose.model<IClubRating>('ClubRating', ClubRatingSchema);

export default ClubRating;
