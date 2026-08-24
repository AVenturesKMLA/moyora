import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClubMessage extends Document {
    _id: mongoose.Types.ObjectId;
    clubId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string; // 표시용으로 비정규화 저장
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const ClubMessageSchema = new Schema<IClubMessage>(
    {
        clubId: {
            type: Schema.Types.ObjectId,
            ref: 'Club',
            required: [true, '동아리 ID가 필요합니다'],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 ID가 필요합니다'],
        },
        userName: {
            type: String,
            required: true,
            default: '알 수 없음',
        },
        content: {
            type: String,
            required: [true, '메시지 내용을 입력해주세요'],
            maxlength: [2000, '메시지는 2000자 이내로 입력해주세요'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// 동아리별 최신 메시지 조회 최적화
ClubMessageSchema.index({ clubId: 1, createdAt: 1 });

const ClubMessage: Model<IClubMessage> =
    mongoose.models.ClubMessage || mongoose.model<IClubMessage>('ClubMessage', ClubMessageSchema);

export default ClubMessage;
