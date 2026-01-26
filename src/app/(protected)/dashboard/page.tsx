'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import dynamic from 'next/dynamic';

const Dashboard3D = dynamic(() => import('@/components/canvas/Dashboard3D'), { ssr: false });
const FloatingShapes = dynamic(() => import('@/components/canvas/FloatingShapes'), { ssr: false });

interface Event {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
}

interface Club {
    _id: string;
    clubName: string;
    schoolName: string;
    clubTheme: string;
    role: 'chief' | 'member';
}

interface Notification {
    _id: string;
    eventName: string;
    eventDate: string;
    daysUntil: number;
    isRead: boolean;
}

interface Participation {
    _id: string;
    eventType: 'contest' | 'forum' | 'co-research';
    eventName: string;
    eventDate: string;
    eventPlace: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface DashboardData {
    user: {
        name: string;
        email: string;
        schoolName: string;
        role: string;
    };
    clubs: Club[];
    hostedEvents: Event[];
    participations: Participation[];
    notifications: Notification[];
    stats: {
        clubCount: number;
        hostedEventCount: number;
        participationCount: number;
        pendingApprovalCount: number;
        unreadNotificationCount: number;
    };
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
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

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: '승인 대기 중', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'approved':
                return { label: '승인 완료', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'rejected':
                return { label: '참가 거절됨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            default:
                return { label: status, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        }).format(date);
    };

    const isSuperAdmin = dashboardData?.user?.role === 'superadmin';

    if (status === 'loading' || isLoading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <NavBar />
            <FloatingShapes />

            {/* Main Bento Layout */}
            <main className="bento-container container">
                <div className="bento-grid">
                    {/* 1. Welcome Card (Span 2x1) - expanded to span 3 to maximize space */}
                    <div className="bento-item welcome-card glass-card">
                        <div className="card-content">
                            <h1 className="welcome-title">안녕하세요, {session?.user?.name || '부장'}님!</h1>
                            <p className="welcome-text">오늘도 동아리와 함께 성장하는 하루 보내세요.</p>
                            <div className="welcome-actions">
                                <Link href="/schedule" className="btn btn-primary btn-pill">일정 확인</Link>
                            </div>
                        </div>
                        <div className="welcome-visual">
                            <Dashboard3D />
                        </div>
                    </div>

                    {/* 2. Stats Grid (Span 1x1) */}
                    <div className="bento-item stats-bento ios-card">
                        <div className="stats-header">
                            <h3 className="card-title">내 활동</h3>
                        </div>
                        <div className="stats-mini-grid">
                            <div className="stat-row">
                                <span className="stat-label">소속 동아리</span>
                                <span className="stat-num">{dashboardData?.stats.clubCount || 0}</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-row">
                                <span className="stat-label">참여 이벤트</span>
                                <span className="stat-num">{dashboardData?.stats.participationCount || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Quick Actions (Vertical Span 1x2) */}
                    <div className="bento-item quick-actions-bento ios-card">
                        <h3 className="card-title">바로가기</h3>
                        <div className="quick-grid">
                            <Link href="/club/register" className="action-item">
                                <div className="action-icon-box blue">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                                </div>
                                <span>동아리 등록</span>
                            </Link>
                            <Link href="/events/contest/new" className="action-item">
                                <div className="action-icon-box orange">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                                </div>
                                <span>대회 개최</span>
                            </Link>
                            <Link href="/events/forum/new" className="action-item">
                                <div className="action-icon-box green">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </div>
                                <span>포럼 개설</span>
                            </Link>
                            <Link href="/events/co-research/new" className="action-item">
                                <div className="action-icon-box purple">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                </div>
                                <span>공동연구 등록</span>
                            </Link>
                        </div>
                    </div>

                    {/* 4. My Participated Events (Span 2x2) */}
                    <div className="bento-item participations-bento ios-card">
                        <h3 className="card-title">참여 예정 이벤트</h3>
                        {dashboardData?.participations && dashboardData.participations.length > 0 ? (
                            <div className="bento-list">
                                {dashboardData.participations.slice(0, 3).map((p) => {
                                    const statusInfo = getStatusInfo(p.status);
                                    return (
                                        <div key={p._id} className="list-item">
                                            <div className="item-left">
                                                <div className="item-info">
                                                    <span className="item-name">{p.eventName}</span>
                                                    <div className="item-meta-row">
                                                        <span className="item-date">{p.eventDate ? formatDate(p.eventDate) : '-'}</span>
                                                        <span
                                                            className="status-badge-small"
                                                            style={{
                                                                color: statusInfo.color,
                                                                background: statusInfo.bg
                                                            }}
                                                        >
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`type-badge badge-${p.eventType}`}>
                                                {p.eventType === 'contest' ? '대회' : p.eventType === 'forum' ? '포럼' : '연구'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-bento">
                                <span>예정된 일정이 없습니다.</span>
                            </div>
                        )}
                    </div>

                    {/* 5. My Hosted Events (Span 1x1) */}
                    <div className="bento-item hosted-bento ios-card">
                        <h3 className="card-title">주최한 이벤트</h3>
                        {dashboardData?.hostedEvents && dashboardData.hostedEvents.length > 0 ? (
                            <div className="bento-list scrollable">
                                {dashboardData.hostedEvents.slice(0, 3).map((e) => (
                                    <div key={e._id} className="list-item-simple">
                                        <div className="item-info">
                                            <span className="item-name">{e.eventName}</span>
                                            <span className="item-date">{formatDateShort(e.eventDate)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-bento">주최한 내역이 없습니다.</div>
                        )}
                    </div>

                    {/* 6. My Clubs (Span 1x1) */}
                    <div className="bento-item clubs-bento ios-card">
                        <h3 className="card-title">내 동아리</h3>
                        {dashboardData?.clubs && dashboardData.clubs.length > 0 ? (
                            <div className="bento-list scrollable">
                                {dashboardData.clubs.map((c) => (
                                    <div key={c._id} className="list-item-simple">
                                        <span className="club-emoji">🏫</span>
                                        <span className="club-name">{c.clubName}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-bento">가입된 동아리가 없습니다.</div>
                        )}
                    </div>
                </div>
            </main >

            <style jsx>{`
                .dashboard-page {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                    color: var(--color-text-primary);
                    padding-bottom: 80px;
                }

                .bento-container {
                    padding-top: 24px;
                    position: relative;
                    z-index: 10;
                }

                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    grid-auto-rows: minmax(180px, auto);
                    gap: 20px;
                }

                .bento-item {
                    display: flex;
                    flex-direction: column;
                }

                /* Bento Spans */
                .welcome-card { grid-column: span 3; }
                .stats-bento { grid-column: span 1; }
                .quick-actions-bento { grid-column: span 1; grid-row: span 2; }
                .participations-bento { grid-column: span 2; grid-row: span 2; }
                .hosted-bento { grid-column: span 1; }
                .clubs-bento { grid-column: span 1; }

                /* Card Styles */
                .card-title {
                    font-size: 17px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: var(--color-text-primary);
                }

                /* Welcome Card */
                .welcome-card {
                    background: linear-gradient(135deg, var(--color-blue) 0%, #5AC8FA 100%);
                    color: white;
                    padding: 32px;
                    justify-content: space-between;
                    position: relative;
                    /* overflow: hidden; Removed to allow 3D pop-out */
                    border: none;
                    z-index: 5;
                }
                
                .card-content { z-index: 1; }

                .welcome-title {
                    font-size: 28px;
                    font-weight: 800;
                    margin-bottom: 8px;
                    color: white;
                }

                .welcome-text {
                    font-size: 17px;
                    opacity: 0.9;
                    margin-bottom: 24px;
                    color: rgba(255, 255, 255, 0.9);
                }

                .btn-pill {
                    background: white;
                    color: var(--color-blue);
                    padding: 10px 24px;
                    border-radius: 99px;
                    font-weight: 700;
                    text-decoration: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                }

                .btn-pill:hover {
                    transform: scale(1.05);
                }

                .welcome-visual {
                    position: absolute;
                    right: -20px;
                    bottom: -40px;
                    width: 300px;
                    height: 300px;
                    z-index: 0;
                }

                /* Stats */
                .stats-mini-grid {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    flex: 1;
                    gap: 12px;
                }

                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .stat-label { font-size: 15px; color: var(--color-text-secondary); }
                .stat-num { font-size: 20px; font-weight: 700; color: var(--color-text-primary); }
                
                .stat-divider { height: 1px; background: var(--glass-border); }

                /* Quick Actions */
                .quick-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .action-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    color: var(--color-text-primary);
                    font-weight: 500;
                    font-size: 15px;
                    transition: transform 0.2s;
                }

                .action-item:hover { transform: translateX(4px); }

                .action-icon-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .blue { background: var(--color-blue); }
                .orange { background: var(--color-orange); }
                .green { background: var(--color-green); }
                .purple { background: var(--color-purple); }

                /* Participations */
                .bento-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .list-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                    background: var(--glass-border);
                    border-radius: 12px;
                }

                .item-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .status-dot.approved { background: var(--color-green); }
                .status-dot.pending { background: var(--color-orange); }
                .status-dot.rejected { background: var(--color-red); }

                .item-info { display: flex; flex-direction: column; gap: 4px; }
                .item-name { font-weight: 600; font-size: 15px; color: var(--color-text-primary); }
                
                .item-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .item-date { font-size: 13px; color: var(--color-text-secondary); }

                .status-badge-small {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 6px;
                }

                .type-badge {
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 6px;
                }
                .badge-contest { color: var(--color-blue); background: rgba(0,122,255,0.1); }
                .badge-forum { color: var(--color-green); background: rgba(52,199,89,0.1); }
                .badge-co-research { color: var(--color-purple); background: rgba(175,82,222,0.1); }

                .list-item-simple {
                    padding: 10px 0;
                    border-bottom: 1px solid var(--glass-border);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .list-item-simple:last-child { border-bottom: none; }
                
                .club-emoji { font-size: 20px; }
                .club-name { font-weight: 600; font-size: 15px; color: var(--color-text-primary); }

                .empty-bento {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-secondary);
                    font-size: 14px;
                }

                @media (max-width: 900px) {
                    .bento-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .welcome-card { grid-column: span 2; }
                    .stats-bento { grid-column: span 1; }
                    .quick-actions-bento { grid-column: span 1; grid-row: span 1; }
                    .participations-bento { grid-column: span 2; }
                    .hosted-bento { grid-column: span 1; }
                    .clubs-bento { grid-column: span 1; }
                }

                @media (max-width: 600px) {
                    .bento-grid { grid-template-columns: 1fr; }
                    .welcome-card, .participations-bento, .stats-bento, .quick-actions-bento, .hosted-bento, .clubs-bento {
                        grid-column: span 1;
                        grid-row: auto;
                    }
                }
            `}</style>
        </div >
    );
}

function formatDateShort(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
    });
}
