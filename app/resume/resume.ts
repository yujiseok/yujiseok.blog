export const resumeData = {
  profile: {
    name: "유지석",
    title: "Frontend Engineer",
    introduction: [
      "사용성과 심미성의 균형을 고민하며, 기능적으로 뛰어나고 아름다운 UI 구현을 추구합니다.",
      '"왜?"라는 질문으로 문제의 본질을 파악하고, 이를 바탕으로 개선책을 설계·구현하는 과정을 즐깁니다. 이런 과정에서 Next.js SSR 사용의 비효율성을 발견한 뒤 SSG/ISR로 전환하여 서버 응답 시간을 최대 75% 개선한 경험이 있습니다.',
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
            "강제 동적 렌더링(SSR)으로 구현된 기존 구조를 SSG/ISR 기반으로 전환하여 렌더링 성능 최적화",
            "캐싱 도입으로 서버 응답 시간 최대 75% 단축 (800ms → 200ms)",
            "네트워크 트래픽 80% 및 활성 컨테이너 수 60% 절감하여 GCP 인프라 비용 절감 기여",
          ],
          link: "https://yujiseok.blog/writing/nextjs-rendering-optimization",
          linkText: "Next.js 렌더링 전략 개선기",
        },
        {
          title: "포트폴리오 서비스 개발 및 성능 고도화",
          achievements: [
            "동적 Masonry 레이아웃을 구현하여 콘텐츠의 시각적 다양성 및 정보 밀도를 극대화하고, 서비스 초기 성장(월 평균 6.3만 세션, 신규 사용자 2.8만 명) 기여",
            "무한 스크롤 환경의 렌더링 최적화를 위한 가상 스크롤 도입, 렌더링 비용 46% 및 메인 스레드를 차단하는 롱태스크 시간을 40.7% 감소시켜 사용자 경험 개선",
            "불필요한 리렌더링 방지를 위한 메모이제이션 적용, 스크롤 시 발생하는 스크립트 실행 시간 42.3% 단축",
          ],
          link: "https://yujiseok.blog/writing/how-to-implement-portfolio",
          linkText: "서비스 Masonry 레이아웃 구현 회고",
        },
        {
          title: "클라이언트 사이드 네비게이션 전환",
          achievements: [
            "동적으로 주입되는 HTML의 비효율적인 서버 사이드 네비게이션 문제 해결을 위한 라우팅 인터셉트 커스텀 훅 설계 및 구현",
            "클라이언트 사이드 네비게이션 적용으로 불필요한 페이지 로드 제거, 페이지 총 실행 시간 46.2%, 스크립트 실행 시간 78% 단축시켜 사용자 경험 극대화",
            "20줄 미만의 커스텀 훅으로 문제를 해결하여 코드 효율성 및 유지보수성 증대",
          ],
          link: "https://yujiseok.blog/writing/improve-navigation",
          linkText: "서비스 서버 사이드 네비게이션 개선기",
        },
        {
          title: "GENCON 컨퍼런스 랜딩 페이지 개발",
          achievements: [
            "스크롤 기반 애니메이션, 타입라이터 효과 등 동적 인터랙션 구현을 통한 사용자 몰입 경험 제공",
            "랜딩 페이지와 설문 기능을 통해 약 1,000명의 컨퍼런스 참여자 모객 및 비즈니스 목표 달성 직접 기여",
          ],
          link: "https://yujiseok.blog/writing/2024-gencon",
          linkText: "젠콘 랜딩 페이지 개발 회고",
        },
      ],
    },
  ],
  openSource: [
    {
      title: "수파베이스 공식 문서 기여",
      period: "2025.05",
      description: "공식 문서 내 인증(Apple REST API) 관련 링크 수정 기여",
      link: "https://github.com/supabase/supabase/pull/35404",
    },
    {
      title: "리액트 공식 문서 기여",
      period: "2023.03",
      description: "리액트 공식 문서 예제 코드의 문법 오류 수정 기여",
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
