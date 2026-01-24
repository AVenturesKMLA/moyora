import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IForum extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    forumName: string;
    forumType: string;
    forumDate: Date;
    forumPlace: string;
    description: string;
    forumClubs: string[];
    notices: string;
    hostName: string;
    hostPhone: string;
    createdAt: Date;
    updatedAt: Date;
}

const ForumSchema = new Schema<IForum>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 정보가 필요합니다'],
        },
        forumName: {
            type: String,
            required: [true, '포럼명을 입력해주세요'],
            trim: true,
        },
        forumType: {
            type: String,
            required: [true, '포럼 유형을 선택해주세요'],
            trim: true,
        },
        forumDate: {
            type: Date,
            required: [true, '포럼 일자를 입력해주세요'],
        },
        forumPlace: {
            type: String,
            required: [true, '포럼 장소를 입력해주세요'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, '포럼 설명을 입력해주세요'],
            trim: true,
        },
        forumClubs: [{
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
ForumSchema.index({ userId: 1 });
ForumSchema.index({ forumDate: 1 });
ForumSchema.index({ forumName: 'text', description: 'text' });

const Forum: Model<IForum> = mongoose.models.Forum || mongoose.model<IForum>('Forum', ForumSchema);

export default Forum;
