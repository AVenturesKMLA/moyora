'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const NetworkMap3D = dynamic(() => import('@/components/canvas/NetworkMap3D'), { ssr: false });

export default function HomePage() {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - wait until client-side theme is resolved
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to dark theme during SSR to prevent flash (most users prefer dark)
  const isLight = mounted ? resolvedTheme === 'light' : false;

  // Dynamic Styles based on Theme (New Brand Palette)
  const pageBg = isLight ? '#FFFFFF' : '#000000';
  const textColor = isLight ? '#1A1E27' : '#FFFFFF';
  const descColor = isLight ? '#505866' : '#B1B8C0';
  const badgeBg = isLight ? '#D6DADF' : 'rgba(255,255,255,0.05)';
  const badgeBorder = isLight ? '#D6DADF' : 'rgba(255,255,255,0.1)';
  const badgeText = isLight ? '#505866' : '#FFFFFF';

  // Button Styles
  const glassBtnBg = 'transparent';
  const glassBtnBorder = isLight ? '#D6DADF' : 'rgba(255, 255, 255, 0.2)';
  const glassBtnText = isLight ? '#1A1E27' : '#FFFFFF';
  const glassBtnHover = isLight ? '#D6DADF' : 'rgba(255, 255, 255, 0.1)';

  // Primary Button
  const primaryBtnBg = '#1F4EF5';
  const primaryBtnTextResponsive = '#FFFFFF';

  // Section Theme Variables
  const sectionBg = isLight ? '#FFFFFF' : '#000000';
  const sectionTextPrimary = isLight ? '#1A1E27' : '#FFFFFF';
  const sectionTextSecondary = isLight ? '#505866' : '#B1B8C0';

  // Card Theme Variables
  const cardBg = isLight ? '#D6DADF' : '#1A1E27';
  const cardBorder = isLight ? '#D6DADF' : 'rgba(255, 255, 255, 0.1)';
  const cardTitle = isLight ? '#1A1E27' : '#FFFFFF';
  const cardDesc = isLight ? '#505866' : '#B1B8C0';

  // Stats & Footer
  const glassPanelBg = isLight ? '#D6DADF' : 'rgba(255, 255, 255, 0.03)';
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
      <NavBar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background" ref={heroRef}>
          <NetworkMap3D />
          <div className="grid-overlay"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-badge-container anim-float">
            <div
              className="hero-badge"
              style={{ background: badgeBg, borderColor: badgeBorder }}
            >
              <span className="badge-text" style={{ color: badgeText }}>
                전국을 연결하는 네트워크
              </span>
            </div>
          </div>

          <h1 className="hero-title anim-title-reveal" style={{ color: textColor }}>
            동아리 활동의<br />
            <span className="accent-text">새로운 차원.</span>
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
                  border: 'none',
                  borderRadius: '999px',
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
                  border: 'none',
                  borderRadius: '999px',
                  backdropFilter: 'none'
                }}
              >
                <span className="cta-content" style={{ color: primaryBtnTextResponsive }}>회원 가입하기</span>
              </Link>
            )}
            <Link
              href="/schedule"
              className="btn-main-cta glass-variant"
              style={{
                background: glassBtnBg,
                borderColor: glassBtnBorder,
                borderRadius: '999px',
                color: glassBtnText,
                '--hover-bg': glassBtnHover
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
            <h2 className="section-title" style={{ color: sectionTextPrimary }}>
              모여라의 기능
            </h2>
          </div>

          <div className="bento-grid">
            {/* Main Feature: Contest */}
            <div className="bento-card card-contest" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="card-content">
                <div className="card-icon-box blue">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                </div>
                <div className="text-group">
                  <h3 style={{ color: cardTitle }}>통합 대회</h3>
                  <p style={{ color: cardDesc }}>전국 규모의 동아리 대회에 참가하고 실력을 증명하세요.</p>
                </div>
              </div>
            </div>

            {/* Feature: Forum */}
            <div className="bento-card card-forum" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="card-content">
                <div className="card-icon-box green">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div className="text-group">
                  <h3 style={{ color: cardTitle }}>연합 포럼</h3>
                  <p style={{ color: cardDesc }}>다른 학교와 아이디어를 공유하고 토론하세요.</p>
                </div>
              </div>
            </div>


            {/* Feature: Co-Research */}
            <div className="bento-card card-alert" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="card-content">
                <div className="card-icon-box indigo">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <div className="text-group">
                  <h3 style={{ color: cardTitle }}>공동 연구</h3>
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
            <h2 className="section-title" style={{ color: sectionTextPrimary }}>
              모여라 플랫폼, 3단계면 충분합니다.
            </h2>
            <p className="section-subtitle" style={{ color: sectionTextSecondary }}>복잡한 절차 없이, 오직 활동에만 집중하세요.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card glass-card" style={{ background: cardBg }}>
              <div className="step-number-glow">01</div>
              <div className="text-group">
                <h3 style={{ color: cardTitle }}>신원 검증 기반 회원가입</h3>
                <p style={{ color: cardDesc }}>학생증을 통한 본인인증으로 신뢰가는 이용을 시작하세요!</p>
              </div>
            </div>
            <div className="step-card glass-card" style={{ background: cardBg }}>
              <div className="step-number-glow">02</div>
              <div className="text-group">
                <h3 style={{ color: cardTitle }}>활동 등록 및 참여</h3>
                <p style={{ color: cardDesc }}>전국 곳곳 고등학교 동아리들과 탄탄한 스펙을 쌓아가세요!</p>
              </div>
            </div>
            <div className="step-card glass-card" style={{ background: cardBg }}>
              <div className="step-number-glow">03</div>
              <div className="text-group">
                <h3 style={{ color: cardTitle }}>동아리 평가</h3>
                <p style={{ color: cardDesc }}>다음에도 함께하고 싶은 동아리였나요? 여러분이 평가해주세요!</p>
              </div>
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
              <span className="stat-label">함께하는 동아리</span>
            </div>
            <div className="stat-divider-vertical" style={{ background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}></div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: sectionTextPrimary }}>1,500+</span>
              <span className="stat-label">모여라 회원</span>
            </div>
            <div className="stat-divider-vertical" style={{ background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}></div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: sectionTextPrimary }}>340+</span>
              <span className="stat-label">성사된 교류</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ background: footerBg }}>
        <div className="container">
          <div className="cta-card-glass" style={{ background: cardBg, borderColor: cardBorder }}>
            <h2 className="cta-title" style={{ color: sectionTextPrimary }}>
              지금 바로 시작하세요.
            </h2>
            <p className="cta-desc" style={{ color: sectionTextSecondary }}>전국의 100+ 동아리가 이미 활동 중입니다.</p>
            {!session && (
              <Link
                href="/signup"
                className="btn-main-cta solid-btn"
              >
                <span className="cta-content">회원 가입하기</span>
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
              <span className="brand-logo">M</span>
              <span className="brand-name" style={{ color: sectionTextPrimary }}>모여라</span>
            </div>
            <p className="copyright" style={{ color: sectionTextSecondary }}>© 2026 Moyora. All rights reserved.</p>
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
          padding: 10px 24px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 999px;
        }

        .badge-text {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        /* Accent Text - Clean, no shimmer */
        .accent-text {
          color: #1F4EF5;
        }

        .hero-title {
          font-size: 80px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          word-break: keep-all;
        }

        .hero-description {
          font-size: 24px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          max-width: 680px;
          margin-bottom: 48px;
          font-weight: 500;
          word-break: keep-all;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
        }
        
        /* Buttons - Fandom Style */
        .btn-main-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 32px;
          height: 52px;
          background: #1F4EF5;
          border-radius: 999px;
          transition: all 0.15s ease;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }

        .btn-main-cta:hover {
          background: #4880EE;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(31, 78, 245, 0.2);
        }

        .btn-main-cta .cta-content {
          font-size: 15px;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.02em;
        }

        /* Outlined Variant */
        .btn-main-cta.glass-variant {
          background: transparent;
          border: 1px solid #D6DADF;
        }

        .btn-main-cta.glass-variant:hover {
          background: #D6DADF;
          border-color: #B1B8C0;
        }

        .btn-main-cta.glass-variant .cta-content {
          color: #1A1E27;
        }

        .btn-main-cta.solid-btn {
          background: #1F4EF5;
        }

        .btn-main-cta.solid-btn:hover {
          background: #4880EE;
        }

        .btn-main-cta.solid-btn .cta-content {
          color: #ffffff;
        }

        /* === Bento Grid === */
        .features {
            position: relative;
            padding: 100px 0;
            background: #1A1E27;
        }

        .section-title {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
        }

        .section-subtitle {
            font-size: 22px;
            color: #505866;
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
            background: linear-gradient(145deg, rgba(31, 78, 245, 0.1), rgba(0,0,0,0));
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
        .blue { background: #1F4EF5; box-shadow: 0 10px 30px rgba(31, 78, 245, 0.3); }
        .green { background: #4880EE; box-shadow: 0 10px 30px rgba(72, 128, 238, 0.3); }
        .purple { background: #64768C; box-shadow: 0 10px 30px rgba(100, 118, 140, 0.3); }
        .indigo { background: #505866; box-shadow: 0 10px 30px rgba(80, 88, 102, 0.3); }

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
            background: #000000;
        }

        .cta-card-glass {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 60px;
            text-align: center;
        }

        .cta-title {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
        }

        .cta-desc {
            font-size: 24px;
            color: #505866;
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
            background: #000000;
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
            color: var(--color-blue);
            opacity: 0.4;
        }

        .step-card h3 {
            font-size: 24px;
            font-weight: 700;
            color: #fff;
        }

        .step-card p {
            font-size: 16px;
            color: #505866;
            line-height: 1.6;
        }

        .stats-section {
            padding: 60px 0;
            background: #000000;
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
            background: #000000;
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

        .feature-number {
            font-size: 32px;
            font-weight: 800;
            color: #1A1E27;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
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



        /* === Mobile Layout === */
        @media (max-width: 768px) {
            /* Hero - Mobile */
            .hero {
                min-height: 100svh;
                padding-top: 100px;
            }

            .hero-badge-container {
                margin-bottom: 24px;
            }

            .hero-badge {
                padding: 8px 16px;
            }

            .badge-text {
                font-size: 12px;
            }

            .hero-title {
                font-size: 36px;
                margin-bottom: 16px;
            }

            .hero-description {
                font-size: 16px;
                margin-bottom: 32px;
                padding: 0 16px;
            }

            .hero-buttons {
                flex-direction: column;
                width: 100%;
                max-width: 280px;
                gap: 12px;
            }

            .btn-main-cta {
                width: 100%;
                height: 48px;
                padding: 0 24px;
            }

            .cta-content {
                font-size: 15px;
            }

            /* Features - Mobile */
            .features {
                padding: 60px 0;
            }

            .section-title {
                font-size: 28px;
            }

            .section-subtitle {
                font-size: 16px;
            }

            .bento-grid {
                grid-template-columns: 1fr;
                grid-template-rows: auto;
                gap: 12px;
            }

            .bento-card {
                padding: 20px;
                border-radius: 16px;
                min-height: auto !important;
                height: auto !important;
            }

            .card-contest, .card-research, .card-forum, .card-alert {
                grid-column: span 1 !important;
                grid-row: span 1 !important;
                background: var(--glass-bg) !important;
            }

            .card-icon-box {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                margin-bottom: 0;
                flex-shrink: 0;
            }

            .card-icon-box svg {
                width: 22px;
                height: 22px;
            }

            /* All cards use horizontal layout on mobile */
            .bento-card .card-content {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 16px;
            }

            .bento-card h3 {
                font-size: 17px;
                margin-bottom: 4px;
            }

            .bento-card p {
                font-size: 14px;
                line-height: 1.4;
                margin: 0;
                word-break: keep-all;
            }

            .text-group {
                display: flex;
                flex-direction: column;
                flex: 1;
                min-width: 0;
            }

            .section-title {
                font-size: 28px;
                word-break: keep-all;
                overflow-wrap: break-word;
            }

            .card-research .text-group h3,
            .card-research .text-group p {
                margin: 0;
            }

            /* Workflow - Mobile */
            .workflow-section {
                padding: 60px 0;
            }

            .section-header-center {
                margin-bottom: 40px;
            }

            .steps-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .step-card {
                padding: 24px;
                text-align: left;
            }

            .step-number-glow {
                font-size: 32px;
            }

            .step-card h3 {
                font-size: 18px;
            }

            .step-card p {
                font-size: 14px;
            }

            /* Stats - Mobile */
            .stats-section {
                padding: 40px 0;
            }

            .stats-glass-panel {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                gap: 24px;
                padding: 32px 16px;
                border-radius: 24px;
            }

            .stat-item {
                flex: 1 1 80px;
                min-width: 80px;
            }

            .stat-value {
                font-size: 28px;
            }

            .stat-label {
                font-size: 11px;
            }

            .stat-divider-vertical {
                display: none;
            }

            /* Features List - Mobile */
            .detailed-features {
                padding: 60px 0;
            }

            .features-inner-grid {
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }

            .feature-number {
                font-size: 24px;
            }

            .feature-small h4 {
                font-size: 16px;
            }

            .feature-small p {
                font-size: 13px;
            }

            /* CTA - Mobile */
            .cta-section {
                padding: 60px 0;
            }

            .cta-card-glass {
                padding: 40px 24px;
                border-radius: 24px;
            }

            .cta-title {
                font-size: 28px;
            }

            .cta-desc {
                font-size: 16px;
                margin-bottom: 24px;
            }

            /* Footer - Mobile */
            .footer {
                padding: 32px 0;
            }

            .footer-content {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }

            .brand-logo {
                font-size: 16px;
            }

            .brand-name {
                font-size: 16px;
            }

            .copyright {
                font-size: 12px;
            }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
            .hero-title {
                font-size: 28px;
            }

            .hero-description {
                font-size: 14px;
            }

            .features-inner-grid {
                grid-template-columns: 1fr;
            }

            .section-title {
                font-size: 24px;
            }

            .stat-value {
                font-size: 24px;
            }

            .cta-title {
                font-size: 24px;
            }
        }
      `}</style>
    </div>
  );
}
