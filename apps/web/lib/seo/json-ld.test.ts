import { describe, expect, it } from "vitest";

import { blogPostingJsonLd } from "./json-ld";

const metadata = {
  title: "T",
  summary: "S",
  publishedAt: "2025-03-15",
  published: true,
};

describe("blogPostingJsonLd", () => {
  it("언어별로 url·mainEntityOfPage·inLanguage·저자 이름이 달라진다", () => {
    const ko = blogPostingJsonLd("ko", "x", metadata);
    const en = blogPostingJsonLd("en", "x", metadata);

    expect(en.inLanguage).toBe("en");
    expect(en.url).toBe("https://yujiseok.blog/en/posts/x");
    expect(en.mainEntityOfPage).toBe("https://yujiseok.blog/en/posts/x");
    expect(ko.author.name).toBe("유지석");
    expect(en.author.name).toBe("Yu Jiseok");
  });
});
