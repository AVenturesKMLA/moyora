import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Schedule, Notification } from '@/models';
import { ReminderDays } from '@/models/Notification';

function authorizeCronRequest(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (!cronSecret) {
        return NextResponse.json(
            { success: false, message: 'Server misconfigured: CRON_SECRET is missing' },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        );
    }

    return null;
}

// POST - Run notification job (called by cron)
export async function POST(request: NextRequest) {
    try {
        const unauthorized = authorizeCronRequest(request);
        if (unauthorized) return unauthorized;

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reminderDays: ReminderDays[] = [7, 3, 1];
        let notificationsCreated = 0;

        for (const daysUntil of reminderDays) {
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + daysUntil);

            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const schedules = await Schedule.find({
                eventDate: { $gte: targetDate, $lt: nextDay },
                isPublic: false,
            });

            for (const schedule of schedules) {
                if (!schedule.userId) continue;

                const existingNotification = await Notification.findOne({
                    userId: schedule.userId,
                    eventId: schedule.eventId,
                    daysUntil,
                });

                if (!existingNotification) {
                    await Notification.create({
                        userId: schedule.userId,
                        eventType: schedule.eventType,
                        eventId: schedule.eventId,
                        eventName: schedule.eventName,
                        eventDate: schedule.eventDate,
                        eventPlace: schedule.eventPlace,
                        daysUntil,
                        isRead: false,
                    });
                    notificationsCreated++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Created ${notificationsCreated} notifications`,
            notificationsCreated,
        });
    } catch (error) {
        console.error('Notification cron error:', error);
        return NextResponse.json(
            { success: false, message: 'Notification job failed' },
            { status: 500 }
        );
    }
}

// GET - For authenticated health check
export async function GET(request: NextRequest) {
    const unauthorized = authorizeCronRequest(request);
    if (unauthorized) return unauthorized;

    return NextResponse.json({
        success: true,
        message: 'Notification cron endpoint is active',
        reminders: [7, 3, 1],
        description: 'Creates notifications for events 7, 3, and 1 days before',
    });
}
