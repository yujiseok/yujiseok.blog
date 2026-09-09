import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { isValidSlug, parsePost, serializePost, toSlug } from "./document";

const CANONICAL = `export const metadata = {
  "title": "제목",
  "publishedAt": "2026-09-09",
  "summary": "요약"
}

본문 첫 문단.

두 번째 문단.
`;

describe("serializePost", () => {
  it("기존 content/**.mdx 와 같은 헤더 형태로 직렬화한다", () => {
    const out = serializePost({
      metadata: { title: "제목", publishedAt: "2026-09-09", summary: "요약" },
      body: "본문 첫 문단.\n\n두 번째 문단.",
    });

    expect(out).toBe(CANONICAL);
  });

  it("image 는 있을 때만 내보낸다", () => {
    const without = serializePost({
      metadata: { title: "t", publishedAt: "2026-01-01", summary: "s" },
      body: "본문",
    });
    expect(without).not.toContain("image");

    const withImage = serializePost({
      metadata: {
        title: "t",
        publishedAt: "2026-01-01",
        summary: "s",
        image: "/a.png",
      },
      body: "본문",
    });
    expect(withImage).toContain('"image": "/a.png"');
  });
});

describe("parsePost", () => {
  it("메타데이터와 본문을 분리한다", () => {
    const parsed = parsePost(CANONICAL);

    expect(parsed.metadata).toEqual({
      title: "제목",
      publishedAt: "2026-09-09",
      summary: "요약",
    });
    expect(parsed.body).toBe("본문 첫 문단.\n\n두 번째 문단.");
  });

  it("metadata export 가 없으면 던진다", () => {
    expect(() => parsePost("# 그냥 마크다운")).toThrow(/metadata/);
  });

  it("본문에 등장하는 } 에 속지 않는다", () => {
    const parsed = parsePost(
      `export const metadata = {\n  "title": "t",\n  "publishedAt": "2026-01-01",\n  "summary": "s"\n}\n\n\`\`\`ts\nconst a = { b: 1 }\n\`\`\`\n`,
    );

    expect(parsed.metadata.title).toBe("t");
    expect(parsed.body).toContain("const a = { b: 1 }");
  });
});

describe("왕복", () => {
  it("serialize(parse(x)) === x", () => {
    expect(serializePost(parsePost(CANONICAL))).toBe(CANONICAL);
  });

  const files = ["writing", "atelier"].flatMap((type) => {
    const dir = path.join(process.cwd(), "content", type);
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => path.join(dir, f));
  });

  it.each(files)("실제 글을 손실 없이 왕복한다: %s", (file) => {
    const source = fs.readFileSync(file, "utf8");
    const parsed = parsePost(source);

    expect(parsed.metadata.title).toBeTruthy();
    expect(parsed.metadata.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(serializePost(parsed)).toBe(source);
  });
});

describe("isValidSlug", () => {
  it.each(["my-post", "next-15", "a", "post-2026"])("허용: %s", (slug) => {
    expect(isValidSlug(slug)).toBe(true);
  });

  it.each([
    "",
    "../secret",
    "a/b",
    "Uppercase",
    "공백 있음",
    "trailing-",
    ".hidden",
    "a".repeat(101),
  ])("거부: %s", (slug) => {
    expect(isValidSlug(slug)).toBe(false);
  });
});

describe("toSlug", () => {
  it("영문 제목을 슬러그로 만든다", () => {
    expect(toSlug("Hello World, Again!")).toBe("hello-world-again");
  });

  it("한글 제목이면 빈 문자열을 준다", () => {
    expect(toSlug("한글 제목")).toBe("");
  });
});
