'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Event {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
    hostName: string;
    hostEmail: string;
    createdAt: string;
}

export default function AdminEventsPage() {
    const pathname = usePathname();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/events');
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (eventType: string, eventId: string) => {
        if (!confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
            return;
        }

        setDeleting(eventId);
        try {
            const res = await fetch(`/api/admin/events/${eventType}/${eventId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setEvents((prev) => prev.filter((e) => e._id !== eventId));
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
        } finally {
            setDeleting(null);
        }
    };

    const getEventTypeInfo = (type: string) => {
        switch (type) {
            case 'contest':
                return { label: '대회', color: '#3b82f6' };
            case 'forum':
                return { label: '포럼', color: '#10b981' };
            case 'co-research':
                return { label: '공동연구', color: '#8b5cf6' };
            default:
                return { label: type, color: '#6b7280' };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const filteredEvents = filter === 'all'
        ? events
        : events.filter((e) => e.eventType === filter);

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Link href="/dashboard" className="logo">🎓 모여라</Link>
                    <span className="admin-badge">관리자</span>
                </div>
                <nav className="sidebar-nav">
                    <Link href="/admin" className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}>
                        📊 대시보드
                    </Link>
                    <Link href="/admin/users" className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`}>
                        👥 사용자 관리
                    </Link>
                    <Link href="/admin/events" className={`nav-item ${pathname === '/admin/events' ? 'active' : ''}`}>
                        📅 이벤트 관리
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <Link href="/dashboard" className="back-link">← 일반 대시보드로</Link>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>이벤트 관리</h1>
                    <p>플랫폼 전체 이벤트를 관리하세요</p>
                </header>

                <div className="filter-bar">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">전체</option>
                        <option value="contest">대회</option>
                        <option value="forum">포럼</option>
                        <option value="co-research">공동연구</option>
                    </select>
                    <span className="count">{filteredEvents.length}개 이벤트</span>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <div className="events-grid">
                        {filteredEvents.map((event) => {
                            const typeInfo = getEventTypeInfo(event.eventType);
                            return (
                                <div key={event._id} className="event-card">
                                    <div className="event-header">
                                        <span
                                            className="event-type-badge"
                                            style={{ backgroundColor: typeInfo.color }}
                                        >
                                            {typeInfo.label}
                                        </span>
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteEvent(event.eventType, event._id)}
                                            disabled={deleting === event._id}
                                        >
                                            {deleting === event._id ? '...' : '🗑'}
                                        </button>
                                    </div>
                                    <h3 className="event-name">{event.eventName}</h3>
                                    <div className="event-details">
                                        <p>📅 {formatDate(event.eventDate)}</p>
                                        <p>📍 {event.eventPlace}</p>
                                        <p>👤 {event.hostName}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredEvents.length === 0 && (
                            <div className="no-events">이벤트가 없습니다</div>
                        )}
                    </div>
                )}
            </main>

            <style>{`
                .admin-page {
                    display: flex;
                    min-height: 100vh;
                    background: #0f1419;
                }

                .admin-sidebar {
                    width: 260px;
                    background: #1a1f26;
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                }

                .sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                }

                .logo {
                    font-size: 20px;
                    font-weight: 700;
                    color: white;
                    text-decoration: none;
                }

                .admin-badge {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 6px;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }

                .nav-item {
                    padding: 12px 16px;
                    border-radius: 10px;
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .nav-item:hover { background: rgba(255, 255, 255, 0.05); color: white; }
                .nav-item.active { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }

                .sidebar-footer {
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .back-link {
                    color: rgba(255, 255, 255, 0.5);
                    text-decoration: none;
                    font-size: 14px;
                }

                .admin-main {
                    flex: 1;
                    padding: 32px 40px;
                    overflow-y: auto;
                }

                .admin-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 8px;
                }

                .admin-header p {
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0 0 24px;
                }

                .filter-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .filter-bar select {
                    padding: 10px 16px;
                    background: #1a1f26;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                }

                .count {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }

                .events-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }

                .event-card {
                    background: #1a1f26;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 20px;
                }

                .event-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .event-type-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: white;
                }

                .delete-btn {
                    width: 32px;
                    height: 32px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .delete-btn:hover:not(:disabled) {
                    background: rgba(239, 68, 68, 0.2);
                }

                .event-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    margin: 0 0 12px;
                    line-height: 1.4;
                }

                .event-details {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .event-details p {
                    margin: 0;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .no-events {
                    grid-column: 1 / -1;
                    padding: 60px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.5);
                }

                .loading {
                    display: flex;
                    justify-content: center;
                    padding: 80px;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: #8b5cf6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
