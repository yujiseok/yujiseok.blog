import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Nodes as HastNodes } from "hast";

// cacheLife·cacheTag는 cacheComponents 빌드 밖에서 던진다. 캐싱은 여기서 검증 대상이 아니다.
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

import { parsePost } from "./document";
import { listLocaleFiles } from "./repository";
import { buildToc, getToc } from "./toc";

/*
 * 이 설계의 유일한 약점은 "원문을 다시 파싱해 만든 id"와 "렌더 파이프라인이
 * 실제로 heading에 박는 id"가 어긋나는 것이다. 어긋나면 목차 링크가 조용히
 * 아무 데도 가지 않는다. 그래서 실제 렌더 경로와 같은 rehype-slug를 통과시킨
 * id와 대조해 고정한다.
 */
const renderer = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMdx)
  .use(remarkRehype)
  .use(rehypeSlug);

const TOC_HEADINGS = new Set(["h1", "h2", "h3"]);

const headingIdsOf = (node: HastNodes): string[] =>
  node.type === "element" && TOC_HEADINGS.has(node.tagName)
    ? [String(node.properties.id ?? "")]
    : "children" in node
      ? node.children.flatMap(headingIdsOf)
      : [];

const renderedIds = (body: string): string[] =>
  headingIdsOf(renderer.runSync(renderer.parse(body)) as HastNodes);

const CORPUS = [
  { contentType: "writing", locale: "ko" },
  { contentType: "writing", locale: "en" },
] as const;

const posts = CORPUS.flatMap(({ contentType, locale }) => {
  const dir = path.join(process.cwd(), "content", contentType);

  return listLocaleFiles(fs.readdirSync(dir), locale).map(({ file, slug }) => ({
    contentType,
    locale,
    slug,
    file: path.join(dir, file),
  }));
});

const bodyOf = (file: string) => parsePost(fs.readFileSync(file, "utf8")).body;

describe("목차 id가 rehype-slug가 박는 id와 일치한다", () => {
  it.each(posts)(
    "$locale $contentType/$slug",
    async ({ contentType, locale, slug, file }) => {
      const toc = await getToc(contentType, slug, locale);

      expect(toc.map((entry) => entry.id)).toEqual(renderedIds(bodyOf(file)));
    },
  );
});

describe("코퍼스의 경계 사례", () => {
  it("같은 제목이 두 번 나오면 rehype-slug와 같은 접미사를 붙인다", async () => {
    const toc = await getToc("writing", "next-sitemap-and-robots", "ko");

    expect(toc.filter((entry) => entry.text === "robots.txt")).toEqual([
      { id: "robotstxt", text: "robots.txt", indent: 1 },
      { id: "robotstxt-1", text: "robots.txt", indent: 1 },
    ]);
  });

  it("heading이 없는 글은 빈 목차를 낸다", async () => {
    expect(await getToc("writing", "2025", "ko")).toEqual([]);
  });

  it("h4 이하는 담지 않지만 중복 접미사 번호는 소비한다", () => {
    const toc = buildToc("## 정리\n\n#### 정리\n\n## 정리\n");

    expect(toc).toEqual([
      { id: "정리", text: "정리", indent: 0 },
      { id: "정리-2", text: "정리", indent: 0 },
    ]);
  });

  it("존재하지 않는 경로를 가리키는 slug는 파일을 읽지 않는다", async () => {
    expect(await getToc("writing", "../../package", "ko")).toEqual([]);
  });
});
