'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    schoolName: string;
    role: 'user' | 'admin' | 'superadmin';
    createdAt: string;
}

export default function AdminUsersPage() {
    const pathname = usePathname();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        setDeleting(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setUsers((prev) => prev.filter((u) => u._id !== userId));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin':
                return { label: '슈퍼관리자', color: '#8b5cf6' };
            case 'admin':
                return { label: '관리자', color: '#3b82f6' };
            default:
                return { label: '일반', color: '#6b7280' };
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1>사용자 관리</h1>
                    <p>플랫폼 사용자를 관리하세요</p>
                </header>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="이름, 이메일, 학교로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>이메일</th>
                                    <th>학교</th>
                                    <th>역할</th>
                                    <th>가입일</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
                                    const roleBadge = getRoleBadge(user.role);
                                    return (
                                        <tr key={user._id}>
                                            <td className="user-name">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.schoolName}</td>
                                            <td>
                                                <span
                                                    className="role-badge"
                                                    style={{ backgroundColor: `${roleBadge.color}33`, color: roleBadge.color }}
                                                >
                                                    {roleBadge.label}
                                                </span>
                                            </td>
                                            <td>{formatDate(user.createdAt)}</td>
                                            <td>
                                                {user.role !== 'superadmin' && (
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => deleteUser(user._id)}
                                                        disabled={deleting === user._id}
                                                    >
                                                        {deleting === user._id ? '...' : '삭제'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="no-results">검색 결과가 없습니다</div>
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

                .users-table-container {
                    background: #1a1f26;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .users-table th {
                    text-align: left;
                    padding: 16px 20px;
                    background: #252b35;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .users-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                }

                .user-name {
                    font-weight: 600;
                    color: white;
                }

                .role-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
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
                    padding: 40px;
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
