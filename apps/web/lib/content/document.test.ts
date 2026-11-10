import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  isPublished,
  isValidSlug,
  parsePost,
  serializePost,
  toSlug,
  type PostMetadata,
} from "./document";

const CANONICAL = `export const metadata = {
  "title": "제목",
  "publishedAt": "2026-09-09",
  "summary": "요약",
  "published": true
}

본문 첫 문단.

두 번째 문단.
`;

describe("serializePost", () => {
  // summary 는 없으면 키째 빠지고 image 는 있으면 들어간다
  it("선택 키(summary·image)는 값이 있을 때만 내보낸다", () => {
    const out = serializePost({
      metadata: {
        title: "t",
        publishedAt: "2026-01-01",
        image: "/a.png",
        published: true,
      },
      body: "본문",
    });

    expect(out).toBe(`export const metadata = {
  "title": "t",
  "publishedAt": "2026-01-01",
  "image": "/a.png",
  "published": true
}

본문
`);
  });
});

describe("parsePost", () => {
  it("메타데이터와 본문을 분리한다", () => {
    const parsed = parsePost(CANONICAL);

    expect(parsed.metadata).toEqual({
      title: "제목",
      published: true,
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
  const dir = path.join(process.cwd(), "content", "writing");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(dir, f));

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
  it.each([
    ["Hello World, Again!", "hello-world-again"],
    ["한글 제목", ""],
  ])("%s → %j", (title, expected) => {
    expect(toSlug(title)).toBe(expected);
  });
});

describe("isPublished", () => {
  // published 를 아예 빼는 경우까지 만들어야 해서 캐스팅한다 — parsePost 가
  // JSON.parse 결과를 캐스팅하는 것과 같은 상황을 재현한다
  const metadata = (published?: boolean): PostMetadata =>
    ({
      title: "제목",
      publishedAt: "2026-09-09",
      summary: "요약",
      ...(published === undefined ? {} : { published }),
    }) as PostMetadata;

  it("published 가 true 면 발행된 글이다", () => {
    expect(isPublished(metadata(true))).toBe(true);
  });

  it("published 가 false 면 초안이다", () => {
    expect(isPublished(metadata(false))).toBe(false);
  });

  // 키를 빠뜨린 글이 조용히 공개되는 쪽이 더 나쁘다
  it("published 키가 아예 없으면 초안으로 본다", () => {
    expect(isPublished(metadata())).toBe(false);
  });
});
