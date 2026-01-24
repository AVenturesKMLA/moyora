'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const Hero3D = dynamic(() => import('@/components/canvas/Hero3D'), { ssr: false });
const NetworkMap3D = dynamic(() => import('@/components/canvas/NetworkMap3D'), { ssr: false });

export default function HomePage() {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroMode, setHeroMode] = useState<'default' | 'network'>('default');

  const handleHeroToggle = () => {
    setHeroMode(prev => prev === 'default' ? 'network' : 'default');
  };

  const isLight = resolvedTheme === 'light';

  // Dynamic Styles based on Theme
  const pageBg = isLight ? '#FFFFFF' : '#000000';
  const textColor = isLight ? '#1d1d1f' : '#ffffff';
  const descColor = isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
  const badgeBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
  const badgeBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
  const badgeText = isLight ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';

  // Button Styles
  // Secondary (Glass) - Fully Transparent
  const glassBtnBg = 'transparent';
  const glassBtnBorder = 'transparent'; // No border as requested "no box line"
  const glassBtnText = isLight ? '#1d1d1f' : '#ffffff';
  const glassBtnHover = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.1)';

  // Primary Button - Fully Transparent
  const primaryBtnBg = 'transparent';
  const primaryBtnBorder = 'transparent'; // No border
  const primaryBtnTextResponsive = isLight ? '#1d1d1f' : '#ffffff'; // High contrast

  // Section Theme Variables
  const sectionBg = isLight ? '#FFFFFF' : '#050505';
  const sectionTextPrimary = isLight ? '#1d1d1f' : '#ffffff';
  const sectionTextSecondary = isLight ? '#666666' : '#888888';

  // Card Theme Variables
  const cardBg = isLight ? 'rgba(240, 240, 245, 0.8)' : 'rgba(20, 20, 20, 0.6)';
  const cardBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const cardTitle = isLight ? '#1d1d1f' : '#ffffff';
  const cardDesc = isLight ? '#4a4a4a' : '#aaaaaa';

  // Stats & Footer
  const glassPanelBg = isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)';
  const footerBg = isLight ? '#FFFFFF' : '#000000';

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
        heroRef.current.style.opacity = `${1 - scrollY / 700}`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-page" style={{ background: pageBg, color: textColor }}>
      <NavBar onHeroToggle={handleHeroToggle} heroMode={heroMode} />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background" ref={heroRef}>
          {heroMode === 'default' ? <Hero3D /> : <NetworkMap3D />}
          <div className="grid-overlay"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-badge-container anim-float">
            <div
              className="hero-badge"
              style={{ background: badgeBg, borderColor: badgeBorder }}
            >
              <span className="badge-icon">
                {heroMode === 'default' ? '✨' : '🌐'}
              </span>
              <span className="badge-text" style={{ color: badgeText }}>
                {heroMode === 'default' ? '대한민국 No.1 고등학교 동아리 플랫폼' : '전국을 연결하는 네트워크'}
              </span>
            </div>
          </div>

          <h1 className="hero-title anim-title-reveal" style={{ color: textColor }}>
            동아리 활동의<br />
            <span className="gradient-text shimmer-effect">새로운 차원.</span>
          </h1>

          <p className="hero-description anim-fade-up-delay" style={{ color: descColor }}>
            전국 고등학교 동아리들이 모여라에서 만나고 협력하며 성장합니다.<br />
            대회, 포럼, 공동연구까지 한 곳에서 경험하세요.
          </p>

          <div className="hero-buttons anim-fade-up-more-delay">
            {session ? (
              <Link
                href="/dashboard"
                className="btn-main-cta"
                style={{
                  background: primaryBtnBg,
                  color: primaryBtnTextResponsive,
                  border: 'none', // Removed box line
                  backdropFilter: 'none'
                }}
              >
                <span className="cta-content" style={{ color: primaryBtnTextResponsive }}>대시보드 열기</span>
              </Link>
            ) : (
              <Link
                href="/signup"
                className="btn-main-cta"
                style={{
                  background: primaryBtnBg,
                  color: primaryBtnTextResponsive,
                  border: 'none', // Removed box line
                  backdropFilter: 'none'
                }}
              >
                <span className="cta-content" style={{ color: primaryBtnTextResponsive }}>무료로 시작하기</span>
              </Link>
            )}
            <Link
              href="/schedule"
              className="btn-main-cta glass-variant"
              style={{
                background: glassBtnBg,
                borderColor: glassBtnBorder,
                color: glassBtnText,
                '--hover-bg': glassBtnHover,
                borderWidth: '0px'
              } as React.CSSProperties}
            >
              <span className="cta-content" style={{ color: glassBtnText }}>일정 둘러보기</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Bento Grid */}
      <section className="features" style={{ background: sectionBg }}>
        <div className="container">
          <div className="section-header">
            <h2
              className="section-title text-gradient-clip"
              style={{
                backgroundImage: isLight ? 'linear-gradient(135deg, #1d1d1f 0%, #666 100%)' : 'linear-gradient(135deg, #FFF 0%, #888 100%)'
              }}
            >
              모여라의 기능
            </h2>
            <p className="section-subtitle" style={{ color: sectionTextSecondary }}>동아리 운영에 필요한 모든 도구.</p>
          </div>

          <div className="bento-grid">
            {/* Main Feature: Contest */}
            <div className="bento-card card-contest" style={{ background: isLight ? 'rgba(230, 240, 255, 0.8)' : 'linear-gradient(145deg, rgba(0, 122, 255, 0.1), rgba(0,0,0,0))', borderColor: cardBorder }}>
              <div className="card-bg-glow"></div>
              <div className="card-content">
                <div className="card-icon-box blue">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                </div>
                <h3 style={{ color: cardTitle }}>전국 대회</h3>
                <p style={{ color: cardDesc }}>전국 규모의 동아리 대회에 참가하고<br />실력을 증명하세요.</p>
              </div>
              <div className="card-visual-3d trophy-visual">🏆</div>
            </div>

            {/* Feature: Forum */}
            <div className="bento-card card-forum" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="card-content">
                <div className="card-icon-box green">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <h3 style={{ color: cardTitle }}>소통 포럼</h3>
                <p style={{ color: cardDesc }}>다른 학교와 아이디어를 공유하고 토론하세요.</p>
              </div>
            </div>

            {/* Feature: Alerts */}
            <div className="bento-card card-alert" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="card-content">
                <div className="card-icon-box purple">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                </div>
                <h3 style={{ color: cardTitle }}>스마트 알림</h3>
                <p style={{ color: cardDesc }}>중요한 일정을 놓치지 않도록 미리 알려드립니다.</p>
              </div>
            </div>

            {/* Feature: Co-Research */}
            <div className="bento-card card-research" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="card-content horizontal">
                <div className="card-icon-box indigo">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <div className="text-group">
                  <h3 style={{ color: cardTitle }}>공동 연구 프로젝트</h3>
                  <p style={{ color: cardDesc }}>관심 분야가 같은 여러 동아리와 함께 프로젝트를 진행해보세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section: Step-by-Step */}
      <section className="workflow-section" style={{ background: sectionBg }}>
        <div className="container">
          <div className="section-header-center">
            <h2
              className="section-title text-gradient-clip"
              style={{
                backgroundImage: isLight ? 'linear-gradient(135deg, #1d1d1f 0%, #666 100%)' : 'linear-gradient(135deg, #FFF 0%, #888 100%)'
              }}
            >
              동아리 활동, 3단계면 충분합니다.
            </h2>
            <p className="section-subtitle" style={{ color: sectionTextSecondary }}>복잡한 절차 없이, 오직 활동에만 집중하세요.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card glass-card" style={{ background: cardBg }}>
              <div className="step-number-glow">01</div>
              <h3 style={{ color: cardTitle }}>간편한 가입/등록</h3>
              <p style={{ color: cardDesc }}>학교 정보를 입력하고 단 1분 만에 동아리를 모여라에 등록하세요.</p>
            </div>
            <div className="step-card glass-card" style={{ background: cardBg }}>
              <div className="step-number-glow">02</div>
              <h3 style={{ color: cardTitle }}>활동 탐색 및 신청</h3>
              <p style={{ color: cardDesc }}>전국의 다양한 대회와 포럼을 탐색하고 터치 한 번으로 참가를 신청하세요.</p>
            </div>
            <div className="step-card glass-card" style={{ background: cardBg }}>
              <div className="step-number-glow">03</div>
              <h3 style={{ color: cardTitle }}>협력과 성장</h3>
              <p style={{ color: cardDesc }}>다른 동아리와 소통하고 프로젝트를 진행하며 꿈을 실현하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="stats-section" style={{ background: sectionBg }}>
        <div className="container">
          <div className="stats-glass-panel glass-card" style={{ background: glassPanelBg, borderColor: cardBorder }}>
            <div className="stat-item">
              <span className="stat-value" style={{ color: sectionTextPrimary }}>120+</span>
              <span className="stat-label">등록된 동아리</span>
            </div>
            <div className="stat-divider-vertical" style={{ background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}></div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: sectionTextPrimary }}>1,500+</span>
              <span className="stat-label">활발한 학생들</span>
            </div>
            <div className="stat-divider-vertical" style={{ background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}></div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: sectionTextPrimary }}>340+</span>
              <span className="stat-label">진행된 프로젝트</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features List */}
      <section className="detailed-features" style={{ background: sectionBg }}>
        <div className="container">
          <div className="features-inner-grid">
            <div className="feature-small">
              <div className="feature-icon">🔍</div>
              <h4 style={{ color: sectionTextPrimary }}>스마트 검색</h4>
              <p style={{ color: sectionTextSecondary }}>키워드 하나로 내 활동 범주에 맞는 이벤트를 찾아보세요.</p>
            </div>
            <div className="feature-small">
              <div className="feature-icon">🛡️</div>
              <h4 style={{ color: sectionTextPrimary }}>관리 시스템</h4>
              <p style={{ color: sectionTextSecondary }}>부장과 부원의 체계적인 권한 분리로 안전하게 운영하세요.</p>
            </div>
            <div className="feature-small">
              <div className="feature-icon">📊</div>
              <h4 style={{ color: sectionTextPrimary }}>실시간 스탯</h4>
              <p style={{ color: sectionTextSecondary }}>우리 동아리의 활동 지수를 실시간으로 확인하고 분석하세요.</p>
            </div>
            <div className="feature-small">
              <div className="feature-icon">🔔</div>
              <h4 style={{ color: sectionTextPrimary }}>푸시 알림</h4>
              <p style={{ color: sectionTextSecondary }}>신청 현황과 중요 공지사항을 놓치지 않고 확인하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ background: footerBg }}>
        <div className="container">
          <div className="cta-card-glass" style={{ background: isLight ? 'rgba(255,255,255,0.8)' : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', borderColor: cardBorder }}>
            <h2
              className="cta-title text-gradient-clip"
              style={{
                backgroundImage: isLight ? 'linear-gradient(to right, #1d1d1f, #666)' : 'linear-gradient(to right, #fff, #aaa)'
              }}
            >
              지금 바로 시작하세요.
            </h2>
            <p className="cta-desc" style={{ color: sectionTextSecondary }}>전국의 100+ 동아리가 이미 활동 중입니다.</p>
            {!session && (
              <Link
                href="/signup"
                className="btn-main-cta transparent-variant"
              >
                <span className="cta-content" style={{ color: isLight ? '#1d1d1f' : '#ffffff' }}>무료 가입하기</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ background: footerBg, borderTop: isLight ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-logo">🎓</span>
              <span className="brand-name" style={{ color: sectionTextPrimary }}>모여라</span>
            </div>
            <p className="copyright" style={{ color: sectionTextSecondary }}>© 2026 Moyeora. Designed with iOS 16 aesthetics.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          overflow-x: hidden;
          background: #000000; /* Dark mode base for 'Fantastic' contrast */
          color: white;
        }

        /* === Hero Section === */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center; /* Center Vertically */
          justify-content: center;
          text-align: center;
          overflow: hidden;
          padding-top: 80px; /* Offset for Navbar */
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          pointer-events: none;
        }

        /* Hero Content */
        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge-container {
          margin-bottom: 32px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .badge-text {
          font-size: 15px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .hero-title {
          font-size: 80px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }

        .gradient-text {
            background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            display: inline-block;
        }

        .shimmer-effect {
            background-size: 200% auto;
            animation: textShimmer 3s linear infinite;
        }

        @keyframes textShimmer {
            to { background-position: 200% center; }
        }

        .hero-description {
          font-size: 24px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          max-width: 680px;
          margin-bottom: 48px;
          font-weight: 500;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
        }
        
        /* Premium Buttons */
        /* Shared Button Styles */
        .btn-main-cta {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 40px;
          height: 56px; /* Fixed height for consistency */
          background: #007AFF;
          border-radius: 999px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          text-decoration: none;
          transform: translateZ(0);
          box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
          border: 1px solid transparent;
        }

        .btn-main-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 122, 255, 0.5);
        }

        /* White Variant (e.g. for dark sections) */
        .btn-main-cta.white {
            background: white;
            color: black;
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
        }
        .btn-main-cta.white:hover {
             box-shadow: 0 8px 25px rgba(255, 255, 255, 0.4);
        }

        /* Glass Variant (Secondary) */
        .btn-main-cta.glass-variant {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: none;
        }

        .btn-main-cta.glass-variant:hover {
            background: var(--hover-bg, rgba(255, 255, 255, 0.2));
            border-color: rgba(255, 255, 255, 0.4);
        }

        /* Transparent Variant (for text-only buttons) */
        .btn-main-cta.transparent-variant {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
        }

        .btn-main-cta.transparent-variant:hover {
            background: rgba(128, 128, 128, 0.1) !important;
            box-shadow: none !important;
        }

        .cta-content {
          position: relative; /* Required for z-index to work */
          font-size: 17px;
          font-weight: 700;
          color: white;
          z-index: 2;
        }
        
        .btn-main-cta.white .cta-content { color: black; }

        /* Simplified Glow/Shine Effect */
        .btn-main-cta::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
            pointer-events: none; /* Ensure clicks pass through */
        }

        .btn-main-cta:hover::after {
            left: 100%;
            transition: left 0.7s ease-in-out;
        }

        /* === Bento Grid === */
        .features {
            position: relative;
            padding: 100px 0;
            background: #050505;
        }

        .section-title {
            font-size: 48px;
            background: linear-gradient(135deg, #FFF 0%, #888 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
        }

        .section-subtitle {
            font-size: 22px;
            color: #888;
        }

        .bento-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, minmax(360px, auto));
            gap: 32px;
        }

        .bento-card {
            background: rgba(20, 20, 20, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 32px;
            padding: 40px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .bento-card:hover {
            transform: translateY(-10px);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .card-contest {
            grid-column: span 2;
            grid-row: span 2;
            background: linear-gradient(145deg, rgba(0, 122, 255, 0.1), rgba(0,0,0,0));
        }

        .card-visual-3d {
            position: absolute;
            right: 20px;
            bottom: 20px;
            font-size: 150px;
            filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
            transform: rotate(-10deg);
            transition: transform 0.5s;
        }
        
        .bento-card:hover .card-visual-3d {
            transform: rotate(0deg) scale(1.1);
        }

        .card-icon-box {
            width: 64px;
            height: 64px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            color: white;
            font-size: 32px;
        }
        .blue { background: #007AFF; box-shadow: 0 10px 30px rgba(0, 122, 255, 0.3); }
        .green { background: #34C759; box-shadow: 0 10px 30px rgba(52, 199, 89, 0.3); }
        .purple { background: #AF52DE; box-shadow: 0 10px 30px rgba(175, 82, 222, 0.3); }
        .indigo { background: #5856D6; box-shadow: 0 10px 30px rgba(88, 86, 214, 0.3); }

        .bento-card h3 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            color: white;
        }

        .bento-card p {
            font-size: 19px;
            color: #aaa;
            line-height: 1.5;
        }

        .card-research {
            grid-column: span 3;
            flex-direction: row;
            align-items: center;
        }
        
        .card-research .card-content.horizontal {
            display: flex;
            align-items: center;
            gap: 32px;
            width: 100%;
        }

        /* === CTA Section === */
        .cta-section {
            padding: 120px 0;
            background: #000;
        }

        .cta-card-glass {
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 40px;
            padding: 80px;
            text-align: center;
            backdrop-filter: blur(20px);
            position: relative;
            overflow: hidden;
        }

        .cta-title {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
            background: linear-gradient(to right, #fff, #aaa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .cta-desc {
            font-size: 24px;
            color: #888;
            margin-bottom: 40px;
        }

        /* === Animations === */
        @keyframes reveal {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .anim-title-reveal { animation: reveal 0.8s ease-out forwards; }
        .anim-fade-up-delay { opacity: 0; animation: reveal 0.8s ease-out 0.2s forwards; }
        .anim-fade-up-more-delay { opacity: 0; animation: reveal 0.8s ease-out 0.4s forwards; }

        /* === Workflow & Extension Sections === */
        .workflow-section {
            padding: 120px 0;
            background: #000;
            position: relative;
        }

        .section-header-center {
            text-align: center;
            margin-bottom: 80px;
        }

        .steps-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
        }

        .step-card {
            padding: 48px 32px;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 20px;
            transition: all 0.3s;
        }

        .step-card:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(-5px);
        }

        .step-number-glow {
            font-size: 48px;
            font-weight: 800;
            background: linear-gradient(to bottom, var(--color-blue), transparent);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 0.5;
        }

        .step-card h3 {
            font-size: 24px;
            font-weight: 700;
            color: #fff;
        }

        .step-card p {
            font-size: 16px;
            color: #888;
            line-height: 1.6;
        }

        .stats-section {
            padding: 60px 0;
            background: #000;
        }

        .stats-glass-panel {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 60px;
            border-radius: 40px;
        }

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .stat-value {
            font-size: 48px;
            font-weight: 800;
            color: #fff;
            letter-spacing: -0.02em;
        }

        .stat-label {
            font-size: 17px;
            font-weight: 600;
            color: var(--color-blue);
            text-transform: uppercase;
        }

        .stat-divider-vertical {
            width: 1px;
            height: 60px;
            background: rgba(255,255,255,0.1);
        }

        .detailed-features {
            padding: 120px 0;
            background: #000;
        }

        .features-inner-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 40px;
        }

        .feature-small {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .feature-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        .feature-small h4 {
            font-size: 20px;
            font-weight: 700;
            color: #fff;
        }

        .feature-small p {
            font-size: 15px;
            color: #777;
            line-height: 1.5;
        }

        .text-gradient-clip {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent; /* Fallback */
            display: inline-block;
        }

        @media (max-width: 900px) {
            .hero-title { font-size: 48px; }
            .bento-grid, .steps-grid, .features-inner-grid { grid-template-columns: 1fr; }
            .stats-glass-panel { flex-direction: column; gap: 40px; padding: 40px; }
            .stat-divider-vertical { display: none; }
            .card-contest, .card-research { grid-column: span 1; grid-row: auto; }
            .card-research .card-content.horizontal { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}
