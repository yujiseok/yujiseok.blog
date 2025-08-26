export const resumeData = {
  profile: {
    name: "유지석",
    title: "Frontend Engineer",
    introduction: [
      "사용성과 심미성의 균형을 고민하며, 기능적으로 뛰어나고 아름다운 UI 구현을 추구합니다.",
      "Next.js SSR의 비효율성을 발견한 뒤 SSG/ISR로 전환하여 서버 응답 시간을 75% 개선한 경험이 있습니다.",
      '"왜?"라는 질문으로 문제의 본질을 파악하고 해결책을 만들어 갑니다. 개발 과정과 기술적 의사결정을 블로그에 기록하고, 동료와 함께 성장하는 문화를 추구합니다.',
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
          title: "서비스 렌더링 전략 최적화",
          description:
            "서비스 내 Next.js force-dynamic 설정으로 인한 강제 SSR 문제 분석 및 렌더링 전략 최적화",
          achievements: [
            "서버 응답 시간 60~75% 단축 (800ms → 200ms)",
            "서버 부하 및 트래픽 감소로 인프라 비용 절감",
          ],
          link: "https://yujiseok.blog/writing/nextjs-rendering-optimization",
          linkText: "Next.js 렌더링 전략 개선기",
        },
        {
          title: "Coloso 포트폴리오 서비스 개발 및 성능 고도화",
          description:
            "대용량 이미지 환경에서 동적 Masonry 레이아웃, 가상 스크롤 등을 적용하여 렌더링 성능 최적화",
          achievements: [
            "월 평균 약 6.1만 세션, 5.8만 사용자 유입, 3.4만 신규 사용자 창출",
            "가상 스크롤(Virtual Scrolling) 도입으로 렌더링 비용 46.8% 단축",
            "메모이제이션을 통한 스크립팅 시간 42.3% 추가 단축",
          ],
          link: "https://yujiseok.blog/writing/how-to-implement-portfolio",
          linkText: "서비스 Masonry 레이아웃 구현 회고",
        },
        {
          title: "페이지 클라이언트 사이드 네비게이션 전환",
          description:
            "페이지 전환 시 발생하는 깜빡임 현상 해결 및 사용자 경험 개선",
          achievements: [
            "불필요한 페이지 로드 제거로 총 실행 시간 46.2%, 스크립팅 시간 78% 단축",
            "20줄 미만의 코드로 라우팅 로직을 개선하여 유지보수성 및 코드 효율성 증대",
          ],
          link: "https://yujiseok.blog/writing/improve-navigation",
          linkText: "서비스 서버 사이드 네비게이션 개선기",
        },
        {
          title: "GENCON 컨퍼런스 랜딩사이트",
          description:
            "컨퍼런스를 위한 인터랙티브 랜딩 페이지 구축 및 비즈니스 목표 달성",
          achievements: [
            "인터랙션을 활용한 사용자 몰입 경험 증대",
            "랜딩 페이지 및 설문 기능으로 약 1,000명의 컨퍼런스 참여자 모객 성공",
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
      title: "패스트캠퍼스 데브 캠프 멘토",
      period: "2024.05 - 2025.01",
      description:
        "패스트캠퍼스 데브 캠프에서 2기수에 걸쳐 40회 이상의 실시간 멘토링 진행",
      color: "#fc1c49",
      details: [
        "멘티들에게 기술적 조언과 피드백을 제공하여 성장할 수 있도록 도움",
        "리액트를 활용한 프로젝트의 코드 리뷰 수행",
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
