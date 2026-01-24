import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipant extends Document {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    userSchool: string;
    clubName?: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventId: mongoose.Types.ObjectId;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 ID가 필요합니다'],
        },
        userName: {
            type: String,
            required: [true, '참가자 이름이 필요합니다'],
        },
        userEmail: {
            type: String,
            required: [true, '참가자 이메일이 필요합니다'],
        },
        userSchool: {
            type: String,
            required: [true, '참가자 학교가 필요합니다'],
        },
        clubName: {
            type: String,
            trim: true,
        },
        eventType: {
            type: String,
            enum: ['contest', 'forum', 'co-research'],
            required: [true, '이벤트 유형이 필요합니다'],
        },
        eventId: {
            type: Schema.Types.ObjectId,
            required: [true, '이벤트 ID가 필요합니다'],
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

// Compound index to prevent duplicate participation
ParticipantSchema.index({ userId: 1, eventType: 1, eventId: 1 }, { unique: true });
ParticipantSchema.index({ eventType: 1, eventId: 1 });

const Participant: Model<IParticipant> =
    mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default Participant;
