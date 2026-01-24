import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoResearch extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    researchName: string;
    researchType: string;
    researchDate: Date;
    researchPlace: string;
    description: string;
    joiningClubs: string[];
    notices: string;
    hostName: string;
    hostPhone: string;
    createdAt: Date;
    updatedAt: Date;
}

const CoResearchSchema = new Schema<ICoResearch>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 정보가 필요합니다'],
        },
        researchName: {
            type: String,
            required: [true, '공동연구명을 입력해주세요'],
            trim: true,
        },
        researchType: {
            type: String,
            required: [true, '연구 분야를 선택해주세요'],
            trim: true,
        },
        researchDate: {
            type: Date,
            required: [true, '연구 기한을 입력해주세요'],
        },
        researchPlace: {
            type: String,
            required: [true, '연구 장소를 입력해주세요'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, '연구 설명을 입력해주세요'],
            trim: true,
        },
        joiningClubs: [{
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
CoResearchSchema.index({ userId: 1 });
CoResearchSchema.index({ researchDate: 1 });
CoResearchSchema.index({ researchName: 'text', description: 'text' });

const CoResearch: Model<ICoResearch> = mongoose.models.CoResearch || mongoose.model<ICoResearch>('CoResearch', CoResearchSchema);

export default CoResearch;
