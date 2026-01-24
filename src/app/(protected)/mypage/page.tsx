'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import NavBar from '@/components/NavBar';

const FloatingShapes = dynamic(() => import('@/components/canvas/FloatingShapes'), { ssr: false });

interface UserProfile {
    name: string;
    email: string;
    birthday: string;
    schoolName: string;
    role: string;
    createdAt: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function MyPage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    // Profile form
    const [profileForm, setProfileForm] = useState({
        name: '',
        schoolName: '',
        birthday: '',
    });
    const [profileErrors, setProfileErrors] = useState<FormErrors>({});
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.user);
                setProfileForm({
                    name: data.user.name || '',
                    schoolName: data.user.schoolName || '',
                    birthday: data.user.birthday ? new Date(data.user.birthday).toISOString().split('T')[0] : '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileErrors({});
        setProfileSuccess('');

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    const errors: FormErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => {
                        errors[err.field] = err.message;
                    });
                    setProfileErrors(errors);
                } else {
                    setProfileErrors({ general: data.message });
                }
            } else {
                setProfileSuccess('프로필이 업데이트되었습니다');
                setTimeout(() => setProfileSuccess(''), 3000);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setProfileErrors({ general: '프로필 업데이트 중 오류가 발생했습니다' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordSaving(true);
        setPasswordErrors({});
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordErrors({ confirmPassword: '새 비밀번호가 일치하지 않습니다' });
            setPasswordSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    const errors: FormErrors = {};
                    data.errors.forEach((err: { field: string; message: string }) => {
                        errors[err.field] = err.message;
                    });
                    setPasswordErrors(errors);
                } else {
                    setPasswordErrors({ general: data.message });
                }
            } else {
                setPasswordSuccess('비밀번호가 변경되었습니다');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setPasswordSuccess(''), 3000);
            }
        } catch (error) {
            console.error('Password change error:', error);
            setPasswordErrors({ general: '비밀번호 변경 중 오류가 발생했습니다' });
        } finally {
            setPasswordSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin':
                return <span className="badge role-sa">슈퍼관리자</span>;
            case 'admin':
                return <span className="badge role-admin">관리자</span>;
            default:
                return <span className="badge role-user">일반회원</span>;
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="loading-fullscreen">
                <div className="spinner-apple"></div>
            </div>
        );
    }

    return (
        <div className="mypage">
            <NavBar />
            <FloatingShapes />

            <main className="mypage-main">
                <div className="container-sm">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="avatar-large-container">
                            <div className="avatar-large">
                                {profile?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="avatar-edit-overlay">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="user-name-title">{profile?.name}</h1>
                        <div className="user-meta-header">
                            {profile && getRoleBadge(profile.role)}
                            <span className="user-email-text">{profile?.email}</span>
                        </div>
                    </div>

                    {/* Navigation Pills */}
                    <div className="settings-nav">
                        <div className="nav-pill glass-card">
                            <button
                                className={`pill-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                프로필
                            </button>
                            <button
                                className={`pill-item ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                보안
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Content */}
                    <div className="settings-content">
                        {activeTab === 'profile' ? (
                            <div className="card-apple glass-card anim-fade-in">
                                <div className="card-header-apple">
                                    <h3>기본 정보</h3>
                                    <p>성함과 소속 학교 정보를 최신으로 유지하세요.</p>
                                </div>

                                {profileSuccess && <div className="toast-apple success">{profileSuccess}</div>}
                                {profileErrors.general && <div className="toast-apple error">{profileErrors.general}</div>}

                                <form onSubmit={handleProfileSubmit} className="apple-form">
                                    <div className="input-group-apple">
                                        <label>이름</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className={profileErrors.name ? 'error' : ''}
                                        />
                                        {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
                                    </div>

                                    <div className="input-group-apple">
                                        <label>소속 학교</label>
                                        <input
                                            type="text"
                                            value={profileForm.schoolName}
                                            onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                                            className={profileErrors.schoolName ? 'error' : ''}
                                        />
                                        {profileErrors.schoolName && <span className="error-text">{profileErrors.schoolName}</span>}
                                    </div>

                                    <div className="input-group-apple">
                                        <label>생년월일</label>
                                        <input
                                            type="date"
                                            value={profileForm.birthday}
                                            onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn-apple-primary ${profileSaving ? 'loading' : ''}`}
                                        disabled={profileSaving}
                                    >
                                        저장하기
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="card-apple glass-card anim-fade-in">
                                <div className="card-header-apple">
                                    <h3>비밀번호 변경</h3>
                                    <p>계정 보안을 위해 주기적으로 비밀번호를 변경하는 것이 좋습니다.</p>
                                </div>

                                {passwordSuccess && <div className="toast-apple success">{passwordSuccess}</div>}
                                {passwordErrors.general && <div className="toast-apple error">{passwordErrors.general}</div>}

                                <form onSubmit={handlePasswordSubmit} className="apple-form">
                                    <div className="input-group-apple">
                                        <label>현재 비밀번호</label>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className={passwordErrors.currentPassword ? 'error' : ''}
                                        />
                                        {passwordErrors.currentPassword && <span className="error-text">{passwordErrors.currentPassword}</span>}
                                    </div>

                                    <div className="input-group-apple">
                                        <label>새 비밀번호</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            placeholder="8자 이상, 영문/숫자 조합"
                                            className={passwordErrors.newPassword ? 'error' : ''}
                                        />
                                        {passwordErrors.newPassword && <span className="error-text">{passwordErrors.newPassword}</span>}
                                    </div>

                                    <div className="input-group-apple">
                                        <label>비밀번호 확인</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className={passwordErrors.confirmPassword ? 'error' : ''}
                                        />
                                        {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn-apple-primary ${passwordSaving ? 'loading' : ''}`}
                                        disabled={passwordSaving}
                                    >
                                        변경 완료
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .mypage {
                    min-height: 100vh;
                    background-color: var(--color-bg);
                    color: var(--color-text-primary);
                }

                .mypage-main {
                    padding: 40px 0 100px;
                }

                .profile-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 48px;
                    text-align: center;
                }

                .avatar-large-container {
                    position: relative;
                    margin-bottom: 24px;
                }

                .avatar-large {
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(135deg, var(--color-green), #4CD964);
                    color: white;
                    border-radius: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 800;
                    box-shadow: 0 20px 40px rgba(52, 199, 89, 0.2);
                }

                .avatar-edit-overlay {
                    position: absolute;
                    bottom: -8px;
                    right: -8px;
                    width: 40px;
                    height: 40px;
                    background: #000;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 4px solid var(--color-bg);
                    cursor: pointer;
                }

                .user-name-title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    margin-bottom: 8px;
                }

                .user-meta-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .badge {
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .role-sa { background: rgba(52, 199, 89, 0.15); color: var(--color-green); }
                .role-admin { background: rgba(0, 122, 255, 0.15); color: var(--color-blue); }
                .role-user { background: var(--glass-border); color: var(--color-text-secondary); }

                .user-email-text {
                    font-size: 0.95rem;
                    color: var(--color-text-secondary);
                }

                /* Settings Nav */
                .settings-nav {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 32px;
                }

                .nav-pill {
                    display: flex;
                    padding: 4px;
                    background: var(--glass-border);
                    border-radius: 99px;
                    gap: 4px;
                }

                .pill-item {
                    padding: 8px 32px;
                    border: none;
                    background: none;
                    border-radius: 99px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pill-item.active {
                    background: var(--color-card);
                    color: var(--color-text-primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                /* Content Cards */
                .card-apple {
                    padding: 40px;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .card-header-apple {
                    margin-bottom: 32px;
                }

                .card-header-apple h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 8px;
                    color: var(--color-text-primary);
                }

                .card-header-apple p {
                    color: var(--color-text-secondary);
                    font-size: 0.95rem;
                }

                .apple-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .input-group-apple {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .input-group-apple label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                    padding-left: 4px;
                }

                .input-group-apple input {
                    padding: 16px;
                    border-radius: 16px;
                    border: 1px solid var(--glass-border);
                    background: var(--color-card);
                    color: var(--color-text-primary);
                    font-family: inherit;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .input-group-apple input:focus {
                    border-color: var(--color-blue);
                    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
                    outline: none;
                }

                .input-group-apple input.error {
                    border-color: var(--color-red);
                    background: rgba(255, 59, 48, 0.05);
                }

                .error-text {
                    color: var(--color-red);
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding-left: 4px;
                }

                .btn-apple-primary {
                    margin-top: 12px;
                    background: var(--color-text-primary);
                    color: var(--color-bg);
                    padding: 18px;
                    border-radius: 20px;
                    border: none;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-apple-primary:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }

                .toast-apple {
                    padding: 12px 16px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                }

                .toast-apple.success { background: rgba(52, 199, 89, 0.1); color: var(--color-green); border: 1px solid rgba(52,199,89,0.2); }
                .toast-apple.error { background: rgba(255, 59, 48, 0.1); color: var(--color-red); border: 1px solid rgba(255,59,48,0.2); }

                .anim-fade-in {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .loading-fullscreen {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-bg);
                }

                .spinner-apple {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--glass-border);
                    border-top-color: var(--color-green);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 600px) {
                    .card-apple { padding: 24px; }
                    .user-name-title { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
}
