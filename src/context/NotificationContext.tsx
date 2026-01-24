'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    timestamp: string;
    isRead: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: '대회 승인 완료',
        message: '신청하신 "전국 고교 해커톤" 참가가 승인되었습니다.',
        type: 'success',
        timestamp: '방금 전',
        isRead: false
    },
    {
        id: '2',
        title: '새로운 메시지',
        message: '과학동아리 연합에서 새로운 공지가 등록되었습니다.',
        type: 'info',
        timestamp: '1시간 전',
        isRead: false
    },
    {
        id: '3',
        title: '신청 마감 임박',
        message: '관심 등록한 "환경 포럼" 신청이 내일 마감됩니다.',
        type: 'warning',
        timestamp: '2시간 전',
        isRead: false
    }
];

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Load mock data on mount
        setNotifications(MOCK_NOTIFICATIONS);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
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
