import { describe, expect, it } from "vitest";

import { buildLlmsTxt } from "./llms";

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
});
