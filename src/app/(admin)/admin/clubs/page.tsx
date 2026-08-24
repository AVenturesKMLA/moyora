'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Club {
    _id: string;
    clubName: string;
    clubTheme: string;
    schoolName: string;
    presidentName: string;
    presidentEmail: string;
    memberCount: number;
    createdAt: string;
}

export default function AdminClubsPage() {
    const pathname = usePathname();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        try {
            const res = await fetch('/api/admin/clubs');
            const data = await res.json();
            if (data.success) {
                setClubs(data.clubs);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Failed to fetch clubs:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteClub = async (club: Club) => {
        if (
            !confirm(
                `'${club.clubName}' 동아리를 삭제하시겠습니까?\n\n부원 명단, 가입 신청, 채팅 기록도 함께 삭제되며 되돌릴 수 없습니다.`
            )
        ) {
            return;
        }

        setDeleting(club._id);
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/clubs/${club._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setClubs((prev) => prev.filter((c) => c._id !== club._id));
                setMessage(data.message);
            } else {
                setMessage(data.message ?? '삭제에 실패했습니다');
            }
        } catch (error) {
            console.error('Failed to delete club:', error);
            setMessage('삭제 중 오류가 발생했습니다');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('ko-KR');

    const query = searchQuery.toLowerCase();
    const filteredClubs = clubs.filter(
        (club) =>
            club.clubName.toLowerCase().includes(query) ||
            club.schoolName.toLowerCase().includes(query) ||
            club.clubTheme.toLowerCase().includes(query) ||
            club.presidentName.toLowerCase().includes(query)
    );

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
                    <Link href="/admin/clubs" className={`nav-item ${pathname === '/admin/clubs' ? 'active' : ''}`}>
                        🏫 동아리 관리
                    </Link>
                    <Link href="/admin/chat" className={`nav-item ${pathname === '/admin/chat' ? 'active' : ''}`}>
                        💬 채팅 관리
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
                    <h1>동아리 관리</h1>
                    <p>개설된 동아리를 확인하고 삭제할 수 있습니다</p>
                </header>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="동아리명, 학교, 분야, 회장으로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {message && <div className="notice">{message}</div>}

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <div className="clubs-table-container">
                        <table className="clubs-table">
                            <thead>
                                <tr>
                                    <th>동아리명</th>
                                    <th>분야</th>
                                    <th>학교</th>
                                    <th>회장</th>
                                    <th>부원</th>
                                    <th>개설일</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClubs.map((club) => (
                                    <tr key={club._id}>
                                        <td className="club-name">{club.clubName}</td>
                                        <td>
                                            <span className="theme-badge">{club.clubTheme}</span>
                                        </td>
                                        <td>{club.schoolName}</td>
                                        <td>
                                            <div>{club.presidentName}</div>
                                            <div className="sub-text">{club.presidentEmail}</div>
                                        </td>
                                        <td>{club.memberCount}명</td>
                                        <td>{formatDate(club.createdAt)}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteClub(club)}
                                                disabled={deleting === club._id}
                                            >
                                                {deleting === club._id ? '...' : '삭제'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredClubs.length === 0 && (
                            <div className="no-results">
                                {clubs.length === 0 ? '개설된 동아리가 없습니다' : '검색 결과가 없습니다'}
                            </div>
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

                .search-bar input {
                    width: 100%;
                    max-width: 400px;
                    padding: 12px 16px;
                    background: #1a1f26;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    margin-bottom: 24px;
                }

                .search-bar input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .notice {
                    background: rgba(139, 92, 246, 0.15);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: #c4b5fd;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    margin-bottom: 20px;
                }

                .clubs-table-container {
                    background: #1a1f26;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow-x: auto;
                }

                .clubs-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .clubs-table th {
                    text-align: left;
                    padding: 16px 20px;
                    background: #252b35;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                .clubs-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                }

                .club-name {
                    font-weight: 600;
                    color: white;
                }

                .theme-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    white-space: nowrap;
                }

                .sub-text {
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 12px;
                    margin-top: 2px;
                }

                .delete-btn {
                    padding: 6px 14px;
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 6px;
                    color: #ef4444;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .delete-btn:hover:not(:disabled) {
                    background: rgba(239, 68, 68, 0.3);
                }

                .delete-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .no-results {
                    padding: 60px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.4);
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
                    .admin-page { flex-direction: column; }
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
                    .sidebar-footer { display: none; }
                    .admin-main { padding: 20px; }
                }
            `}</style>
        </div>
    );
}
