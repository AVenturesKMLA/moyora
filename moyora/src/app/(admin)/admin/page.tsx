'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Stats {
    totalUsers: number;
    totalEvents: number;
    totalClubs: number;
    totalParticipants: number;
    pendingParticipants: number;
}

export default function AdminDashboard() {
    const pathname = usePathname();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Link href="/dashboard" className="logo">
                        🎓 모여라
                    </Link>
                    <span className="admin-badge">관리자</span>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        href="/admin"
                        className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
                    >
                        📊 대시보드
                    </Link>
                    <Link
                        href="/admin/users"
                        className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`}
                    >
                        👥 사용자 관리
                    </Link>
                    <Link
                        href="/admin/events"
                        className={`nav-item ${pathname === '/admin/events' ? 'active' : ''}`}
                    >
                        📅 이벤트 관리
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link href="/dashboard" className="back-link">
                        ← 일반 대시보드로
                    </Link>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>관리자 대시보드</h1>
                    <p>플랫폼 전체 현황을 확인하세요</p>
                </header>

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <div className="stats-grid">
                        <div className="stat-card users">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.totalUsers || 0}</div>
                                <div className="stat-label">전체 사용자</div>
                            </div>
                            <Link href="/admin/users" className="stat-link">관리 →</Link>
                        </div>

                        <div className="stat-card events">
                            <div className="stat-icon">📅</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.totalEvents || 0}</div>
                                <div className="stat-label">전체 이벤트</div>
                            </div>
                            <Link href="/admin/events" className="stat-link">관리 →</Link>
                        </div>

                        <div className="stat-card clubs">
                            <div className="stat-icon">🏫</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.totalClubs || 0}</div>
                                <div className="stat-label">등록된 동아리</div>
                            </div>
                        </div>

                        <div className="stat-card participants">
                            <div className="stat-icon">🎫</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.totalParticipants || 0}</div>
                                <div className="stat-label">참가 신청</div>
                            </div>
                        </div>

                        <div className="stat-card pending highlight">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.pendingParticipants || 0}</div>
                                <div className="stat-label">승인 대기</div>
                            </div>
                        </div>
                    </div>
                )}

                <section className="quick-actions-section">
                    <h2>빠른 작업</h2>
                    <div className="quick-actions">
                        <Link href="/admin/users" className="action-card">
                            <span className="action-icon">👥</span>
                            <span className="action-label">사용자 관리</span>
                        </Link>
                        <Link href="/admin/events" className="action-card">
                            <span className="action-icon">📅</span>
                            <span className="action-label">이벤트 관리</span>
                        </Link>
                        <Link href="/schedule" className="action-card">
                            <span className="action-icon">🗓️</span>
                            <span className="action-label">일정 보기</span>
                        </Link>
                    </div>
                </section>
            </main>

            <style jsx>{`
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
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 10px;
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .nav-item.active {
                    background: rgba(139, 92, 246, 0.2);
                    color: #a78bfa;
                }

                .sidebar-footer {
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .back-link {
                    color: rgba(255, 255, 255, 0.5);
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: white;
                }

                .admin-main {
                    flex: 1;
                    padding: 32px 40px;
                    overflow-y: auto;
                }

                .admin-header {
                    margin-bottom: 32px;
                }

                .admin-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 8px;
                }

                .admin-header p {
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }

                .stat-card {
                    background: #1a1f26;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .stat-card.highlight {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2));
                    border-color: rgba(245, 158, 11, 0.3);
                }

                .stat-icon {
                    font-size: 32px;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-value {
                    font-size: 36px;
                    font-weight: 700;
                    color: white;
                }

                .stat-label {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-top: 4px;
                }

                .stat-link {
                    color: #a78bfa;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    align-self: flex-start;
                }

                .stat-link:hover {
                    text-decoration: underline;
                }

                .quick-actions-section h2 {
                    font-size: 20px;
                    font-weight: 600;
                    color: white;
                    margin: 0 0 20px;
                }

                .quick-actions {
                    display: flex;
                    gap: 16px;
                }

                .action-card {
                    background: #1a1f26;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 20px 32px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .action-card:hover {
                    background: #252b35;
                    transform: translateY(-2px);
                }

                .action-icon {
                    font-size: 24px;
                }

                .action-label {
                    color: white;
                    font-weight: 500;
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

                @media (max-width: 768px) {
                    .admin-page {
                        flex-direction: column;
                    }

                    .admin-sidebar {
                        width: 100%;
                        flex-direction: row;
                        padding: 16px;
                    }

                    .sidebar-nav {
                        flex-direction: row;
                        flex: 1;
                        justify-content: center;
                    }

                    .sidebar-footer {
                        display: none;
                    }

                    .admin-main {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
