export const resumeData = {
  profile: {
    name: "유지석",
    title: "Frontend Engineer",
    introduction: [
      "사용성과 심미성의 균형을 고민하며, 기능적으로 뛰어나고 아름다운 UI 구현을 추구합니다.",
      '"왜?"라는 질문으로 문제의 본질을 파악하고, 이를 바탕으로 개선책을 설계·구현하는 과정을 즐깁니다. 이런 과정에서 SSR로 강제되던 서비스 구조를 SSG, SSR, ISR 혼합 전략으로 개선하고, Next.js 캐시를 적용해 서버 응답 시간을 최대 75% 단축한 경험이 있습니다.',
      "개발 과정과 기술적 의사결정을 블로그에 기록하고, 동료와 함께 성장하는 문화를 지향합니다.",
    ],
  },
  workExperience: [
    {
      company: "주식회사 데이원컴퍼니",
      brand: "Coloso",
      period: "2023.11 - 현재",
      url: "https://coloso.co.kr",
      projects: [
        {
          title: "멤버십 플랫폼 3종 아키텍처 및 AI 개발 환경 설계",
          achievements: [
            "멤버십 서비스·멤버십 어드민·크리에이터 센터 3종의 기초 아키텍처를 주도 설계해 총 55페이지를 3개월 내 동시 구축",
            "CLAUDE.md·Agent Skill로 아키텍처와 컨벤션을 문서화하여, 기획부터 QA까지 반복 업무를 AI로 실행 가능한 단위로 정리",
            "creator-config 공유 설정 패키지와 features/pages/shared 레이어로 세 앱이 같은 구조를 쓰도록 표준화",
            "Vite·React Router v7·React Compiler 툴체인을 정리하고, 컴파일러 도입 후 리렌더 함정을 전수 점검",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "멤버십 서비스 프론트엔드 구축",
          achievements: [
            "커뮤니티를 제외한 전 도메인을 주도 개발, 스캐폴딩부터 약 3개월 만에 17개 라우트를 예정일 정시 배포",
            "인증을 쿠키 단일 출처로, 모든 변경을 서버액션 단일 경로로 강제해 기능이 늘어도 흔들리지 않는 데이터 흐름 확보",
            "PortOne 결제 전 구간과 인원 마감 실시간 게이트 구축, 카드사 심사용 한정 배포를 별도 구성해 사업부 심사 일정 대응",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "멤버십 어드민 신규 구축",
          achievements: [
            "기술 선정부터 아키텍처·구현·배포 인프라(Docker·nginx·GitHub Actions)까지 단독으로 맡아 8개 도메인 29페이지 오픈",
            "라우팅·폼 검증·테이블·에러 처리 표준을 먼저 세우고 전 도메인과 피처를 같은 패턴으로 구현",
            "TipTap 기반 에디터에 노션식 인터랙션, 이미지 리사이즈·표 핸들, GCS 업로드 확장을 구현",
            "OpenAPI 코드젠(orval)으로 백엔드 스펙 변경이 타입에 자동 반영되게 만들어, 미완성 API 구간을 저비용으로 실연동 교체",
            "단위 테스트 1,062개와 E2E 45개로 신규 제품의 회귀 안전망 확보",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "포트폴리오 서비스 개발 및 2차 확대개편",
          achievements: [
            "Masonry 레이아웃으로 콘텐츠 밀도와 시각적 다양성을 확보한 포트폴리오 서비스 신규 구축",
            "가상 스크롤 도입으로 렌더링 비용 46%, 롱태스크 시간 40.7% 감소",
            "메모이제이션 적용으로 스크롤 시 스크립트 실행 시간 42.3% 단축",
            "2차 개편에서 태그 시스템(PC 팝오버·모바일 바텀시트, 무한스크롤, as-you-type 검색, i18n) 신규 구축",
            "URL 상태를 커스텀 훅에서 nuqs로 옮겨 공유·뒤로가기·SSR 결함 해소",
          ],
          link: "https://yujiseok.blog/writing/how-to-implement-portfolio",
          linkText: "서비스 Masonry 레이아웃 구현 회고",
        },
        {
          title: "Turborepo 기반 모노레포 전환 및 CI 빌드 성능 최적화",
          achievements: [
            "FULL TURBO 시 CI 빌드 소요 시간 최대 96% 단축 (146s → 6.5s)",
            "GitHub Actions 캐시의 한계(커밋 SHA 기반 키, 브랜치 격리)를 분석해 GCS 기반 Remote Cache 자체 구축",
            "turbo.json의 inputs·outputs를 앱·패키지별로 세분화하고 globalEnv를 8개에서 2개로 줄여 캐시 적중률 개선",
            "외부 CJS 패키지(@day1co/*)를 tsdown 기반 ESM으로 내재화해 빌드 파이프라인 안정화",
          ],
          link: "https://yujiseok.blog/writing/turborepo",
          linkText: "Turborepo Remote Cache 적용기",
        },
        {
          title:
            "Next.js 렌더링 전략 개선을 통한 서비스 성능 및 인프라 효율 최적화",
          achievements: [
            "캐싱 도입으로 서버 응답 시간 최대 75% 단축 (800ms → 200ms)",
            "강제 SSR 구조를 SSG·SSR·ISR 혼합 전략으로 재설계",
            "네트워크 트래픽 80%, 활성 컨테이너 수 60% 절감하여 GCP 인프라 비용 절감 기여",
          ],
          link: "https://yujiseok.blog/writing/nextjs-rendering-optimization",
          linkText: "Next.js 렌더링 전략 개선기",
        },
        {
          title: "디자인 시스템 구축 및 디자인-개발 handoff 최적화",
          achievements: [
            "Base UI 기반 합성 컴포넌트 13종과 아이콘 88종을 Storybook·Vitest와 함께 구축",
            "전사 4개 앱의 레거시 버튼을 일괄 교체하고 타이포·스페이싱·시맨틱 컬러 토큰 체계화",
            "Figma MCP로 디자인 토큰을 자동화하고 '시안에 없는 스타일은 만들지 않는다'를 협업 규칙으로 정착",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "클라이언트 사이드 네비게이션 전환",
          achievements: [
            "동적 HTML 렌더 시 불필요한 서버 사이드 네비게이션을 막는 라우팅 인터셉트 훅 구현",
            "20줄 미만의 코드로 불필요한 페이지 로드를 제거해 스크립트 실행 시간 78%, 총 실행 시간 46.2% 단축",
          ],
          link: "https://yujiseok.blog/writing/improve-navigation",
          linkText: "서비스 서버 사이드 네비게이션 개선기",
        },
        {
          title: "GENCON 컨퍼런스 랜딩 페이지 개발",
          achievements: [
            "랜딩 페이지와 설문 기능으로 약 1,000명의 컨퍼런스 참여자를 모객해 비즈니스 목표 달성",
            "스크롤 기반 애니메이션과 타입라이터 효과로 사용자 몰입 경험 설계",
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
  otherExperience: [
    {
      title: "김민태의 데브 캠프 멘토",
      period: "2024.05 - 2025.01",
      description:
        "패스트캠퍼스 데브 캠프에서 2기에 걸쳐 40회 이상의 실시간 멘토링 진행",
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
