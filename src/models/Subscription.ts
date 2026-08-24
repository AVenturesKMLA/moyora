import mongoose, { Schema, Document, Model } from 'mongoose';

// 동아리 멤버십 정기결제(구독).
// 회원 가입/동아리 개설 시 카드 빌링키를 발급받아 저장하고,
// 매월 크론(/api/cron/billing)이 이 빌링키로 자동 청구합니다.
export interface ISubscription extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId; // 결제자(동아리장)
    clubId?: mongoose.Types.ObjectId; // 연결된 동아리
    provider: 'portone';
    billingKey: string; // 포트원 빌링키
    plan: string;
    amount: number;
    currency: string;
    status: 'active' | 'canceled' | 'past_due';
    nextBillingDate: Date; // 다음 청구 예정일
    lastChargedAt?: Date; // 마지막 청구 성공 시각
    lastPaymentId?: string; // 마지막(=첫) 결제 ID
    failedAttempts: number; // 연속 청구 실패 횟수
    canceledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
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
        provider: {
            type: String,
            enum: ['portone'],
            default: 'portone',
        },
        billingKey: {
            type: String,
            required: true,
        },
        plan: {
            type: String,
            default: 'club_monthly',
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'KRW',
        },
        status: {
            type: String,
            enum: ['active', 'canceled', 'past_due'],
            default: 'active',
        },
        nextBillingDate: {
            type: Date,
            required: true,
        },
        lastChargedAt: {
            type: Date,
        },
        lastPaymentId: {
            type: String,
        },
        failedAttempts: {
            type: Number,
            default: 0,
        },
        canceledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, nextBillingDate: 1 }); // 크론 청구 대상 조회용
SubscriptionSchema.index({ lastPaymentId: 1 });

const Subscription: Model<ISubscription> =
    mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
