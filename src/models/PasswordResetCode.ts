import mongoose, { Schema, Document, Model } from 'mongoose';

/** 비밀번호 재설정용 이메일 인증코드. 이메일당 1개만 유지하며 만료 시 MongoDB TTL로 자동 삭제된다. */
export interface IPasswordResetCode extends Document {
    email: string;
    /** 코드 원문은 저장하지 않고 HMAC 해시만 저장 */
    codeHash: string;
    expiresAt: Date;
    /** 마지막 발송 시각 (재발송 대기시간 계산용) */
    sentAt: Date;
    /** 틀린 시도 횟수 */
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}

const PasswordResetCodeSchema = new Schema<IPasswordResetCode>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        codeHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        sentAt: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
    },
    { timestamps: true }
);

PasswordResetCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetCode: Model<IPasswordResetCode> =
    mongoose.models.PasswordResetCode ||
    mongoose.model<IPasswordResetCode>('PasswordResetCode', PasswordResetCodeSchema);

export default PasswordResetCode;
