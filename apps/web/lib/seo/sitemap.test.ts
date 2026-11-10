import { describe, expect, it } from "vitest";

import { buildSitemap } from "./sitemap";

const meta = { title: "t", publishedAt: "2025-01-01", published: true };

const input = {
  ko: [
    { slug: "a", metadata: meta },
    { slug: "b", metadata: meta },
  ],
  en: [{ slug: "a", metadata: meta }],
};

const find = (url: string, entries: ReturnType<typeof buildSitemap>) =>
  entries.find((entry) => entry.url === `https://yujiseok.blog${url}`);

describe("buildSitemap", () => {
  const entries = buildSitemap(input);

  it("번역된 글은 두 언어 URL이 서로를 대체 언어로 가리킨다", () => {
    expect(find("/ko/posts/a", entries)?.alternates?.languages).toEqual({
      ko: "https://yujiseok.blog/ko/posts/a",
      en: "https://yujiseok.blog/en/posts/a",
      "x-default": "https://yujiseok.blog/ko/posts/a",
    });
    expect(find("/en/posts/a", entries)?.alternates?.languages).toEqual(
      find("/ko/posts/a", entries)?.alternates?.languages,
    );
  });

  it("번역이 없는 글은 en URL도 en 대체 언어도 내지 않는다", () => {
    expect(find("/en/posts/b", entries)).toBeUndefined();
    expect(
      find("/ko/posts/b", entries)?.alternates?.languages,
    ).not.toHaveProperty("en");
  });

  it("목록·이력서 같은 페이지는 두 언어 모두 낸다", () => {
    for (const path of ["", "/posts", "/resume", "/music"]) {
      expect(find(`/ko${path}`, entries)).toBeDefined();
      expect(find(`/en${path}`, entries)).toBeDefined();
    }
  });

  it("접두사 없는 URL은 내지 않는다", () => {
    expect(find("/posts/a", entries)).toBeUndefined();
    expect(entries.some(({ url }) => url === "https://yujiseok.blog")).toBe(
      false,
    );
  });

  it("번역이 하나도 없어도 en 목록 페이지는 남는다", () => {
    const none = buildSitemap({ ...input, en: [] });

    expect(find("/en/posts", none)).toBeDefined();
    expect(none.some(({ url }) => url.includes("/en/posts/"))).toBe(false);
  });
});
