import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContest extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    schoolId: string;
    contestName: string;
    contestType: string;
    contestDate: Date;
    contestPlace: string;
    description: string;
    enteringClubs: string[];
    notices: string;
    hostName: string;
    hostPhone: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContestSchema = new Schema<IContest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 정보가 필요합니다'],
        },
        schoolId: {
            type: String,
            required: [true, '학교 고유 ID가 필요합니다'],
            index: true,
        },
        contestName: {
            type: String,
            required: [true, '대회명을 입력해주세요'],
            trim: true,
        },
        contestType: {
            type: String,
            required: [true, '대회 유형을 선택해주세요'],
            trim: true,
        },
        contestDate: {
            type: Date,
            required: [true, '대회 일자를 입력해주세요'],
        },
        contestPlace: {
            type: String,
            required: [true, '대회 장소를 입력해주세요'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, '대회 설명을 입력해주세요'],
            trim: true,
        },
        enteringClubs: [{
            type: String,
            trim: true,
        }],
        notices: {
            type: String,
            trim: true,
        },
        hostName: {
            type: String,
            required: [true, '주최자 이름을 입력해주세요'],
            trim: true,
        },
        hostPhone: {
            type: String,
            required: [true, '주최자 연락처를 입력해주세요'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ContestSchema.index({ userId: 1 });
ContestSchema.index({ schoolId: 1 });
ContestSchema.index({ contestDate: 1 });
ContestSchema.index({ contestName: 'text', description: 'text' });

const Contest: Model<IContest> = mongoose.models.Contest || mongoose.model<IContest>('Contest', ContestSchema);

export default Contest;
