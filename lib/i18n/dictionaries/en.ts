import type { Dictionary } from "./index";

export const en = {
  site: {
    name: "Yu Jiseok",
    description:
      "Yu Jiseok's personal tech blog, a place to write down and share what he studies",
    ogLocale: "en_US",
    skipToContent: "Skip to content",
  },
  languageToggle: {
    label: "Language",
    ko: "한국어",
    en: "English",
  },
  home: {
    more: "More",
    artworkAlt: "Kim Whanki, 05-IV-71 #200",
  },
  posts: {
    description: "Thoughts and technologies I want to share.",
    draft: "Draft",
    edit: "Edit",
    translatedNotice: "This post was translated from Korean by AI (Claude).",
    readOriginal: "Read the original",
  },
  postNav: {
    label: "Previous and next posts",
    older: "Previous",
    newer: "Next",
  },
  toc: {
    label: "Table of contents",
  },
  codeBlock: {
    copy: "Copy code",
    copied: "Copied",
  },
  error: {
    title: "Something went wrong",
    description: "The page failed to load. Please try again in a moment.",
    retry: "Try again",
  },
  notFound: {
    description: "Page not found.",
    home: "Back to home",
    recent: "Recent posts",
  },
  atelier: {
    description: "A space for exploring interfaces",
  },
  gallery: {
    description: "Paintings I've collected",
    artists: "Artists",
    all: "All",
    viewArtwork: "View {artist} artwork larger",
    previous: "Previous",
    next: "Next",
    close: "Close",
    artistNames: {
      "park-seo-bo": "Park Seo-Bo",
      "yun-hyong-keun": "Yun Hyong-keun",
      "chung-sang-hwa": "Chung Sang-Hwa",
      "ha-chong-hyun": "Ha Chong-Hyun",
      "kim-tschang-yeul": "Kim Tschang-Yeul",
      "lee-ungno": "Lee Ungno",
      "chang-ucchin": "Chang Ucchin",
      "rhee-seundja": "Rhee Seund-ja",
      "kwon-young-woo": "Kwon Young-woo",
      "lee-dai-won": "Lee Dai-Won",
      "chun-kyung-ja": "Chun Kyung-Ja",
      "yoo-young-kuk": "Yoo Youngkuk",
      "kim-whanki": "Kim Whanki",
      "lee-ufan": "Lee Ufan",
      yujiseok: "Yu Jiseok",
    },
  },
  music: {
    description: "A space for sharing my taste in music",
    back: "Go back",
    recentDescription: "Tracks I've listened to recently",
    topTracksDescription: "The tracks I played most over the past month",
    playlistsDescription: "Spotify playlists I made",
    playlistTracks: (name: string) => `Tracks in the ${name} playlist`,
    viewOnSpotify: "View on Spotify",
  },
  resume: {
    keywords: ["web development", "frontend"],
    avatarAlt: (name: string) => `${name} profile photo`,
    contribution: "PR",
  },
  feeds: {
    rssTitle: "Yujiseok's Blog",
    rssLanguage: "en",
    llmsSummary:
      "Yu Jiseok's personal tech blog, where he writes down and shares what he studies. It covers web development: frontend, React, Next.js, and TypeScript.",
    llmsIntro:
      "This blog is run by Yu Jiseok, a frontend developer. It mostly covers React, Next.js, TypeScript, and web performance optimization.",
    llmsGallery: "Paintings I've collected.",
    pieces: (count: number) => (count === 1 ? "1 piece" : `${count} pieces`),
  },
} satisfies Dictionary;
