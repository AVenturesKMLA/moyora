'use client';

import { useNotifications } from '@/context/NotificationContext';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

export default function NotificationDropdown() {
    const { notifications, markAsRead, clearAll } = useNotifications();

    return (
        <DropdownMenuContent className="w-80" align="end" forceMount>
            <DropdownMenuLabel className="flex items-center justify-between font-normal">
                <span className="font-semibold">알림</span>
                {notifications.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                        onClick={clearAll}
                    >
                        모두 지우기
                    </Button>
                )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        <Bell className="mx-auto mb-2 h-8 w-8 opacity-20" />
                        <p>새로운 알림이 없습니다.</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <DropdownMenuItem
                            key={notification._id}
                            className={`flex cursor-pointer items-start gap-3 p-3 ${!notification.isRead ? 'bg-muted/50' : ''
                                }`}
                            onClick={() => markAsRead(notification._id)}
                        >
                            <div className="mt-0.5">
                                {notification.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {notification.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                                {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {notification.title || notification.eventName}
                                    {!notification.isRead && (
                                        <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle" />
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </p>
                                <span className="text-[10px] text-muted-foreground/60">
                                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                                </span>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </div>
        </DropdownMenuContent>
    );
}
