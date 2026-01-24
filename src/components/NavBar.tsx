'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '@/context/NotificationContext';

interface NavBarProps {
    showDashboardLink?: boolean;
    onHeroToggle?: () => void;
    heroMode?: 'default' | 'network';
}

function NotificationButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount } = useNotifications();

    return (
        <div style={{ position: 'relative' }}>
            <button
                className="nav-btn-icon"
                onClick={() => setIsOpen(!isOpen)}
                title="알림"
            >
                <span style={{ fontSize: '18px' }}>🔔</span>
                {unreadCount > 0 && (
                    <span className="badge-dot"></span>
                )}
            </button>
            <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />

            <style jsx>{`
                .nav-btn-icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.2s;
                    position: relative;
                }
                .nav-btn-icon:hover {
                    background: rgba(0,0,0,0.05);
                }
                .badge-dot {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 6px;
                    height: 6px;
                    background-color: var(--color-red);
                    border-radius: 50%;
                    border: 1px solid var(--color-bg);
                }
            `}</style>
        </div>
    );
}

export default function NavBar({ showDashboardLink = true, onHeroToggle, heroMode }: NavBarProps) {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isLoading = status === 'loading';
    const isLoggedIn = !!session?.user;

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <nav className="nav-wrapper">
            <div className="container nav-inner">
                <div className="nav-island glass-card">
                    <Link href="/" className="nav-link-logo">
                        <div className="nav-logo-icon">
                            <span style={{ fontSize: '20px' }}>🎓</span>
                        </div>
                        <span className="nav-logo-text">모여라</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="nav-menu-desktop">
                        {isLoggedIn && (
                            <>
                                <Link href="/dashboard" className="nav-item">대시보드</Link>
                                <Link href="/schedule" className="nav-item">일정</Link>
                                <Link href="/events/manage" className="nav-item">관리</Link>
                                <Link href="/mypage" className="nav-item">마이페이지</Link>
                            </>
                        )}
                    </div>

                    <div className="nav-actions">
                        {isLoading ? (
                            <div className="loading-mini"></div>
                        ) : isLoggedIn ? (
                            <div className="user-profile">
                                <Link href="/mypage" className="user-trigger">
                                    <div className="avatar">{session.user?.name?.charAt(0) || 'U'}</div>
                                </Link>
                                <button className="logout-btn" onClick={handleSignOut} title="로그아웃">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="auth-btns">
                                <Link href="/login" className="nav-btn-link">로그인</Link>
                                <Link href="/signup" className="nav-btn-link primary">회원가입</Link>
                            </div>
                        )}

                        <NotificationButton />
                        <ThemeToggle />

                        {onHeroToggle && (
                            <button
                                className="nav-btn-icon"
                                onClick={onHeroToggle}
                                title={heroMode === 'network' ? '기본 뷰로 전환' : '네트워크 맵 보기'}
                            >
                                {heroMode === 'network' ? (
                                    <span style={{ fontSize: '18px' }}>🌐</span>
                                ) : (
                                    <span style={{ fontSize: '18px' }}>🧊</span>
                                )}
                            </button>
                        )}

                        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="mobile-menu glass-card anim-slide-down">
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className="mobile-item" onClick={() => setMobileMenuOpen(false)}>대시보드</Link>
                                <Link href="/schedule" className="mobile-item" onClick={() => setMobileMenuOpen(false)}>일정</Link>
                                <Link href="/events/manage" className="mobile-item" onClick={() => setMobileMenuOpen(false)}>관리</Link>
                                <Link href="/mypage" className="mobile-item" onClick={() => setMobileMenuOpen(false)}>마이페이지</Link>
                                <div className="mobile-divider"></div>
                                <button onClick={handleSignOut} className="mobile-item logout">로그아웃</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="mobile-item" onClick={() => setMobileMenuOpen(false)}>로그인</Link>
                                <Link href="/signup" className="mobile-item" onClick={() => setMobileMenuOpen(false)}>회원가입</Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .nav-wrapper {
                    position: sticky;
                    top: 20px;
                    z-index: 1000;
                    pointer-events: none; /* Let clicks pass through outside the island */
                }

                .nav-inner {
                    position: relative;
                    pointer-events: auto; /* Re-enable clicks */
                }

                .nav-island {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 56px;
                    padding: 0 6px 0 16px;
                    background: var(--glass-bg);
                    backdrop-filter: var(--material-thick);
                    -webkit-backdrop-filter: var(--material-thick);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-pill);
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                    width: 100%;
                    max-width: 960px;
                    margin: 0 auto;
                }

                .nav-link-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }

                .nav-logo-icon {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, var(--color-green), #28a745);
                    border-radius: 8px; /* Slightly squircle */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
                }

                .nav-logo-text {
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    letter-spacing: -0.02em;
                }

                .nav-menu-desktop {
                    display: flex;
                    gap: 32px;
                }

                .nav-item {
                    padding: 8px 16px;
                    border-radius: var(--radius-pill);
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .nav-item:hover {
                    color: var(--color-text-primary);
                    background: rgba(0, 0, 0, 0.05);
                }

                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-right: 4px;
                }

                .avatar {
                    width: 36px;
                    height: 36px;
                    background: #E5E5EA;
                    color: #1c1c1e;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 15px;
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .logout-btn {
                    width: 36px;
                    height: 36px;
                    background: rgba(118, 118, 128, 0.12);
                    border-radius: 50%;
                    border: none;
                    color: var(--color-gray);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .logout-btn:hover {
                    background: rgba(255, 59, 48, 0.1);
                    color: var(--color-red);
                }

                .auth-btns {
                    display: flex;
                    gap: 8px;
                    padding-right: 4px;
                }

                .nav-btn-link {
                    padding: 8px 18px;
                    border-radius: var(--radius-pill);
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    color: var(--color-text-primary);
                    transition: all 0.2s;
                }

                .nav-btn-link:hover {
                    background: rgba(0,0,0,0.05);
                }

                .nav-btn-link.primary {
                    background: var(--color-blue);
                    color: white;
                }

                .nav-btn-link.primary:hover {
                    background: #0062cc;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    color: var(--color-text-primary);
                    cursor: pointer;
                    padding: 8px;
                    margin-right: 4px;
                }

                .mobile-menu {
                    position: absolute;
                    top: 70px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: calc(100% - 32px);
                    max-width: 400px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    z-index: 999;
                    background: var(--glass-bg);
                    backdrop-filter: var(--material-thick);
                    -webkit-backdrop-filter: var(--material-thick);
                    border-radius: 20px;
                }

                .mobile-item {
                    padding: 12px 16px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: var(--color-text-primary);
                    font-weight: 500;
                    font-size: 16px;
                    transition: background 0.2s;
                    text-align: center;
                }

                .mobile-item:hover {
                    background: rgba(0,0,0,0.05);
                }

                .mobile-divider {
                    height: 1px;
                    background: rgba(0,0,0,0.1);
                    margin: 4px 16px;
                }

                .mobile-item.logout {
                    color: var(--color-red);
                    border: none;
                    background: none;
                    font-family: inherit;
                    cursor: pointer;
                }

                .nav-btn-icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .nav-btn-icon:hover {
                    background: rgba(0,0,0,0.05);
                }

                .anim-slide-down {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideDown {
                    from { transform: translate(-50%, -20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }

                .loading-mini {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #E5E5EA;
                    border-top-color: var(--color-blue);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 800px) {
                    .nav-menu-desktop { display: none; }
                    .mobile-menu-btn { display: flex; }
                    .auth-btns { display: none; } /* Hide auth btns on mobile nav bar, show in menu */
                    .user-profile { display: none; }
                }
            `}</style>
        </nav>
    );
}
