import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClub extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    schoolName: string;
    schoolId: string;
    clubTheme: string;
    clubName: string;
    presidentName: string;
    presidentEmail: string;
    presidentPhone: string;
    clubEmail?: string;
    description?: string;
    location?: string;
    meetingTime?: string;
    maxMembers?: number;
    recruitStatus: 'open' | 'close';
    createdAt: Date;
    updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 정보가 필요합니다'],
        },
        schoolName: {
            type: String,
            required: [true, '학교명을 입력해주세요'],
            trim: true,
        },
        schoolId: {
            type: String,
            required: [true, '학교 고유 ID가 필요합니다'],
},
        clubTheme: {
            type: String,
            required: [true, '동아리 분야를 입력해주세요'],
            trim: true,
        },
        clubName: {
            type: String,
            required: [true, '동아리명을 입력해주세요'],
            trim: true,
        },
        presidentName: {
            type: String,
            required: [true, '회장 이름을 입력해주세요'],
            trim: true,
        },
        presidentEmail: {
            type: String,
            required: [true, '회장 이메일을 입력해주세요'],
            lowercase: true,
            trim: true,
        },
        presidentPhone: {
            type: String,
            required: [true, '회장 전화번호를 입력해주세요'],
            trim: true,
        },
        clubEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        meetingTime: {
            type: String,
            trim: true,
        },
        maxMembers: {
            type: Number,
        },
        recruitStatus: {
            type: String,
            enum: ['open', 'close'],
            default: 'open',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ClubSchema.index({ userId: 1 });
ClubSchema.index({ schoolId: 1 });
ClubSchema.index({ schoolName: 1 });
ClubSchema.index({ clubName: 'text', clubTheme: 'text' });

const Club: Model<IClub> = mongoose.models.Club || mongoose.model<IClub>('Club', ClubSchema);

export default Club;
