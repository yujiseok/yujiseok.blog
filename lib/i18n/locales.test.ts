import { describe, expect, it } from "vitest";

import {
  isLocale,
  languageTogglePath,
  localeCookie,
  localizedPath,
  pickLocale,
  stripLocale,
  swapLocale,
} from "./locales";

describe("localeCookie", () => {
  it("사이트 전체에 1년간 유지되는 쿠키 문자열을 만든다", () => {
    expect(localeCookie("en")).toBe(
      "NEXT_LOCALE=en; Path=/; Max-Age=31536000; SameSite=Lax",
    );
  });
});

describe("isLocale", () => {
  it("지원하는 언어만 통과시킨다", () => {
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("localizedPath", () => {
  it("경로 앞에 언어를 붙인다", () => {
    expect(localizedPath("en", "/posts/x")).toBe("/en/posts/x");
    expect(localizedPath("ko", "/music")).toBe("/ko/music");
  });

  it("루트는 슬래시 없이 언어만 남긴다", () => {
    expect(localizedPath("en", "/")).toBe("/en");
  });

  it("쿼리와 해시를 보존한다", () => {
    expect(localizedPath("en", "/gallery?artist=a")).toBe(
      "/en/gallery?artist=a",
    );
    expect(localizedPath("en", "/posts/x#intro")).toBe("/en/posts/x#intro");
  });
});

describe("stripLocale", () => {
  it("접두사를 뗀다", () => {
    expect(stripLocale("/en/music/playlists/1")).toBe("/music/playlists/1");
    expect(stripLocale("/ko")).toBe("/");
  });

  it("접두사가 없으면 그대로 둔다", () => {
    expect(stripLocale("/music")).toBe("/music");
    expect(stripLocale("/english")).toBe("/english");
  });
});

describe("swapLocale", () => {
  it("같은 경로의 다른 언어 주소를 만든다", () => {
    expect(swapLocale("/ko/posts/x", "en")).toBe("/en/posts/x");
    expect(swapLocale("/en", "ko")).toBe("/ko");
  });
});

describe("languageTogglePath", () => {
  const translated = new Set(["spotify"]);

  it("번역이 있는 글은 같은 글의 다른 언어로 간다", () => {
    expect(languageTogglePath("/ko/posts/spotify", "en", translated)).toBe(
      "/en/posts/spotify",
    );
  });

  it("번역이 없는 글은 404 대신 영어 글 목록으로 간다", () => {
    expect(languageTogglePath("/ko/posts/other", "en", translated)).toBe(
      "/en/posts",
    );
  });

  it("영어에서 한국어로는 원문이 늘 있으므로 같은 경로", () => {
    expect(languageTogglePath("/en/posts/other", "ko", translated)).toBe(
      "/ko/posts/other",
    );
  });

  it("글이 아닌 경로는 그대로 바꾼다", () => {
    expect(languageTogglePath("/ko/music/top-tracks", "en", translated)).toBe(
      "/en/music/top-tracks",
    );
    expect(languageTogglePath("/ko", "en", translated)).toBe("/en");
    expect(languageTogglePath("/ko/atelier/meteor", "en", translated)).toBe(
      "/en/atelier/meteor",
    );
  });
});

describe("pickLocale", () => {
  it("쿠키가 가장 우선한다", () => {
    expect(pickLocale({ cookie: "en", acceptLanguage: "ko-KR" })).toBe("en");
    expect(pickLocale({ cookie: "ko", acceptLanguage: "en" })).toBe("ko");
  });

  it("쿠키가 지원하지 않는 값이면 무시한다", () => {
    expect(pickLocale({ cookie: "fr", acceptLanguage: "en-US" })).toBe("en");
  });

  it("Accept-Language가 없거나 비어 있으면 ko (검색 봇이 여기로 온다)", () => {
    expect(pickLocale({})).toBe("ko");
    expect(pickLocale({ acceptLanguage: null })).toBe("ko");
    expect(pickLocale({ acceptLanguage: "" })).toBe("ko");
    expect(pickLocale({ acceptLanguage: "  " })).toBe("ko");
  });

  it("목록 어디에든 ko가 있으면 순서·q와 무관하게 ko", () => {
    expect(pickLocale({ acceptLanguage: "ko-KR,ko;q=0.9" })).toBe("ko");
    expect(pickLocale({ acceptLanguage: "en-US,en;q=0.9,ko;q=0.8" })).toBe(
      "ko",
    );
    expect(pickLocale({ acceptLanguage: "ja,KO;q=0.1" })).toBe("ko");
  });

  it("ko가 없으면 en", () => {
    expect(pickLocale({ acceptLanguage: "en-US" })).toBe("en");
    expect(pickLocale({ acceptLanguage: "ja" })).toBe("en");
    expect(pickLocale({ acceptLanguage: "fr;q=0.9,de;q=0.5" })).toBe("en");
    expect(pickLocale({ acceptLanguage: "*" })).toBe("en");
  });

  it("q=0인 ko는 거부로 보고 en", () => {
    expect(pickLocale({ acceptLanguage: "en,ko;q=0" })).toBe("en");
  });
});
