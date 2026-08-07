export const resumeData = {
  profile: {
    name: "유지석",
    title: "Frontend Engineer",
    introduction: [
      "사용성과 심미성의 균형을 고민하며, 기능적으로 뛰어나고 아름다운 UI 구현을 추구합니다.",
      "제품의 밑그림부터 세우는 일에 강점이 있습니다. 최근에는 멤버십 서비스와 어드민, 크리에이터 센터 3종의 신규 구축을 주도했습니다.",
      '"왜?"라는 질문으로 문제의 본질을 파악하고, 이를 바탕으로 개선책을 설계·구현하는 과정을 즐깁니다. 렌더링 구조나 CI 빌드처럼 팀 전체가 매일 부딪히는 병목을 직접 찾아 고쳐왔고, 그 과정은 블로그에 기록합니다.',
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
            "3종 프로덕트의 기초 아키텍처를 설계해 총 55페이지를 3개월 내 동시 구축",
            "CLAUDE.md·Agent Skill로 구현과 테스트 규칙을 정형화해, 도메인을 병렬 개발하고 검증하는 흐름 정착",
            "공유 설정 패키지와 features/pages/shared 레이어로 세 앱의 구조 표준화",
            "Vite·React Router v7·React Compiler 도입, 컴파일러 적용 후 리렌더 함정 전수 점검",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "멤버십 서비스 프론트엔드 구축",
          achievements: [
            "커뮤니티를 제외한 전 도메인 개발을 주도해 17개 라우트를 예정일에 배포",
            "인증은 쿠키, 변경은 서버액션으로 경로를 단일화해 기능이 늘어도 흔들리지 않는 구조 확보",
            "결제·취소·중복 제한 전 구간과 인원 마감 실시간 게이트 구축",
            "카드사 심사용 한정 배포를 별도 구성해 사업부 심사 일정 대응",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "멤버십 어드민 신규 구축",
          achievements: [
            "기술 선정부터 구현, 배포 인프라(Docker·nginx·GitHub Actions)까지 단독으로 맡아 8개 도메인 29페이지 오픈",
            "라우팅·폼 검증·테이블·에러 처리 표준을 먼저 세워 전 도메인을 같은 패턴으로 구현",
            "TipTap 에디터에 노션식 인터랙션, 이미지 리사이즈, 표 핸들, GCS 업로드 확장 구현",
            "OpenAPI 코드젠(orval)으로 백엔드 스펙 변경이 타입에 자동 반영되도록 연결",
            "단위 테스트 1,062개와 E2E 45개로 8개 도메인의 회귀를 배포 전 차단",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "포트폴리오 서비스 개발 및 2차 확대개편",
          achievements: [
            "포트폴리오 서비스 신규 구축, Masonry 레이아웃으로 콘텐츠 밀도와 시각적 다양성 확보",
            "2차 개편에서 태그 시스템 도입 (무한스크롤·실시간 검색·i18n, PC/모바일 UI 분기)",
            "URL 상태를 nuqs로 옮겨 공유·뒤로가기·SSR 결함 해소",
            "가상 스크롤 도입으로 렌더링 비용 46%, 롱태스크 시간 40.7% 감소",
            "메모이제이션 적용으로 스크롤 시 스크립트 실행 시간 42.3% 단축",
          ],
          link: "https://yujiseok.blog/writing/how-to-implement-portfolio",
          linkText: "서비스 Masonry 레이아웃 구현 회고",
        },
        {
          title: "Next.js 렌더링 전략 개선",
          achievements: [
            "강제 SSR 구조를 SSG·SSR·ISR 혼합 전략으로 재설계",
            "캐싱 도입으로 서버 응답 시간 최대 75% 단축 (800ms → 200ms)",
            "네트워크 트래픽 80%, 활성 컨테이너 수 60%를 줄여 인프라 비용 절감",
          ],
          link: "https://yujiseok.blog/writing/nextjs-rendering-optimization",
          linkText: "Next.js 렌더링 전략 개선기",
        },
        {
          title: "클라이언트 사이드 네비게이션 전환",
          achievements: [
            "불필요한 서버 사이드 네비게이션을 막는 라우팅 인터셉트 훅 구현",
            "20줄 미만의 코드로 스크립트 실행 시간 78%, 총 실행 시간 46.2% 단축",
          ],
          link: "https://yujiseok.blog/writing/improve-navigation",
          linkText: "서비스 서버 사이드 네비게이션 개선기",
        },
        {
          title: "Turborepo 기반 모노레포 전환 및 CI 빌드 성능 최적화",
          achievements: [
            "FULL TURBO 시 CI 빌드 소요 시간 최대 96% 단축 (146s → 6.5s)",
            "GitHub Actions 캐시의 구조적 한계를 분석해 GCS 기반 Remote Cache 자체 구축",
            "inputs·outputs를 앱별로 세분화하고 globalEnv를 8개에서 2개로 줄여 캐시 적중률 개선",
            "외부 CJS 패키지를 tsdown 기반 ESM으로 내재화해 빌드 파이프라인 안정화",
          ],
          link: "https://yujiseok.blog/writing/turborepo",
          linkText: "Turborepo Remote Cache 적용기",
        },
        {
          title: "디자인 시스템 구축 및 개발 handoff 최적화",
          achievements: [
            "Base UI 기반 합성 컴포넌트 13종과 아이콘 88종을 Storybook·Vitest와 함께 구축",
            "전사 4개 앱의 레거시 버튼을 일괄 교체하고 타이포·스페이싱·컬러 토큰 체계화",
            "Figma MCP로 디자인 토큰을 자동화하고 '시안에 없는 스타일은 만들지 않는다'는 규칙 정착",
          ],
          link: "",
          linkText: "",
        },
        {
          title: "GENCON 컨퍼런스 랜딩 페이지 개발",
          achievements: [
            "랜딩 페이지와 설문 기능으로 약 1,000명의 컨퍼런스 참여자 모객",
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
      description: "공식 문서의 package.json 실행 스크립트 경로 오류 수정",
      link: "https://github.com/vercel/turborepo/pull/11551",
    },
    {
      title: "수파베이스 공식 문서",
      period: "2025.05",
      description: "인증(Apple REST API) 관련 링크 수정",
      link: "https://github.com/supabase/supabase/pull/35404",
    },
    {
      title: "리액트 공식 문서",
      period: "2023.03",
      description: "예제 코드의 문법 오류 수정",
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
      details: ["리액트 프로젝트 코드 리뷰와 기술 피드백 제공"],
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
