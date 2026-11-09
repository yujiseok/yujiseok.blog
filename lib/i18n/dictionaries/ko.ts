export const ko = {
  site: {
    name: "유지석",
    description: "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그",
    ogLocale: "ko_KR",
    skipToContent: "본문으로 건너뛰기",
  },
  languageToggle: {
    label: "언어",
    ko: "한국어",
    en: "English",
  },
  home: {
    more: "더 보기",
    artworkAlt: "김환기, 05-IV-71 #200",
  },
  posts: {
    description: "공유하고 싶은 생각 또는 기술들을 소개합니다.",
    draft: "초안",
    edit: "수정",
    translatedNotice: "AI(Claude)가 한국어에서 번역한 글입니다.",
    readOriginal: "원문 보기",
  },
  postNav: {
    label: "이전 · 다음 글",
    older: "이전 글",
    newer: "다음 글",
  },
  toc: {
    label: "목차",
  },
  codeBlock: {
    copy: "코드 복사",
    copied: "복사됨",
  },
  error: {
    title: "문제가 발생했습니다",
    description: "페이지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    retry: "다시 시도",
  },
  notFound: {
    description: "페이지를 찾을 수 없습니다.",
    home: "홈으로 돌아가기",
    recent: "최근 글",
  },
  atelier: {
    description: "인터페이스를 탐구하는 공간",
  },
  gallery: {
    description: "모아 둔 그림",
    artists: "작가",
    all: "전체",
    /** 클라이언트 컴포넌트로 가는 값이라 함수가 아니라 `{artist}` 자리표시자 템플릿이다 */
    viewArtwork: "{artist} 작품 크게 보기",
    previous: "이전",
    next: "다음",
    close: "닫기",
    /** 폴더명 → 표기. 한국어는 ARTISTS의 이름을 그대로 쓴다 */
    artistNames: {} as Record<string, string>,
  },
  music: {
    description: "음악적 취향을 나누는 공간",
    back: "뒤로 가기",
    recentDescription: "최근에 들은 음악 목록",
    topTracksDescription: "최근 한 달간 가장 많이 들은 음악",
    playlistsDescription: "내가 만든 스포티파이 플레이리스트 모음",
    playlistTracks: (name: string) => `${name} 플레이리스트의 트랙 목록`,
    viewOnSpotify: "스포티파이에서 보기",
  },
  resume: {
    keywords: ["웹 개발", "프론트엔드"],
    avatarAlt: (name: string) => `${name} 프로필 이미지`,
    contribution: "기여",
  },
  feeds: {
    rssTitle: "Yujiseok's Blog",
    rssLanguage: "ko",
    llmsSummary:
      "공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그. 프론트엔드 개발, React, Next.js, TypeScript 등 웹 개발 기술을 다룹니다.",
    llmsIntro:
      "이 블로그는 프론트엔드 개발자 유지석이 운영하는 기술 블로그입니다. 주로 React, Next.js, TypeScript, 웹 성능 최적화 등의 주제를 다룹니다.",
    llmsGallery: "모아 둔 그림.",
    pieces: (count: number) => `${count}점`,
  },
};
