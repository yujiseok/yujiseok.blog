import { describe, expect, it } from "vitest";

import { isPublished } from "./document";
import { listLocaleFiles, readAllContent, requireSource } from "./repository";

/*
 * "use cache"는 vitest 환경에서 동작하지 않으므로 캐시 래퍼(getAllContent)가
 * 아니라 그 안에서 실제 파일을 읽고 정렬하는 순수 함수를 검증한다.
 */
describe("readAllContent", () => {
  it("publishedAt 기준 내림차순으로 정렬한다", async () => {
    const writings = await readAllContent("writing", { locale: "ko" });
    const publishedAtTimes = writings.map((writing) =>
      new Date(writing.metadata.publishedAt).getTime(),
    );

    expect(publishedAtTimes).toEqual(
      [...publishedAtTimes].sort((a, b) => b - a),
    );
  });
});

describe("초안 제외", () => {
  it("기본적으로 published 가 true 인 글만 돌려준다", async () => {
    const writings = await readAllContent("writing", { locale: "ko" });

    expect(writings.length).toBeGreaterThan(0);
    expect(writings.every(({ metadata }) => isPublished(metadata))).toBe(true);
  });

  it("includeDrafts 를 켜면 초안까지 함께 돌려준다", async () => {
    const [published, all] = await Promise.all([
      readAllContent("writing", { locale: "ko" }),
      readAllContent("writing", { locale: "ko", includeDrafts: true }),
    ]);

    expect(all.length).toBeGreaterThanOrEqual(published.length);
    expect(all.map(({ slug }) => slug)).toEqual(
      expect.arrayContaining(published.map(({ slug }) => slug)),
    );
  });
});

describe("listLocaleFiles", () => {
  const files = ["a.mdx", "a.en.mdx", "b.mdx", "notes.txt", ".DS_Store"];

  it("ko는 번역본을 뺀 원문만 slug와 함께 돌려준다", () => {
    expect(listLocaleFiles(files, "ko")).toEqual([
      { file: "a.mdx", slug: "a" },
      { file: "b.mdx", slug: "b" },
    ]);
  });

  it("en은 .en.mdx만 읽고 slug에서 접미사를 뗀다", () => {
    expect(listLocaleFiles(files, "en")).toEqual([
      { file: "a.en.mdx", slug: "a" },
    ]);
  });
});

describe("requireSource", () => {
  const meta = (published: boolean) => ({
    title: "t",
    publishedAt: "2025-01-01",
    published,
  });
  const translation = { slug: "a", metadata: meta(true) };

  it("원문이 발행 상태면 번역본이 남는다", () => {
    const sources = [{ slug: "a", metadata: meta(true) }];

    expect(requireSource([translation], sources, false)).toEqual([translation]);
  });

  it("원문이 비공개로 돌아가면 번역본도 내린다", () => {
    const sources = [{ slug: "a", metadata: meta(false) }];

    expect(requireSource([translation], sources, false)).toEqual([]);
  });

  it("원문이 없는 번역본(고아)은 내린다", () => {
    expect(requireSource([translation], [], false)).toEqual([]);
    expect(requireSource([translation], [], true)).toEqual([]);
  });

  it("초안을 보여 주는 모드에서는 비공개 원문의 번역본도 남는다", () => {
    const sources = [{ slug: "a", metadata: meta(false) }];

    expect(requireSource([translation], sources, true)).toEqual([translation]);
  });
});
