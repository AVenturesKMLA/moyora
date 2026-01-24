import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Schedule, Notification, User } from '@/models';
import { ReminderDays } from '@/models/Notification';

// POST - Run notification job (called by cron)
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reminderDays: ReminderDays[] = [7, 3, 1];
        let notificationsCreated = 0;

        for (const daysUntil of reminderDays) {
            // Calculate target date
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + daysUntil);

            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);

            // Find events happening on target date
            const schedules = await Schedule.find({
                eventDate: { $gte: targetDate, $lt: nextDay },
                isPublic: false, // Private schedules (user's own events)
            });

            for (const schedule of schedules) {
                if (!schedule.userId) continue;

                // Check if notification already exists
                const existingNotification = await Notification.findOne({
                    userId: schedule.userId,
                    eventId: schedule.eventId,
                    daysUntil,
                });

                if (!existingNotification) {
                    // Create notification
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

// GET - For health check
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Notification cron endpoint is active',
        reminders: [7, 3, 1],
        description: 'Creates notifications for events 7, 3, and 1 days before',
    });
}
