import mongoose, { Schema, Document, Model } from 'mongoose';

export type EventType = 'contest' | 'forum' | 'co-research';

export interface ISchedule extends Document {
    _id: mongoose.Types.ObjectId;
    eventType: EventType;
    eventId: mongoose.Types.ObjectId;
    eventName: string;
    eventDate: Date;
    eventPlace: string;
    isPublic: boolean;
    schoolId: string;
    userId?: mongoose.Types.ObjectId; // For private schedule entries
    createdAt: Date;
    updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
    {
        eventType: {
            type: String,
            enum: ['contest', 'forum', 'co-research'],
            required: [true, '이벤트 유형이 필요합니다'],
        },
        eventId: {
            type: Schema.Types.ObjectId,
            required: [true, '이벤트 ID가 필요합니다'],
            refPath: 'eventType',
        },
        eventName: {
            type: String,
            required: [true, '이벤트명이 필요합니다'],
            trim: true,
        },
        eventDate: {
            type: Date,
            required: [true, '이벤트 날짜가 필요합니다'],
        },
        eventPlace: {
            type: String,
            required: [true, '이벤트 장소가 필요합니다'],
            trim: true,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        schoolId: {
            type: String,
            required: [true, '학교 고유 ID가 필요합니다'],
},
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
ScheduleSchema.index({ eventDate: 1 });
ScheduleSchema.index({ schoolId: 1, eventDate: 1 });
ScheduleSchema.index({ isPublic: 1, schoolId: 1, eventDate: 1 });
ScheduleSchema.index({ userId: 1, eventDate: 1 });
ScheduleSchema.index({ eventType: 1, eventDate: 1 });

const Schedule: Model<ISchedule> = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;
