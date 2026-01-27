# 모여라 (MOYORA) | 2026 A:Ventures | CTO 최도윤

> **"교내/교외 모든 활동의 시작과 끝"**
>
> **The Start and End of All School Activities**

현재 어벤처스(AVentures)는 클럽 및 커뮤니티 통합 플랫폼인 **'모여라(MOYORA)'**의 고도화 및 정식 런칭을 최우선 과제로 삼고 있습니다. 학생들의 자발적인 참여를 이끌어내고, 동아리 활동과 교내/교외 이벤트를 혁신적으로 연결하는 허브 플랫폼입니다.

---

## 🚀 Project Status

*   **공식 주소 (Official URL):** [www.moyora.kr](https://www.moyora.kr/)
*   **현재 단계 (Current Phase):** **Development Phase (개발 및 안정화 단계)**
*   **주요 마일스톤 (Milestones):**
    - [x] 서비스 도메인 확보 및 호스팅 설정 (Gabia, Vercel)
    - [x] Next.js 14 (App Router) 기반 아키텍처 구축
    - [x] MongoDB 데이터베이스 연동 및 Mongoose 스키마 설계
    - [ ] PortOne 본인인증 & 결제 시스템 구축
    - [ ] 2월 민족사관고등학교 배포 및 베타 테스팅 (Beta Testing)
    - [ ] 2026-1학기 중 정식 서비스 런칭 (Official Launch)

---

## 💻 Tech Stack

### Core Framework & Language
*   ![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white) **Next.js 14**: App Router 기반의 모던 리액트 프레임워크
*   ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) **TypeScript**: 정적 타입 안정성 확보
*   ![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **React 18**: 컴포넌트 기반 UI 라이브러리

### Styling & Rendering
*   ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
*   ![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white) **WebGL / Three.js**: `@react-three/fiber`, `@react-three/drei`를 활용한 고성능 3D 모션 그래픽 및 인터랙션 구현
*   ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) **Vercel**: 최적화된 프론트엔드 배포 및 호스팅 인프라

### Backend & Database
*   ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) **MongoDB**: 유연한 도큐먼트 기반 NoSQL 데이터베이스
*   ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white) **Mongoose**: ODM(Object Data Modeling)을 통한 데이터 구조화
*   ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-black?style=for-the-badge&logo=next.js&logoColor=white) **NextAuth.js**: 안전하고 확장 가능한 인증 시스템 구현

### Tools & Utilities
*   **Zod**: 런타임 스키마 선언 및 검증
*   **Tesseract.js**: 이미지 텍스트 추출 (OCR) 기능
*   **Date-fns**: 날짜 및 시간 조작 라이브러리

---

## 🎨 Design Philosophy

'모여라'는 단순한 정보 전달을 넘어, 사용자가 **몰입할 수 있는 환경**을 제공합니다.

1.  **3D Interaction**: `Dashboard3D`, `NetworkMap3D` 등 React Three Fiber를 활용한 인터랙티브한 시각 요소를 통해 정보의 직관성을 높였습니다.
2.  **Adaptive Theming**: `next-themes`를 활용하여 라이트/다크 모드를 완벽하게 지원하며, 각 모드에 최적화된 가독성과 심미성을 제공합니다.

---

## 📂 Project Structure

```bash
📦 src
 ┣ 📂 app          # Next.js App Router Pages & Layouts
 ┣ 📂 components   # Reusable UI Components (Canvas, Common, Layouts)
 ┣ 📂 context      # React Context (State Management)
 ┣ 📂 lib          # Utility functions & Configurations
 ┗ 📂 models       # MongoDB Mongoose Models
```

---

© 2026 **A:Ventures**. All Rights Reserved.
