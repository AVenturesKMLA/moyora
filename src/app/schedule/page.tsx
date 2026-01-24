'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';

const FloatingShapes = dynamic(() => import('@/components/canvas/FloatingShapes'), { ssr: false });
const Schedule3D = dynamic(() => import('@/components/canvas/Schedule3D'), { ssr: false });

interface Event {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventId: string;
    eventName: string;
    eventDate: string;
    eventPlace: string;
    description?: string;
}

interface EventDetail {
    _id: string;
    contestName?: string;
    forumName?: string;
    researchName?: string;
    contestType?: string;
    forumType?: string;
    researchType?: string;
    contestDate?: string;
    forumDate?: string;
    researchDate?: string;
    contestPlace?: string;
    forumPlace?: string;
    researchPlace?: string;
    description?: string;
    notices?: string;
    hostName?: string;
    hostPhone?: string;
    enteringClubs?: string[];
    forumClubs?: string[];
    joiningClubs?: string[];
}

export default function SchedulePage() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isParticipating, setIsParticipating] = useState(false);
    const [participationMessage, setParticipationMessage] = useState('');
    const [hasParticipated, setHasParticipated] = useState(false);
    const [participationStatus, setParticipationStatus] = useState<string | null>(null);

    const [showTemporarySuccess, setShowTemporarySuccess] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const url = filter === 'all' ? '/api/schedule' : `/api/schedule?type=${filter}`;
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data.events || []);
                }
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [filter]);

    const openEventDetail = async (event: Event) => {
        setSelectedEvent(event);
        setIsDetailLoading(true);
        setEventDetail(null);
        setHasParticipated(false);
        setParticipationStatus(null);
        setShowTemporarySuccess(false);

        try {
            // Fetch event details
            const response = await fetch(`/api/events/${event.eventType}/${event.eventId}`);
            if (response.ok) {
                const data = await response.json();
                setEventDetail(data.event);
            }

            // Check if user has already participated
            if (session?.user) {
                const participationRes = await fetch(`/api/participate?eventType=${event.eventType}&eventId=${event.eventId}`);
                if (participationRes.ok) {
                    const participationData = await participationRes.json();
                    setHasParticipated(participationData.hasParticipated);
                    setParticipationStatus(participationData.status);
                }
            }
        } catch (error) {
            console.error('Failed to fetch event details:', error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const closeEventDetail = () => {
        setSelectedEvent(null);
        setEventDetail(null);
        setParticipationMessage('');
        setShowTemporarySuccess(false);
    };

    const handleParticipate = async () => {
        if (!session?.user || !selectedEvent) return;

        setIsParticipating(true);
        try {
            const response = await fetch('/api/participate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: selectedEvent.eventType,
                    eventId: selectedEvent.eventId,
                    message: participationMessage,
                }),
            });

            if (response.ok) {
                setHasParticipated(true);
                setParticipationStatus('pending');
                setParticipationMessage('');
                setShowTemporarySuccess(true);
                setTimeout(() => setShowTemporarySuccess(false), 1500);
            }
        } catch (error) {
            console.error('Failed to participate:', error);
        } finally {
            setIsParticipating(false);
        }
    };

    const getEventTypeInfo = (type: string) => {
        switch (type) {
            case 'contest': return {
                label: '대회', class: 'contest', icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                    </svg>
                )
            };
            case 'forum': return {
                label: '포럼', class: 'forum', icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )
            };
            case 'co-research': return {
                label: '공동연구', class: 'research', icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 18h8" /><path d="M3 22h18" /><path d="M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2" /><path d="M9 12a2 2 0 1 0-4 0v6a2 2 0 1 0 4 0v-2" />
                    </svg>
                )
            };
            default: return { label: type, class: '', icon: null };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(date);
    };

    const getDaysUntil = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '내일';
        if (diffDays < 0) return '종료됨';
        return `D-${diffDays}`;
    };

    const getStatusText = (status: string | null) => {
        switch (status) {
            case 'pending': return '승인 대기 중';
            case 'approved': return '승인 완료';
            case 'rejected': return '참가 거절됨';
            default: return '';
        }
    };

    return (
        <div className="schedule-page">
            <NavBar />
            <FloatingShapes />

            <main className="schedule-main">
                <div className="container">
                    <div className="page-header">
                        <Schedule3D />
                        <h1 className="page-title">📅 일정 탐색</h1>
                        <p className="page-subtitle">전국의 모든 동아리 이벤트를 한눈에 확인하세요</p>
                    </div>

                    <div className="filters-container">
                        <div className="filters-pill glass-card">
                            {['all', 'contest', 'forum', 'co-research'].map((f) => (
                                <button
                                    key={f}
                                    className={`filter-item ${filter === f ? 'active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === 'all' ? '전체' : getEventTypeInfo(f).label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>일정을 가져오는 중입니다...</p>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="events-grid">
                            {events.map((event) => {
                                const typeInfo = getEventTypeInfo(event.eventType);
                                const daysUntil = getDaysUntil(event.eventDate);
                                return (
                                    <div
                                        key={event._id}
                                        className="event-card-apple glass-card"
                                        onClick={() => openEventDetail(event)}
                                    >
                                        <div className="card-top">
                                            <div className={`type-icon-box ${typeInfo.class}`}>
                                                {typeInfo.icon}
                                            </div>
                                            <span className={`d-day-tag ${daysUntil === '오늘' || daysUntil === '내일' ? 'urgent' : ''}`}>
                                                {daysUntil}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <h3 className="event-name">{event.eventName}</h3>
                                            <div className="event-meta">
                                                <div className="meta-row">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    <span>{formatDate(event.eventDate)}</span>
                                                </div>
                                                <div className="meta-row">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                    <span>{event.eventPlace}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <span className="detail-btn">자세히 보기</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state-apple glass-card">
                            <div className="empty-icon">📂</div>
                            <h2>등록된 일정이 없습니다</h2>
                            <p>선택한 카테고리에 해당하는 이벤트가 아직 없습니다.</p>
                            <Link href="/dashboard" className="btn-apple primary">대시보드로 돌아가기</Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="modal-wrapper" onClick={closeEventDetail}>
                    <div className="modal-island glass-card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeEventDetail}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        {isDetailLoading ? (
                            <div className="modal-loading">
                                <div className="spinner"></div>
                            </div>
                        ) : eventDetail ? (
                            <div className="modal-content-inner">
                                <div className="modal-header">
                                    <div className={`type-tag-large ${getEventTypeInfo(selectedEvent.eventType).class}`}>
                                        {getEventTypeInfo(selectedEvent.eventType).icon}
                                        <span>{getEventTypeInfo(selectedEvent.eventType).label}</span>
                                    </div>
                                    <h2 className="modal-title">{selectedEvent.eventName}</h2>
                                </div>

                                <div className="modal-scroll-area">
                                    <div className="info-grid">
                                        <div className="info-box">
                                            <span className="label">일시</span>
                                            <span className="value">{formatDate(selectedEvent.eventDate)}</span>
                                        </div>
                                        <div className="info-box">
                                            <span className="label">장소</span>
                                            <span className="value">{selectedEvent.eventPlace}</span>
                                        </div>
                                        <div className="info-box">
                                            <span className="label">주최</span>
                                            <span className="value">{eventDetail.hostName || '-'}</span>
                                        </div>
                                        <div className="info-box">
                                            <span className="label">연락처</span>
                                            <span className="value">{eventDetail.hostPhone || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="text-section">
                                        <h3>상세 내용</h3>
                                        <p>{eventDetail.description || '상세 내용이 없습니다.'}</p>
                                    </div>

                                    {eventDetail.notices && (
                                        <div className="text-section">
                                            <h3>공지사항</h3>
                                            <p>{eventDetail.notices}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-actions">
                                    {!session ? (
                                        <Link href="/login" className="btn-long primary">로그인하고 참가하기</Link>
                                    ) : hasParticipated ? (
                                        <div className="already-joined">
                                            <div className={`status-pill-big ${participationStatus}`}>
                                                {showTemporarySuccess ? '신청 완료' : getStatusText(participationStatus)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="join-form">
                                            <textarea
                                                className="apple-input"
                                                placeholder="참가 신청 메시지를 남겨보세요 (선택사항)"
                                                value={participationMessage}
                                                onChange={(e) => setParticipationMessage(e.target.value)}
                                            />
                                            <button
                                                className={`btn-long primary ${isParticipating ? 'loading' : ''}`}
                                                onClick={handleParticipate}
                                                disabled={isParticipating}
                                            >
                                                {isParticipating ? '신청 중...' : '참가 신청하기'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="modal-error">정보를 불러올 수 없습니다.</div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .schedule-page {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                    color: var(--color-text-primary);
                }

                .schedule-main {
                    padding: 40px 0 80px;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .page-title {
                    font-size: 34px;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin-bottom: 12px;
                    letter-spacing: -0.02em;
                }

                .page-subtitle {
                    color: var(--color-text-secondary);
                    font-size: 17px;
                }

                /* Filters Redesign */
                .filters-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 48px;
                }

                .filters-pill {
                    display: flex;
                    padding: 4px;
                    background: var(--glass-border);
                    border-radius: 12px;
                    gap: 2px;
                }

                .filter-item {
                    padding: 8px 24px;
                    border: none;
                    background: none;
                    border-radius: 99px;
                    font-size: 15px;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-item:hover {
                    color: var(--color-text-primary);
                }

                .filter-item.active {
                    background: var(--color-card);
                    color: var(--color-text-primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    font-weight: 700;
                }

                /* Events Grid */
                .events-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }

                .event-card-apple {
                    padding: 24px;
                    display: flex;
                    cursor: pointer;
                    flex-direction: column;
                    background: var(--color-card);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                }

                .event-card-apple:hover {
                    transform: scale(1.02);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                    border-color: var(--color-blue);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .type-icon-box {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .type-icon-box.contest { background: rgba(52, 199, 89, 0.1); color: var(--color-green); }
                .type-icon-box.forum { background: rgba(0, 122, 255, 0.1); color: var(--color-blue); }
                .type-icon-box.research { background: rgba(175, 82, 222, 0.1); color: var(--color-purple); }

                .d-day-tag {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-green);
                    background: rgba(52, 199, 89, 0.1);
                    padding: 4px 10px;
                    border-radius: 99px;
                }

                .d-day-tag.urgent {
                    color: var(--color-red);
                    background: rgba(255, 59, 48, 0.1);
                }

                .event-name {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    margin-bottom: 12px;
                    letter-spacing: -0.01em;
                }

                .event-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .meta-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 15px;
                    color: var(--color-text-secondary);
                }

                .card-footer {
                    margin-top: auto;
                    padding-top: 20px;
                }

                .detail-btn {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--color-blue);
                }

                /* Modal Island */
                .modal-wrapper {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 24px;
                }

                .modal-island {
                    width: 100%;
                    max-width: 520px;
                    background: var(--color-card);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 32px;
                    padding: 32px;
                    position: relative;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }

                .close-btn {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    background: var(--glass-border);
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .close-btn:hover {
                    background: rgba(118, 118, 128, 0.24);
                }

                .modal-header {
                    margin-bottom: 32px;
                }

                .type-tag-large {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 15px;
                    margin-bottom: 12px;
                }

                .type-tag-large.contest { color: var(--color-green); }
                .type-tag-large.forum { color: var(--color-blue); }
                .type-tag-large.research { color: var(--color-purple); }

                .modal-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    line-height: 1.2;
                }

                .modal-scroll-area {
                    overflow-y: auto;
                    padding-right: 8px;
                    margin-bottom: 32px;
                }

                .modal-scroll-area::-webkit-scrollbar { width: 4px; }
                .modal-scroll-area::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .info-box {
                    background: var(--color-bg);
                    padding: 16px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-box .label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    text-transform: uppercase;
                }

                .info-box .value {
                    font-size: 17px;
                    font-weight: 600;
                    color: var(--color-text-primary);
                }

                .text-section {
                    margin-bottom: 24px;
                }

                .text-section h3 {
                    font-size: 17px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--color-text-primary);
                }

                .text-section p {
                    font-size: 17px;
                    color: var(--color-text-secondary);
                    line-height: 1.6;
                }

                .btn-long {
                    width: 100%;
                    background: var(--color-blue);
                    color: #fff;
                    padding: 16px;
                    border: none;
                    border-radius: 16px;
                    font-size: 17px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                    text-decoration: none;
                    display: block;
                }

                .btn-long:active {
                    transform: scale(0.98);
                    opacity: 0.9;
                }

                .apple-input {
                    width: 100%;
                    padding: 16px;
                    border-radius: 16px;
                    border: 1px solid var(--glass-border);
                    background: var(--color-bg);
                    color: var(--color-text-primary);
                    margin-bottom: 16px;
                    font-family: inherit;
                    font-size: 17px;
                    resize: none;
                    height: 80px;
                }
                
                .apple-input:focus {
                    outline: none;
                    border-color: var(--color-blue);
                    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
                }

                .status-pill-big {
                    width: 100%;
                    padding: 16px;
                    text-align: center;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 17px;
                }

                .status-pill-big.approved { background: rgba(52, 199, 89, 0.1); color: var(--color-green); }
                .status-pill-big.pending { background: rgba(255, 149, 0, 0.1); color: var(--color-orange); }

                .empty-state-apple {
                    grid-column: span 3;
                    text-align: center;
                    padding: 60px 20px;
                    background: var(--color-card);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                }
                
                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }

                @media (max-width: 1000px) {
                    .events-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 600px) {
                    .events-grid { grid-template-columns: 1fr; }
                    .page-title { font-size: 28px; }
                    .info-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
