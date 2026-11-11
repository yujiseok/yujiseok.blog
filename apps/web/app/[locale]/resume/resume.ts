/*
 * 한국어(resume.ts)와 영어(resume.en.ts)가 같은 모양을 지키게 하는 계약이다.
 * 글 링크는 URL이 아니라 slug로 적는다 — 언어별 주소와 번역 유무는 resolve.ts가 정한다.
 */
export interface Resume {
  profile: {
    name: string;
    title: string;
    introduction: readonly string[];
  };
  workExperience: readonly {
    company: string;
    period: string;
    url: string;
    color: string;
    projects: readonly {
      title: string;
      /** 왜 한 일인지 한 줄. 없으면 첫 성과가 그 역할을 한다 */
      summary?: string;
      achievements: readonly string[];
      postSlug?: string;
      linkText?: string;
    }[];
  }[];
  openSource: readonly {
    title: string;
    period: string;
    description: string;
    link: string;
    blogSlug?: string;
    blogLinkText?: string;
  }[];
  otherExperience: readonly {
    title: string;
    period: string;
    description: string;
    color: string;
    details: readonly string[];
  }[];
  contact: { email: string; github: string; blog: string };
  education: readonly { school: string; period: string }[];
}

export const resumeData = {
  profile: {
    name: "유지석",
    title: "Frontend Developer",
    introduction: [
      "콜로소에서 글로벌 커머스 서비스의 프론트엔드를 개발하고 있습니다. 더 나은 방법을 고민하고, 직접 적용해 변화를 확인하는 과정을 좋아합니다.\n사용자 경험과 서비스 성능을 개선하며, 그 과정 속에서 내린 기술적 의사결정과 경험을 블로그에 기록합니다.",
      "경험과 배움을 동료와 함께 공유하는 문화를 지향합니다.",
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
          summary:
            "구독·단건 결제부터 환불까지 지원하는 크리에이터 멤버십 서비스 구축",
          achievements: [
            "기획 확인부터 구현·QA·릴리즈까지 진행해, 고객 서비스 20개·어드민 34개 화면을 근무일 약 75일 만에 출시",
            "QA 테스트 케이스의 기대 결과를 Vitest·Playwright로 사전 검증하고, 이전 프로젝트 대비 1차 QA 결함 밀도 약 56% 감소(코드 천 줄당 8.5건 → 3.7건)",
            "반복되는 개발 절차를 에이전트 스킬 8종으로 자동화하고, 결제·정원·환불의 거래 정합성을 검증하는 하네스 구축",
          ],
          postSlug: "delegate-to-agents",
          linkText: "에이전트에게 일 맡겨보기",
        },
        {
          title: "서버 인증 공통 패키지 구축 및 HttpOnly 쿠키 전환",
          summary:
            "XSS에 의한 토큰 탈취 위험을 줄이고, 클라이언트 중심의 인증 처리와 세 서비스의 중복 인증 로직을 개선",
          achievements: [
            "클라이언트에서 관리하던 인증 토큰을 HttpOnly 쿠키로 옮기고, Route Handler 기반 BFF로 API 요청을 중계",
            "클라이언트에서 수행하던 인증 검증과 페이지 접근 제어를 Next.js proxy로 옮겨, 서버에서 로그인 여부를 확인하도록 개선",
            "KR·JP·INTL 인증 로직을 공통 패키지로 통합해 앱별 인증 코드 82% 감소(826줄 → 148줄), OAuth는 provider별 어댑터로 분리",
          ],
        },
        {
          title:
            "Next.js 렌더링 전략 개선을 통한 서비스 성능 및 인프라 효율 최적화",
          summary:
            "force-dynamic 설정으로 모든 페이지가 요청마다 동적으로 렌더링되어 서버 부하가 컸던 문제",
          achievements: [
            "전 페이지에 강제되던 동적 렌더링을 페이지 특성에 따라 SSG·SSR·ISR로 나누고 Next.js 캐시 적용",
            "캐싱 적용으로 p95 응답 시간 75% 단축 (800ms → 200ms)",
            "네트워크 트래픽 80%, 활성 컨테이너 수 60% 감소로 GCP 인프라 비용 절감",
          ],
          postSlug: "nextjs-rendering-optimization",
          linkText: "Next.js 렌더링 전략 개선기",
        },
        {
          title: "Turborepo 기반 모노레포 전환 및 CI 빌드 성능 최적화",
          summary:
            "패키지 증가로 CI 빌드가 느려지고, 커밋·브랜치에 종속된 캐시 구성으로 재사용이 제한되던 문제",
          achievements: [
            "Turborepo와 tsdown을 도입해 패키지 간 의존성을 반영한 빌드 파이프라인 구축",
            "기존 GitHub Actions 캐시를 GCS 기반 Remote Cache로 전환해 브랜치 간 캐시 재사용",
            "전체 캐시 적중(FULL TURBO) 시 CI 빌드 시간 약 96% 단축 (146초 → 6.5초)",
          ],
          postSlug: "turborepo",
          linkText: "Turborepo Remote Cache 적용기",
        },
        {
          title: "포트폴리오 서비스 개발 및 성능 고도화",
          summary:
            "다양한 크기의 작품을 Masonry로 배치하고, 증가하는 데이터의 렌더링 부하를 줄여야 했던 프로젝트",
          achievements: [
            "뷰포트별 배치 정책과 이미지 비율을 반영한 Masonry 레이아웃 구현",
            "가상 스크롤을 도입해 렌더링 시간 47%, 롱태스크 지속 시간 41% 감소",
            "메모이제이션으로 불필요한 리렌더링을 줄여 스크롤 중 스크립트 실행 시간 42% 단축",
          ],
          postSlug: "how-to-implement-portfolio",
          linkText: "서비스 Masonry 레이아웃 구현 회고",
        },
        {
          title: "클라이언트 사이드 네비게이션 전환",
          summary:
            "CMS에서 주입한 HTML의 내부 링크 이동 시 전체 페이지가 리로드되던 문제",
          achievements: [
            "이벤트 위임으로 내부 링크 클릭을 가로채고, Next.js router를 통해 클라이언트 사이드 네비게이션으로 연결하는 공통 훅 구현",
            "전체 페이지 리로드를 제거해 스크립트 실행 시간 78%, 측정 구간 총 소요 시간 46% 단축",
          ],
          postSlug: "improve-navigation",
          linkText: "서비스 서버 사이드 네비게이션 개선기",
        },
        {
          title: "콜로소 서비스 디자인 시스템 기반 설계 및 구축",
          achievements: [
            "KR·JP·INTL의 공통 UI 컴포넌트를 통합하고, 서비스별 차이를 variants로 관리하도록 설계",
            "Figma MCP 기반 디자인 토큰 자동화, Storybook 컴포넌트 문서화, Vitest 테스트 환경 구축",
          ],
        },
        {
          title: "GENCON 컨퍼런스 랜딩 페이지 개발",
          achievements: [
            "스크롤 애니메이션과 타입라이터 인터랙션, 설문 기능을 구현해 컨퍼런스 참여자 약 1,000명 모객에 기여",
          ],
          postSlug: "2024-gencon",
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
      blogSlug: "how-i-contributed-react-docs",
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
  },
  education: [
    {
      school: "한성대학교 패션디자인 전공",
      period: "2015.03 - 2022.08",
    },
  ],
} satisfies Resume;
