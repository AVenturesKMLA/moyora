import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    birthday: Date;
    phone: string;
    schoolName: string;
    schoolId: string;
    role: 'user' | 'admin' | 'superadmin';
    agreedToTerms: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, '이름을 입력해주세요'],
            trim: true,
            maxlength: [50, '이름은 50자 이하로 입력해주세요'],
        },
        email: {
            type: String,
            required: [true, '이메일을 입력해주세요'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                '올바른 이메일 형식을 입력해주세요',
            ],
        },
        password: {
            type: String,
            required: [true, '비밀번호를 입력해주세요'],
            minlength: [8, '비밀번호는 8자 이상이어야 합니다'],
        },
        phone: {
            type: String,
            required: [true, '전화번호가 필요합니다'],
            unique: true,
        },
        birthday: {
            type: Date,
            required: [true, '생년월일을 입력해주세요'],
        },
        schoolName: {
            type: String,
            required: [true, '학교명을 입력해주세요'],
            trim: true,
        },
        schoolId: {
            type: String,
            required: [true, '학교 고유 ID가 필요합니다'],
            index: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user',
        },
        agreedToTerms: {
            type: Boolean,
            required: [true, '이용약관에 동의해주세요'],
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
UserSchema.index({ schoolId: 1 });
UserSchema.index({ schoolName: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
