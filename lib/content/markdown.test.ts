import { describe, expect, it } from "vitest";

import { toMarkdown } from "./markdown";

describe("toMarkdown", () => {
  it("제목·출처·요약을 머리에 두고 본문을 잇는다", () => {
    expect(
      toMarkdown({
        title: "스포티파이 붙이기",
        summary: "최근 들은 곡을 보여준다",
        publishedAt: "2025-03-15",
        url: "https://yujiseok.blog/posts/spotify",
        body: "## 시작\n\n본문",
      }),
    ).toBe(
      [
        "# 스포티파이 붙이기",
        "",
        "> 최근 들은 곡을 보여준다",
        "",
        "- Published: 2025-03-15",
        "- Source: https://yujiseok.blog/posts/spotify",
        "",
        "## 시작",
        "",
        "본문",
        "",
      ].join("\n"),
    );
  });

  it("요약이 없으면 인용 줄을 생략한다", () => {
    expect(
      toMarkdown({
        title: "제목",
        publishedAt: "2025-01-01",
        url: "https://yujiseok.blog/posts/a",
        body: "본문",
      }),
    ).toBe(
      [
        "# 제목",
        "",
        "- Published: 2025-01-01",
        "- Source: https://yujiseok.blog/posts/a",
        "",
        "본문",
        "",
      ].join("\n"),
    );
  });
});
