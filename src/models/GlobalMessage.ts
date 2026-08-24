import mongoose, { Schema, Document, Model } from 'mongoose';

// 전체 공용 채팅(모든 로그인 사용자) 메시지
export interface IGlobalMessage extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    schoolName: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const GlobalMessageSchema = new Schema<IGlobalMessage>(
    {
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
        schoolName: {
            type: String,
            default: '',
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

GlobalMessageSchema.index({ createdAt: 1 });

const GlobalMessage: Model<IGlobalMessage> =
    mongoose.models.GlobalMessage || mongoose.model<IGlobalMessage>('GlobalMessage', GlobalMessageSchema);

export default GlobalMessage;
