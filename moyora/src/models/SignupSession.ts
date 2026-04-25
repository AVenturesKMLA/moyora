import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISignupSession extends Document {
    sessionToken: string;
    name: string;
    phone: string;
    birthday: string;
    used: boolean;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SignupSessionSchema = new Schema<ISignupSession>(
    {
        sessionToken: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        birthday: { type: String, required: true },
        used: { type: Boolean, default: false },
        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);

SignupSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SignupSession: Model<ISignupSession> = mongoose.models.SignupSession || mongoose.model<ISignupSession>('SignupSession', SignupSessionSchema);

export default SignupSession;
