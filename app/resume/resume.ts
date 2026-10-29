export const resumeData = {
  profile: {
    name: "유지석",
    title: "Frontend Developer",
    introduction: [
      "콜로소에서 글로벌 커머스 서비스와 크리에이터 멤버십의 프론트엔드 개발을 담당하고 있습니다.",
    ],
  },
  workExperience: [
    {
      company: "주식회사 데이원컴퍼니 Coloso",
      period: "2023.11 - 현재",
      url: "https://coloso.co.kr",
      color: "#ffb200",
      projects: [
        {
          title: "크리에이터 멤버십 신규 구축 및 운영",
          achievements: [
            "에이전트 기반 워크플로우를 설계해 기획 확인부터 구현·QA·릴리즈까지 진행, 고객 서비스 20개·어드민 34개 화면을 근무일 약 75일 만에 일정 내 동시 출시",
            "반복 절차는 Claude Code 스킬 8종으로 자동화하고, 결제·정원·환불 등 금전·정합성 영역 하네스 설계",
            "QA의 TC 기대 결과를 QA 진입 전 Vitest·Playwright로 사전 검증해, 이전 프로젝트(포트폴리오 서비스) 대비 코드 규모 2.5배에서도 1차 QA Defect 밀도 약 56% 감소 (천 줄당 8.5건 → 3.7건)",
          ],
          link: "https://yujiseok.blog/posts/delegate-to-agents",
          linkText: "에이전트에게 일 맡겨보기",
        },
        {
          title:
            "Next.js 렌더링 전략 개선을 통한 서비스 성능 및 인프라 효율 최적화",
          achievements: [
            "전 페이지에 강제되던 SSR 구조를 페이지 특성별 SSG·SSR·ISR 혼합 전략으로 전환하고 Next.js 캐시 도입",
            "캐싱 도입으로 응답 시간 75% 단축 (800ms → 200ms)",
            "네트워크 트래픽 80%, 활성 컨테이너 수 60% 절감으로 GCP 인프라 비용 절감",
          ],
          link: "https://yujiseok.blog/posts/nextjs-rendering-optimization",
          linkText: "Next.js 렌더링 전략 개선기",
        },
        {
          title: "Turborepo 기반 모노레포 전환 및 CI 빌드 성능 최적화",
          achievements: [
            "Turborepo 도입 및 tsdown 중심 빌드 체계 구축으로 패키지 간 의존성 관리 효율화",
            "GitHub Actions 캐시의 커밋 SHA 기반 키와 브랜치 간 공유 제약을 해결하기 위해 GCS 기반 Turborepo Remote Cache 구축",
            "전체 캐시 적중(FULL TURBO) 시 CI 빌드 시간 96% 단축 (146초 → 6초)",
          ],
          link: "https://yujiseok.blog/posts/turborepo",
          linkText: "Turborepo Remote Cache 적용기",
        },
        {
          title: "콜로소 서비스 디자인 시스템 기반 설계 및 구축",
          achievements: [
            "variants 기반 아키텍처를 설계하고 KR/JP/INTL 서비스별로 나뉘어 있던 컴포넌트를 통합해 UI 일관성 확보",
            "Figma MCP 기반 디자인 토큰 자동화, Storybook 컴포넌트 문서화, Vitest 테스트 환경 구축",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "포트폴리오 서비스 개발 및 성능 고도화",
          achievements: [
            "Masonry 레이아웃 구현으로 콘텐츠의 시각적 다양성과 정보 밀도 향상",
            "무한 스크롤 환경에 가상 스크롤을 도입해 렌더링 시간 46%, 롱태스크 시간 41% 감소",
            "메모이제이션으로 불필요한 리렌더링을 방지해 스크롤 중 스크립트 실행 시간 42% 단축",
          ],
          link: "https://yujiseok.blog/posts/how-to-implement-portfolio",
          linkText: "서비스 Masonry 레이아웃 구현 회고",
        },
        {
          title: "클라이언트 사이드 네비게이션 전환",
          achievements: [
            "동적으로 렌더링된 HTML 내부 링크가 풀 페이지 리로드(서버 사이드 네비게이션)를 일으키던 문제를 해결하기 위해, 링크 클릭을 가로채 클라이언트 라우팅으로 전환하는 인터셉트 훅 구현",
            "불필요한 페이지 로드 제거로 스크립트 실행 시간 78%, 총 실행 시간 46% 단축",
          ],
          link: "https://yujiseok.blog/posts/improve-navigation",
          linkText: "서비스 서버 사이드 네비게이션 개선기",
        },
        {
          title: "GENCON 컨퍼런스 랜딩 페이지 개발",
          achievements: [
            "스크롤 기반 애니메이션, 타입라이터 효과 등 인터랙션을 통한 사용자 몰입 경험 제공",
            "랜딩 페이지와 설문 기능으로 컨퍼런스 참여자 약 1,000명 모객에 기여",
          ],
          link: "https://yujiseok.blog/posts/2024-gencon",
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
      blogLink: "https://yujiseok.blog/posts/how-i-contributed-react-docs",
      blogLinkText: "React 공식 문서 기여 회고",
    },
  ],
  otherExperience: [
    {
      title: "김민태의 데브 캠프 멘토",
      period: "2024.05 - 2025.01",
      description:
        "2개 기수에서 40회 이상 실시간 멘토링 진행 및 React 프로젝트 코드 리뷰·기술 피드백 제공",
      color: "#fc1c49",
      details: [],
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
