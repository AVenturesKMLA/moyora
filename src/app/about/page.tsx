import React from 'react';

export default function AboutPage() {
    return (
        <div className="about-page">
            <div className="container">
                <h1>Company Introduction</h1>
                <p>어벤처스(AVentures)는 교내/교외 모든 활동의 시작과 끝을 함께합니다.</p>
                <p>더 많은 정보가 곧 업데이트될 예정입니다.</p>
            </div>
            <style jsx>{`
        .about-page {
          min-height: 100vh;
          background: #000000;
          color: white;
          padding-top: 100px; /* Navbar offset */
          display: flex;
          justify-content: center;
        }
        .container {
          max-width: 800px;
          padding: 0 20px;
          text-align: center;
        }
        h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #1F4EF5;
        }
        p {
          font-size: 1.2rem;
          color: #ccc;
          margin-bottom: 1rem;
        }
      `}</style>
        </div>
    );
}
