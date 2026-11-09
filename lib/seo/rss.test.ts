import { describe, expect, it } from "vitest";

import { buildRss } from "./rss";

const post = {
  slug: "hello",
  metadata: {
    title: 'A & "B"',
    publishedAt: "2025-03-15",
    summary: "요약 <x>",
    published: true,
  },
};

describe("buildRss", () => {
  it("ko: 링크는 /ko/posts, guid는 옛 /writing 주소 그대로", () => {
    const xml = buildRss("ko", [post]);

    expect(xml).toContain("<link>https://yujiseok.blog/ko/posts/hello</link>");
    // 구독자 리더는 guid로 글을 식별한다. 바뀌면 기존 글이 전부 새 글로 뜬다
    expect(xml).toContain(
      '<guid isPermaLink="false">https://yujiseok.blog/writing/hello</guid>',
    );
    expect(xml).toContain("<language>ko</language>");
    expect(xml).toContain('href="https://yujiseok.blog/rss.xml"');
  });

  it("en: /en 주소와 자기 피드 주소를 쓴다", () => {
    const xml = buildRss("en", [post]);

    expect(xml).toContain("<link>https://yujiseok.blog/en/posts/hello</link>");
    expect(xml).toContain(
      '<guid isPermaLink="false">https://yujiseok.blog/en/posts/hello</guid>',
    );
    expect(xml).toContain("<language>en</language>");
    expect(xml).toContain('href="https://yujiseok.blog/en/rss.xml"');
  });

  it("제목과 요약을 XML 이스케이프한다", () => {
    const xml = buildRss("ko", [post]);

    expect(xml).toContain("<title>A &amp; &quot;B&quot;</title>");
    expect(xml).toContain("<description>요약 &lt;x&gt;</description>");
  });

  it("글이 없어도 유효한 채널을 낸다", () => {
    expect(buildRss("en", [])).toContain("<channel>");
  });
});
