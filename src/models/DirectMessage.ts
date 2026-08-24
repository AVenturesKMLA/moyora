import mongoose, { Schema, Document, Model } from 'mongoose';

// 1:1 개인 채팅(DM) 메시지
export interface IDirectMessage extends Document {
    _id: mongoose.Types.ObjectId;
    pairKey: string; // 두 사용자 id를 정렬해 결합한 대화방 식별자
    participants: mongoose.Types.ObjectId[]; // [userA, userB]
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    recipientId: mongoose.Types.ObjectId;
    content: string;
    read: boolean; // 수신자가 읽었는지 여부
    createdAt: Date;
    updatedAt: Date;
}

const DirectMessageSchema = new Schema<IDirectMessage>(
    {
        pairKey: { type: String, required: true, index: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true, default: '알 수 없음' },
        recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: {
            type: String,
            required: [true, '메시지 내용을 입력해주세요'],
            maxlength: [2000, '메시지는 2000자 이내로 입력해주세요'],
            trim: true,
        },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

DirectMessageSchema.index({ pairKey: 1, createdAt: 1 });
DirectMessageSchema.index({ recipientId: 1, read: 1 });

// 두 사용자 id로 대화방 키 생성 (정렬해 결합 → 순서 무관 동일 키)
export function makePairKey(a: string, b: string): string {
    return [a, b].sort().join('_');
}

const DirectMessage: Model<IDirectMessage> =
    mongoose.models.DirectMessage || mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);

export default DirectMessage;
