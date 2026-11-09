import { describe, expect, it } from "vitest";

import { blogPostingJsonLd } from "./json-ld";

const metadata = {
  title: "T",
  summary: "S",
  publishedAt: "2025-03-15",
  published: true,
};

describe("blogPostingJsonLd", () => {
  it("언어별 url·mainEntityOfPage·inLanguage를 낸다", () => {
    const ld = blogPostingJsonLd("en", "x", metadata);

    expect(ld.inLanguage).toBe("en");
    expect(ld.url).toBe("https://yujiseok.blog/en/posts/x");
    expect(ld.mainEntityOfPage).toBe("https://yujiseok.blog/en/posts/x");
  });

  it("dateModified·sameAs를 유지하고 저자 이름은 언어에 맞춘다", () => {
    const ko = blogPostingJsonLd("ko", "x", metadata);
    const en = blogPostingJsonLd("en", "x", metadata);

    expect(ko.dateModified).toBe("2025-03-15");
    expect(ko.author.sameAs).toEqual(["https://github.com/yujiseok"]);
    expect(ko.author.name).toBe("유지석");
    expect(en.author.name).toBe("Yu Jiseok");
  });
});
