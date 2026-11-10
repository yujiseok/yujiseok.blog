import { describe, expect, it } from "vitest";

import { alternates } from "./metadata";

describe("alternates", () => {
  it("canonical은 현재 언어 경로, hreflang은 두 언어와 x-default(ko)", () => {
    expect(alternates("en", "/posts")).toEqual({
      canonical: "/en/posts",
      languages: {
        ko: "/ko/posts",
        en: "/en/posts",
        "x-default": "/ko/posts",
      },
      types: { "application/rss+xml": "/en/rss.xml" },
    });
  });

  it("번역이 없는 글은 그 언어를 hreflang에서 뺀다", () => {
    expect(
      alternates("ko", "/posts/x", { available: ["ko"] }).languages,
    ).toEqual({
      ko: "/ko/posts/x",
      "x-default": "/ko/posts/x",
    });
  });

  it("markdown 옵션이면 그 언어의 .md를 text/markdown 대체 링크로 단다", () => {
    expect(alternates("en", "/posts/x", { markdown: true }).types).toEqual({
      "application/rss+xml": "/en/rss.xml",
      "text/markdown": "/en/posts/x.md",
    });
    expect(alternates("ko", "/posts/x", { markdown: true }).types).toEqual({
      "application/rss+xml": "/rss.xml",
      "text/markdown": "/ko/posts/x.md",
    });
  });
});
