import { describe, expect, it } from "vitest";

import { buildLlmsFull, buildLlmsTxt } from "./llms";

const meta = (title: string, summary?: string) => ({
  title,
  summary,
  publishedAt: "2025-01-01",
  published: true,
});

const input = {
  ko: [
    { slug: "a", metadata: meta("글 A", "요약 A") },
    { slug: "b", metadata: meta("글 B") },
  ],
  en: [{ slug: "a", metadata: meta("Post A", "Summary A") }],
};

describe("buildLlmsTxt", () => {
  it("한국어 글은 /ko .md 원문을 가리킨다", () => {
    const txt = buildLlmsTxt(input);

    expect(txt).toContain(
      "- [글 A](https://yujiseok.blog/ko/posts/a.md): 요약 A",
    );
    expect(txt).toContain("- [글 B](https://yujiseok.blog/ko/posts/b.md)\n");
  });

  it("번역된 글만 영어 섹션에 /en .md로 나온다", () => {
    const txt = buildLlmsTxt(input);

    expect(txt).toContain("## Writing (English)");
    expect(txt).toContain(
      "- [Post A](https://yujiseok.blog/en/posts/a.md): Summary A",
    );
    expect(txt).not.toContain("/en/posts/b.md");
  });

  it("번역이 하나도 없으면 영어 섹션과 영어 링크를 싣지 않는다", () => {
    const txt = buildLlmsTxt({ ...input, en: [] });

    expect(txt).not.toContain("English");
    expect(txt).not.toContain("/en/");
  });

  it("전문·피드 링크를 싣는다", () => {
    const txt = buildLlmsTxt(input);

    expect(txt).toContain("https://yujiseok.blog/llms-full.txt");
    expect(txt).toContain("https://yujiseok.blog/en/llms-full.txt");
    expect(txt).toContain("https://yujiseok.blog/rss.xml");
    expect(txt).toContain("https://yujiseok.blog/en/rss.xml");
  });
});

describe("buildLlmsFull", () => {
  it("ko 전문은 한국어 머리말, en 전문은 영어 머리말을 단다", () => {
    expect(buildLlmsFull("ko", ["# P1", "# P2"])).toContain("전 글 원문");
    expect(buildLlmsFull("en", ["# P1"])).toContain("translated");
  });

  it("글 사이를 구분선으로 잇는다", () => {
    expect(buildLlmsFull("ko", ["# P1", "# P2"])).toContain(
      "# P1\n---\n\n# P2",
    );
  });
});
