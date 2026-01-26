'use client';

import { useNotifications } from '@/context/NotificationContext';
import { useEffect, useRef } from 'react';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const { notifications, markAsRead, clearAll } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="notification-dropdown glass-card anim-scale-in" ref={dropdownRef}>
            <div className="dropdown-header">
                <h3>알림</h3>
                {notifications.length > 0 && (
                    <button onClick={clearAll} className="clear-btn">모두 지우기</button>
                )}
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <p>새로운 알림이 없습니다.</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="notification-icon">
                                {notification.type === 'success' && '✅'}
                                {notification.type === 'info' && '📢'}
                                {notification.type === 'warning' && '⏰'}
                            </div>
                            <div className="notification-content">
                                <p className="notif-title">{notification.title}</p>
                                <p className="notif-message">{notification.message}</p>
                                <span className="notif-time">{notification.timestamp}</span>
                            </div>
                            {!notification.isRead && <div className="unread-dot"></div>}
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .notification-dropdown {
                    position: absolute;
                    top: 60px;
                    right: 0;
                    width: 360px;
                    max-height: 480px;
                    overflow-y: auto;
                    border-radius: 24px;
                    z-index: 1001;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                }

                .dropdown-header {
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .dropdown-header h3 {
                    margin: 0;
                    font-size: 17px;
                    font-weight: 700;
                }

                .clear-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    font-size: 13px;
                    cursor: pointer;
                }
                .clear-btn:hover { color: var(--color-text-primary); }

                .notification-list {
                    padding: 8px;
                }

                .notification-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                    position: relative;
                }

                .notification-item:hover {
                    background: rgba(0,0,0,0.05);
                }

                .notification-item.unread {
                    background: rgba(31, 78, 245, 0.05);
                }

                .notification-icon {
                    font-size: 20px;
                    padding-top: 2px;
                }

                .notification-content {
                    flex: 1;
                }

                .notif-title {
                    font-size: 15px;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                    color: var(--color-text-primary);
                }

                .notif-message {
                    font-size: 13px;
                    color: var(--color-text-secondary);
                    margin: 0 0 4px 0;
                    line-height: 1.4;
                }

                .notif-time {
                    font-size: 11px;
                    color: var(--color-text-tertiary);
                }

                .unread-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--color-red);
                    position: absolute;
                    top: 16px;
                    right: 16px;
                }

                .empty-state {
                    padding: 40px;
                    text-align: center;
                    color: var(--color-text-secondary);
                    font-size: 14px;
                }

                .anim-scale-in {
                    animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    transform-origin: top right;
                }

                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
