import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClubPayment extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId; // 결제한 사용자 (동아리장)
    clubId?: mongoose.Types.ObjectId; // 결제로 개설된 동아리 (사용 후 연결)
    amount: number;
    currency: string;
    plan: string;
    provider: 'mock' | 'portone' | 'toss';
    paymentId: string; // 결제 고유 ID (PG 연동 시 imp_uid 등)
    status: 'paid' | 'consumed' | 'failed' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}

const ClubPaymentSchema = new Schema<IClubPayment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 ID가 필요합니다'],
        },
        clubId: {
            type: Schema.Types.ObjectId,
            ref: 'Club',
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'KRW',
        },
        plan: {
            type: String,
            default: 'club_monthly',
        },
        provider: {
            type: String,
            enum: ['mock', 'portone', 'toss'],
            default: 'mock',
        },
        paymentId: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['paid', 'consumed', 'failed', 'refunded'],
            default: 'paid',
        },
    },
    {
        timestamps: true,
    }
);

ClubPaymentSchema.index({ userId: 1, status: 1 });

const ClubPayment: Model<IClubPayment> =
    mongoose.models.ClubPayment || mongoose.model<IClubPayment>('ClubPayment', ClubPaymentSchema);

export default ClubPayment;
