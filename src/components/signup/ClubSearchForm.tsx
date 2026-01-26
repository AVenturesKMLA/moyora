'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClubSearchFormProps {
    identityData: any;
    studentIdData: any;
}

export default function ClubSearchForm({ identityData, studentIdData }: ClubSearchFormProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClub, setSelectedClub] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mockClubs, setMockClubs] = useState<any[]>([]);

    // Mock search
    const handleSearch = () => {
        if (!searchTerm) return;

        // Simulate search
        const results = [
            { id: 1, name: '코딩 동아리', school: '서울고등학교', theme: '학술' },
            { id: 2, name: '밴드부', school: '서울고등학교', theme: '예술' },
            { id: 3, name: 'FC 서울고', school: '서울고등학교', theme: '체육' },
        ].filter(c => c.name.includes(searchTerm) || c.school.includes(searchTerm));

        setMockClubs(results);
    };

    const handleSubmit = () => {
        if (!selectedClub) return;
        setIsLoading(true);
        setTimeout(() => {
            router.push('/login?registered=true');
        }, 1500);
    };

    return (
        <div className="animate-fade-in pb-10">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">동아리 가입</h2>
                <p className="text-gray-500 text-sm mt-2">가입할 동아리를 검색해주세요</p>
                {studentIdData?.schoolName && (
                    <p className="text-blue-500 text-xs font-medium mt-1">
                        감지된 학교: {studentIdData.schoolName}
                    </p>
                )}
            </div>

            <div className="search-section">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="동아리명 또는 학교명 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} className="search-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>

                <div className="results-list">
                    {mockClubs.map(club => (
                        <div
                            key={club.id}
                            className={`club-item ${selectedClub?.id === club.id ? 'selected' : ''}`}
                            onClick={() => setSelectedClub(club)}
                        >
                            <div className="club-info">
                                <span className="club-badge">{club.theme}</span>
                                <h4>{club.name}</h4>
                                <p>{club.school}</p>
                            </div>
                            {selectedClub?.id === club.id && (
                                <div className="check-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                    {mockClubs.length === 0 && searchTerm && (
                        <p className="no-results">검색 결과가 없습니다.</p>
                    )}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="btn-submit"
                disabled={!selectedClub || isLoading}
            >
                {isLoading ? '가입 처리 중...' : '등록 및 회원가입 완료하기'}
            </button>

            <style jsx>{`
                .search-section {
                    background: #fff;
                    padding: 20px;
                    border-radius: 16px;
                    min-height: 300px;
                }
                .search-bar {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .search-bar input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #D6DADF;
                    border-radius: 12px;
                    background: #D6DADF;
                    font-size: 15px;
                }
                .search-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: #1F4EF5;
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .results-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .club-item {
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #D6DADF;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .club-item:hover { background: #f9f9f9; }
                .club-item.selected {
                    border-color: #1F4EF5;
                    background: rgba(31, 78, 245, 0.05);
                }
                .club-info h4 { font-weight: 700; color: #1A1E27; margin-bottom: 4px; }
                .club-info p { font-size: 13px; color: #505866; }
                .club-badge { 
                    font-size: 11px; font-weight: 600; color: #1F4EF5; 
                    background: rgba(31, 78, 245, 0.1); padding: 2px 6px; border-radius: 4px;
                    margin-bottom: 4px; display: inline-block;
                }
                .check-icon { color: #1F4EF5; }
                .no-results { text-align: center; color: #64768C; margin-top: 40px; }

                .btn-submit {
                    width: 100%;
                    background: #1F4EF5;
                    color: white;
                    padding: 18px;
                    border-radius: 16px;
                    font-size: 17px;
                    font-weight: 700;
                    border: none;
                    margin-top: 24px;
                }
                .btn-submit:disabled { opacity: 0.5; background: #B1B8C0; }

                @media (prefers-color-scheme: dark) {
                    .search-section { background: #1A1E27; }
                    .search-bar input { background: #2c2c2e; border-color: #64768C; color: #fff; }
                    .club-item { border-color: #64768C; }
                    .club-item:hover { background: #2c2c2e; }
                    .club-info h4 { color: #fff; }
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
