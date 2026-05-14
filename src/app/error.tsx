'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
            <h2>문제가 발생했습니다</h2>
            <p style={{ color: '#505866' }}>{error.message || '알 수 없는 오류가 발생했습니다.'}</p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '10px 20px',
                    background: '#1F4EF5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                다시 시도
            </button>
        </div>
    );
}
