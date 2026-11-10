import { describe, expect, it } from "vitest";

import {
  languageTogglePath,
  localizedPath,
  pickLocale,
  stripLocale,
  swapLocale,
} from "./locales";

describe("localizedPath", () => {
  it.each([
    ["en", "/posts/x", "/en/posts/x"],
    ["ko", "/music", "/ko/music"],
    ["en", "/", "/en"],
    ["en", "/posts?page=2", "/en/posts?page=2"],
    ["en", "/posts/x#intro", "/en/posts/x#intro"],
  ] as const)("%s + %s → %s", (locale, path, expected) => {
    expect(localizedPath(locale, path)).toBe(expected);
  });
});

describe("stripLocale", () => {
  it.each([
    ["/en/music/playlists/1", "/music/playlists/1"],
    ["/ko", "/"],
    ["/music", "/music"],
    ["/english", "/english"],
  ])("%s → %s", (path, expected) => {
    expect(stripLocale(path)).toBe(expected);
  });
});

describe("swapLocale", () => {
  it.each([
    ["/ko/posts/x", "en", "/en/posts/x"],
    ["/en", "ko", "/ko"],
  ] as const)("%s → %s: %s", (path, locale, expected) => {
    expect(swapLocale(path, locale)).toBe(expected);
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
    expect(languageTogglePath("/ko/resume", "en", translated)).toBe(
      "/en/resume",
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
