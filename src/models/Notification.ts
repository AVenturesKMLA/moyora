import mongoose, { Schema, Document, Model } from 'mongoose';
import { EventType } from './Schedule';

export type ReminderDays = 7 | 3 | 1;

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    eventType: EventType;
    eventId: mongoose.Types.ObjectId;
    eventName: string;
    eventDate: Date;
    eventPlace: string;
    daysUntil: ReminderDays;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, '사용자 정보가 필요합니다'],
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
        daysUntil: {
            type: Number,
            enum: [7, 3, 1],
            required: [true, '알림 일수가 필요합니다'],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
// Prevent duplicate notifications
NotificationSchema.index(
    { userId: 1, eventId: 1, daysUntil: 1 },
    { unique: true }
);

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
