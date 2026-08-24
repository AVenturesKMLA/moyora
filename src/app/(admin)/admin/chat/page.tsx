'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ChatMessage {
    _id: string;
    userId: string;
    userName: string;
    schoolName: string;
    content: string;
    createdAt: string;
}

export default function AdminChatPage() {
    const pathname = usePathname();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [clearing, setClearing] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/chat');
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            } else {
                setNotice(data.message);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setNotice('메시지를 불러오지 못했습니다');
        } finally {
            setLoading(false);
        }
    };

    const deleteMessage = async (message: ChatMessage) => {
        const preview =
            message.content.length > 40 ? `${message.content.slice(0, 40)}...` : message.content;
        if (!confirm(`이 메시지를 삭제하시겠습니까?\n\n${message.userName} : ${preview}`)) {
            return;
        }

        setDeleting(message._id);
        setNotice(null);
        try {
            const res = await fetch(`/api/admin/chat/${message._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMessages((prev) => prev.filter((m) => m._id !== message._id));
                setNotice('메시지가 삭제되었습니다');
            } else {
                setNotice(data.message ?? '삭제에 실패했습니다');
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            setNotice('삭제 중 오류가 발생했습니다');
        } finally {
            setDeleting(null);
        }
    };

    const clearAll = async () => {
        if (
            !confirm(
                `전체 채팅 메시지 ${messages.length}건을 모두 삭제하시겠습니까?\n\n되돌릴 수 없습니다.`
            )
        ) {
            return;
        }

        setClearing(true);
        setNotice(null);
        try {
            const res = await fetch('/api/admin/chat', { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMessages([]);
                setNotice(data.message);
            } else {
                setNotice(data.message ?? '삭제에 실패했습니다');
            }
        } catch (error) {
            console.error('Failed to clear chat:', error);
            setNotice('삭제 중 오류가 발생했습니다');
        } finally {
            setClearing(false);
        }
    };

    const formatDateTime = (dateString: string) =>
        new Date(dateString).toLocaleString('ko-KR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

    const query = searchQuery.toLowerCase();
    const filteredMessages = messages.filter(
        (m) =>
            m.content.toLowerCase().includes(query) ||
            m.userName.toLowerCase().includes(query) ||
            m.schoolName.toLowerCase().includes(query)
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
                    <h1>채팅 관리</h1>
                    <p>전체 채팅 메시지를 확인하고 삭제할 수 있습니다 (최근 500건)</p>
                </header>

                <div className="toolbar">
                    <input
                        type="text"
                        placeholder="내용, 작성자, 학교로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className="clear-btn"
                        onClick={clearAll}
                        disabled={clearing || messages.length === 0}
                    >
                        {clearing ? '삭제 중...' : '전체 비우기'}
                    </button>
                </div>

                {notice && <div className="notice">{notice}</div>}

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <div className="chat-table-container">
                        <table className="chat-table">
                            <thead>
                                <tr>
                                    <th>작성자</th>
                                    <th>내용</th>
                                    <th>작성일시</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMessages.map((m) => (
                                    <tr key={m._id}>
                                        <td>
                                            <div className="author-name">{m.userName}</div>
                                            {m.schoolName && <div className="sub-text">{m.schoolName}</div>}
                                        </td>
                                        <td className="content-cell">{m.content}</td>
                                        <td className="date-cell">{formatDateTime(m.createdAt)}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteMessage(m)}
                                                disabled={deleting === m._id}
                                            >
                                                {deleting === m._id ? '...' : '삭제'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredMessages.length === 0 && (
                            <div className="no-results">
                                {messages.length === 0 ? '전체 채팅 메시지가 없습니다' : '검색 결과가 없습니다'}
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

                .toolbar {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .toolbar input {
                    flex: 1;
                    min-width: 240px;
                    max-width: 400px;
                    padding: 12px 16px;
                    background: #1a1f26;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                }

                .toolbar input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .clear-btn {
                    padding: 12px 20px;
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 10px;
                    color: #ef4444;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .clear-btn:hover:not(:disabled) { background: rgba(239, 68, 68, 0.25); }
                .clear-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                .notice {
                    background: rgba(139, 92, 246, 0.15);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: #c4b5fd;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    margin-bottom: 20px;
                }

                .chat-table-container {
                    background: #1a1f26;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow-x: auto;
                }

                .chat-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .chat-table th {
                    text-align: left;
                    padding: 16px 20px;
                    background: #252b35;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                .chat-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    vertical-align: top;
                }

                .author-name {
                    font-weight: 600;
                    color: white;
                    white-space: nowrap;
                }

                .sub-text {
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 12px;
                    margin-top: 2px;
                }

                .content-cell {
                    white-space: pre-wrap;
                    word-break: break-word;
                    max-width: 520px;
                }

                .date-cell {
                    color: rgba(255, 255, 255, 0.5);
                    white-space: nowrap;
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

                .delete-btn:hover:not(:disabled) { background: rgba(239, 68, 68, 0.3); }
                .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
