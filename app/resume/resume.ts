export const resumeData = {
  profile: {
    name: "유지석",
    title: "Frontend Engineer",
    introduction: [
      "사용성과 심미성의 균형을 고민하며, 기능적으로 뛰어나고 아름다운 UI 구현을 추구합니다.",
      '"왜?"라는 질문으로 문제의 본질을 파악하고, 이를 바탕으로 개선책을 설계·구현하는 과정을 즐깁니다. 이런 과정에서 서비스의 SSR로 강제되던 구조를 SSG와 SSR 병행 구조로 개선하고, Next 캐시를 적용해 서버 응답 시간을 최대 75% 단축한 경험이 있습니다.',
      "개발 과정과 기술적 의사결정을 블로그에 기록하고, 동료와 함께 성장하는 문화를 지향합니다.",
    ],
  },
  careers: [
    {
      company: "주식회사 데이원컴퍼니 Coloso",
      period: "2023.11 - 현재",
      url: "https://coloso.co.kr",
      color: "#ffb200",
      projects: [
        {
          title:
            "Next.js 렌더링 전략 개선을 통한 서비스 성능 및 인프라 효율 최적화",
          achievements: [
            "강제 SSR 구조를 개선하여 SSG + SSR + ISR 혼합 전략 및 Next.js 내장 캐시 도입",
            "캐싱 도입으로 응답 시간 최대 75% 단축 (800ms → 200ms)",
            "네트워크 트래픽 80% 및 활성 컨테이너 수 60% 절감하여 GCP 인프라 비용 절감 기여",
          ],
          link: "https://yujiseok.blog/writing/nextjs-rendering-optimization",
          linkText: "Next.js 렌더링 전략 개선기",
        },
        {
          title: "Turborepo 기반 모노레포 전환 및 CI 빌드 성능 최적화",
          achievements: [
            "Turborepo 도입 및 tsdown 중심의 빌드 체계를 구축하여 패키지 간 의존성 관리 효율화",
            "GitHub Actions를 활용한 리모트 캐싱 전략 도입으로 CI 빌드 재사용성 극대화",
            "FULL TURBO 시 빌드 소요 시간 최대 99.6% 단축 (146s → 0.6s)",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "콜로소 서비스 디자인 시스템 기반 설계 및 구축",
          achievements: [
            "variants 기반 시스템 아키텍처 설계 및 패키지 구조화",
            "KR/JP/INTL 글로벌 서비스 내 핵심 컴포넌트 통합으로 UI 일관성 확보",
            "Figma MCP 기반 디자인 토큰 추출 자동화로 수동 작업 효율 개선",
            "Storybook 및 Vitest 도입으로 협업 기준 정립 및 컴포넌트 안정성 확보",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "포트폴리오 서비스 개발 및 성능 고도화",
          achievements: [
            "Masonry 레이아웃을 구현하여 콘텐츠의 시각적 다양성 및 정보 밀도를 극대화하고 성장 기여",
            "무한 스크롤 환경의 최적화를 위한 가상 스크롤 도입, 렌더링 비용 46% 및 롱태스크 시간을 40.7% 감소시켜 UX 개선",
            "리렌더링 방지를 위한 메모이제이션 적용, 스크롤 시 발생하는 스크립트 실행 시간 42.3% 단축",
          ],
          link: "https://yujiseok.blog/writing/how-to-implement-portfolio",
          linkText: "서비스 Masonry 레이아웃 구현 회고",
        },
        {
          title: "클라이언트 사이드 네비게이션 전환",
          achievements: [
            "동적 HTML 렌더 시 불필요한 서버 사이드 네비게이션을 방지하는 라우팅 인터셉트 훅 구현",
            "20줄 미만의 코드로 불필요 페이지 로드 제거, 스크립트 실행 시간 78% 단축 및 UX 극대화 (총 실행 시간 46.2% ↓)",
          ],
          link: "https://yujiseok.blog/writing/improve-navigation",
          linkText: "서비스 서버 사이드 네비게이션 개선기",
        },
        {
          title: "GENCON 컨퍼런스 랜딩 페이지 개발",
          achievements: [
            "스크롤 기반 애니메이션, 타입라이터 효과 등 인터랙션을 통한 사용자 몰입 경험 제공",
            "랜딩 페이지와 설문 기능을 통해 약 1,000명의 컨퍼런스 참여자 모객 및 비즈니스 목표 달성",
          ],
          link: "https://yujiseok.blog/writing/2024-gencon",
          linkText: "젠콘 랜딩 페이지 개발 회고",
        },
      ],
    },
  ],
  openSource: [
    {
      title: "Turborepo",
      period: "2026.01",
      description: "package.json의 공식 문서 실행 스크립트 경로 오류 수정",
      link: "https://github.com/vercel/turborepo/pull/11551",
    },
    {
      title: "수파베이스 공식 문서",
      period: "2025.05",
      description: "공식 문서 내 인증(Apple REST API) 관련 링크 수정",
      link: "https://github.com/supabase/supabase/pull/35404",
    },
    {
      title: "리액트 공식 문서",
      period: "2023.03",
      description: "리액트 공식 문서 예제 코드의 문법 오류 수정",
      link: "https://github.com/reactjs/react.dev/pull/5791",
      blogLink: "https://yujiseok.blog/writing/how-i-contributed-react-docs",
      blogLinkText: "React 공식 문서 기여 회고",
    },
  ],
  etc: [
    {
      title: "김민태의 데브 캠프 멘토",
      period: "2024.05 - 2025.01",
      description:
        "패스트캠퍼스 데브 캠프에서 2기에 걸쳐 40회 이상의 실시간 멘토링 진행",
      color: "#fc1c49",
      details: [
        "멘티들에게 기술적 조언 및 피드백 제공",
        "리액트를 활용한 프로젝트 코드 리뷰 수행",
      ],
    },
  ],
  contact: {
    email: "koesijuy@gmail.com",
    github: "https://github.com/yujiseok",
    blog: "https://yujiseok.blog",
    phone: "010-8555-1095",
  },
  education: [
    {
      school: "한성대학교 패션디자인 전공",
      period: "2015.03 - 2022.08",
    },
  ],
} as const;
