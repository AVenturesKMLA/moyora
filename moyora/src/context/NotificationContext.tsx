'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
    _id: string; // MongoDB uses _id
    title?: string; // Optional if backend returns eventName as title logic or we map it
    eventName?: string; // Backend returns this
    message?: string; // We might need to construct this from eventName/type
    type?: 'info' | 'success' | 'warning'; // Backend doesn't strictly return type yet, might need mapping
    eventType?: 'contest' | 'forum' | 'co-research';
    createdAt?: string;
    isRead: boolean;
}

// Helper to map backend data to UI format locally if needed
// or just use the backend shape directly.
// Backend returns: { _id, eventName, eventType, daysUntil, isRead, ... }

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchNotifications();
            return;
        }

        if (status === 'unauthenticated') {
            setNotifications([]);
        }
    }, [status]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n._id === id ? { ...n, isRead: true } : n
        ));

        try {
            // In a real app, we'd have a PUT/PATCH endpoint here
            // await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
