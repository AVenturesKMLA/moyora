'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '@/components/NavBar';

const FloatingShapes = dynamic(() => import('@/components/canvas/FloatingShapes'), { ssr: false });
const Manage3D = dynamic(() => import('@/components/canvas/Manage3D'), { ssr: false });

interface Event {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
    participantCount: number;
}

interface Participant {
    _id: string;
    userName: string;
    userEmail: string;
    userSchool: string;
    clubName: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function EventManagePage() {
    const { data: session, status } = useSession();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchMyEvents();
        }
    }, [status]);

    const fetchMyEvents = async () => {
        try {
            const res = await fetch('/api/events/my-events');
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

    const fetchParticipants = useCallback(async (event: Event) => {
        setLoadingParticipants(true);
        setSelectedEvent(event);
        try {
            const res = await fetch(`/api/events/${event.eventType}/${event._id}/participants`);
            const data = await res.json();
            if (data.success) {
                setParticipants(data.participants);
            }
        } catch (error) {
            console.error('Failed to fetch participants:', error);
        } finally {
            setLoadingParticipants(false);
        }
    }, []);

    const updateParticipantStatus = async (participantId: string, newStatus: 'approved' | 'rejected') => {
        setUpdating(participantId);
        try {
            const res = await fetch(`/api/participate/${participantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setParticipants((prev) =>
                    prev.map((p) =>
                        p._id === participantId ? { ...p, status: newStatus } : p
                    )
                );
                // Update event participant count display
                if (selectedEvent) {
                    fetchMyEvents();
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'contest': return '대회';
            case 'forum': return '포럼';
            case 'co-research': return '공동연구';
            default: return type;
        }
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'contest': return 'var(--accent-blue)';
            case 'forum': return 'var(--accent-green)';
            case 'co-research': return 'var(--accent-purple)';
            default: return 'var(--primary)';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge pending">대기중</span>;
            case 'approved':
                return <span className="status-badge approved">승인됨</span>;
            case 'rejected':
                return <span className="status-badge rejected">거절됨</span>;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const filteredEvents = filter === 'all'
        ? events
        : events.filter((e) => e.eventType === filter);

    if (status === 'loading' || loading) {
        return (
            <div className="page-container">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="manage-page">
            <NavBar />
            <FloatingShapes />

            <nav className="manage-nav container">
                <Link href="/dashboard" className="back-link">
                    ← 대시보드로 돌아가기
                </Link>
                <h1>이벤트 관리</h1>
            </nav>

            <div className="manage-layout container">
                {/* Events List */}
                <aside className="events-sidebar glass-card">
                    <Manage3D />
                    <div className="sidebar-header">
                        <h2>내 이벤트</h2>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">전체</option>
                            <option value="contest">대회</option>
                            <option value="forum">포럼</option>
                            <option value="co-research">공동연구</option>
                        </select>
                    </div>

                    <div className="events-list">
                        {filteredEvents.length === 0 ? (
                            <p className="no-events">등록한 이벤트가 없습니다</p>
                        ) : (
                            filteredEvents.map((event) => (
                                <button
                                    key={event._id}
                                    className={`event-card ${selectedEvent?._id === event._id ? 'selected' : ''}`}
                                    onClick={() => fetchParticipants(event)}
                                >
                                    <span
                                        className="event-type-badge"
                                        style={{ backgroundColor: getEventTypeColor(event.eventType) }}
                                    >
                                        {getEventTypeLabel(event.eventType)}
                                    </span>
                                    <h3>{event.eventName}</h3>
                                    <p className="event-date">{formatDate(event.eventDate)}</p>
                                    <div className="participant-count">
                                        <span>👥</span>
                                        {event.participantCount}명 참가 신청
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Participants Panel */}
                <main className="participants-panel glass-card">
                    {!selectedEvent ? (
                        <div className="no-selection">
                            <div className="placeholder-icon">📋</div>
                            <p>왼쪽에서 이벤트를 선택하여</p>
                            <p>참가 신청을 관리하세요</p>
                        </div>
                    ) : loadingParticipants ? (
                        <div className="loading-spinner" />
                    ) : (
                        <>
                            <div className="panel-header">
                                <h2>{selectedEvent.eventName}</h2>
                                <p className="event-info">
                                    {formatDate(selectedEvent.eventDate)} • {selectedEvent.eventPlace}
                                </p>
                            </div>

                            <div className="participants-stats">
                                <div className="stat">
                                    <span className="stat-value">{participants.length}</span>
                                    <span className="stat-label">전체</span>
                                </div>
                                <div className="stat pending">
                                    <span className="stat-value">
                                        {participants.filter((p) => p.status === 'pending').length}
                                    </span>
                                    <span className="stat-label">대기중</span>
                                </div>
                                <div className="stat approved">
                                    <span className="stat-value">
                                        {participants.filter((p) => p.status === 'approved').length}
                                    </span>
                                    <span className="stat-label">승인됨</span>
                                </div>
                                <div className="stat rejected">
                                    <span className="stat-value">
                                        {participants.filter((p) => p.status === 'rejected').length}
                                    </span>
                                    <span className="stat-label">거절됨</span>
                                </div>
                            </div>

                            <div className="participants-list">
                                {participants.length === 0 ? (
                                    <p className="no-participants">아직 참가 신청이 없습니다</p>
                                ) : (
                                    participants.map((participant) => (
                                        <div key={participant._id} className="participant-card">
                                            <div className="participant-info">
                                                <div className="participant-header">
                                                    <h4>{participant.userName}</h4>
                                                    {getStatusBadge(participant.status)}
                                                </div>
                                                <p className="participant-school">
                                                    {participant.userSchool}
                                                    {participant.clubName && ` • ${participant.clubName}`}
                                                </p>
                                                <p className="participant-email">{participant.userEmail}</p>
                                                {participant.message && (
                                                    <p className="participant-message">"{participant.message}"</p>
                                                )}
                                                <p className="participant-date">
                                                    신청일: {formatDate(participant.createdAt)}
                                                </p>
                                            </div>
                                            <div className="participant-actions">
                                                {participant.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn-approve"
                                                            onClick={() => updateParticipantStatus(participant._id, 'approved')}
                                                            disabled={updating === participant._id}
                                                        >
                                                            {updating === participant._id ? '...' : '승인'}
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => updateParticipantStatus(participant._id, 'rejected')}
                                                            disabled={updating === participant._id}
                                                        >
                                                            {updating === participant._id ? '...' : '거절'}
                                                        </button>
                                                    </>
                                                )}
                                                {participant.status === 'approved' && (
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => updateParticipantStatus(participant._id, 'rejected')}
                                                        disabled={updating === participant._id}
                                                    >
                                                        {updating === participant._id ? '...' : '취소'}
                                                    </button>
                                                )}
                                                {participant.status === 'rejected' && (
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => updateParticipantStatus(participant._id, 'approved')}
                                                        disabled={updating === participant._id}
                                                    >
                                                        {updating === participant._id ? '...' : '재승인'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            <style jsx>{`
                .manage-page {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                    color: var(--color-text-primary);
                    padding-bottom: 60px;
                }

                .manage-nav {
                    padding: 40px 0 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    position: relative;
                    z-index: 10;
                }

                .back-link {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: var(--primary);
                }

                .manage-nav h1 {
                    font-size: 24px;
                    color: var(--text-primary);
                }

                .manage-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 24px;
                    min-height: calc(100vh - 200px);
                    position: relative;
                    z-index: 10;
                }

                .events-sidebar {
                    padding: 20px;
                    height: fit-content;
                    max-height: calc(100vh - 140px);
                    overflow-y: auto;
                    position: sticky;
                    top: 100px;
                }

                .sidebar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .sidebar-header h2 {
                    font-size: 18px;
                    color: var(--text-primary);
                }

                .filter-select {
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .events-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .event-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    width: 100%;
                }

                .event-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateX(4px);
                }

                .event-card.selected {
                    border-color: var(--primary);
                    background: rgba(45, 90, 39, 0.2);
                }

                .event-type-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: white;
                    margin-bottom: 8px;
                }

                .event-card h3 {
                    font-size: 14px;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                    line-height: 1.4;
                }

                .event-date {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                }

                .participant-count {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: var(--primary);
                    font-weight: 500;
                }

                .participants-panel {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    padding: 24px;
                    min-height: 500px;
                }

                .no-selection {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                    color: var(--text-muted);
                    text-align: center;
                }

                .placeholder-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .panel-header {
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--glass-border);
                }

                .panel-header h2 {
                    font-size: 20px;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .event-info {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .participants-stats {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 16px 24px;
                    text-align: center;
                    flex: 1;
                }

                .stat-value {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .stat.pending .stat-value { color: #f59e0b; }
                .stat.approved .stat-value { color: #10b981; }
                .stat.rejected .stat-value { color: #ef4444; }

                .participants-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .participant-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                }

                .participant-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }

                .participant-header h4 {
                    font-size: 16px;
                    color: var(--text-primary);
                }

                .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .status-badge.pending {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }

                .status-badge.approved {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }

                .status-badge.rejected {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .participant-school {
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .participant-email {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .participant-message {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-style: italic;
                    margin-top: 8px;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 6px;
                }

                .participant-date {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-top: 8px;
                }

                .participant-actions {
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .btn-approve, .btn-reject {
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-approve {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .btn-approve:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                }

                .btn-reject {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                }

                .btn-reject:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                }

                .btn-approve:disabled, .btn-reject:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .no-events, .no-participants {
                    text-align: center;
                    color: var(--text-muted);
                    padding: 40px;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--glass-border);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 100px auto;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 900px) {
                    .manage-layout {
                        grid-template-columns: 1fr;
                    }

                    .events-sidebar {
                        max-height: 300px;
                    }
                }
            `}</style>
        </div>
    );
}
