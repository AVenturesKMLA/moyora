'use client';

interface RoleSelectionProps {
    onSelectRole: (role: 'MEMBER' | 'CHIEF') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">가입 유형 선택</h2>
                <p className="text-gray-500 text-sm mt-2">어떤 목적으로 동아리를 이용하시나요?</p>
            </div>

            <button
                onClick={() => onSelectRole('MEMBER')}
                className="role-card group"
            >
                <div className="icon-bg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">동아리 부원으로 가입하기</h3>
                    <p className="text-gray-500 text-xs mt-1">기존 동아리에 가입하여 활동하고 싶어요</p>
                </div>
                <div className="arrow-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </button>

            <button
                onClick={() => onSelectRole('CHIEF')}
                className="role-card group"
            >
                <div className="icon-bg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">동아리 장(Chief)으로 가입하기</h3>
                    <p className="text-gray-500 text-xs mt-1">새로운 동아리를 등록하고 관리하고 싶어요</p>
                </div>
                <div className="arrow-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </button>

            <style jsx>{`
                .role-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px 20px;
                    background: var(--glass-bg, rgba(255, 255, 255, 0.8));
                    border: 1px solid var(--glass-border, rgba(0, 0, 0, 0.1));
                    border-radius: 20px;
                    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                    width: 100%;
                }
                .role-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
                }
                .role-card:active {
                    transform: scale(0.98);
                }
                .icon-bg {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .arrow-icon {
                    margin-left: auto;
                    color: #B1B8C0;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
