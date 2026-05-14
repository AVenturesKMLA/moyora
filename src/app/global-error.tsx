'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
                <h2>시스템 오류가 발생했습니다</h2>
                <p style={{ color: '#505866' }}>{error.message}</p>
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
            </body>
        </html>
    );
}
