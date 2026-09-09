import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Nodes as HastNodes } from "hast";

import { parsePost } from "./editor/document";
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

const CONTENT_TYPES = ["writing", "atelier"] as const;

const posts = CONTENT_TYPES.flatMap((contentType) => {
  const dir = path.join(process.cwd(), "content", contentType);

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      contentType,
      slug: path.basename(file, ".mdx"),
      file: path.join(dir, file),
    }));
});

const bodyOf = (file: string) => parsePost(fs.readFileSync(file, "utf8")).body;

describe("목차 id가 rehype-slug가 박는 id와 일치한다", () => {
  it.each(posts)("$contentType/$slug", async ({ contentType, slug, file }) => {
    const toc = await getToc(contentType, slug);

    expect(toc.map((entry) => entry.id)).toEqual(renderedIds(bodyOf(file)));
  });
});

describe("코퍼스의 경계 사례", () => {
  it("같은 제목이 두 번 나오면 rehype-slug와 같은 접미사를 붙인다", async () => {
    const toc = await getToc("writing", "next-sitemap-and-robots");

    expect(toc.filter((entry) => entry.text === "robots.txt")).toEqual([
      { id: "robotstxt", text: "robots.txt", indent: 1 },
      { id: "robotstxt-1", text: "robots.txt", indent: 1 },
    ]);
  });

  it("heading이 없는 글은 빈 목차를 낸다", async () => {
    expect(await getToc("writing", "2025")).toEqual([]);
  });

  it("h1로 시작하는 글도 최상위가 0단계다", async () => {
    const toc = await getToc("writing", "react-micro-hook");

    expect(toc.length).toBeGreaterThan(0);
    expect(Math.min(...toc.map((entry) => entry.indent))).toBe(0);
  });

  it("h4 이하는 담지 않지만 중복 접미사 번호는 소비한다", () => {
    const toc = buildToc("## 정리\n\n#### 정리\n\n## 정리\n");

    expect(toc).toEqual([
      { id: "정리", text: "정리", indent: 0 },
      { id: "정리-2", text: "정리", indent: 0 },
    ]);
  });

  it("존재하지 않는 경로를 가리키는 slug는 파일을 읽지 않는다", async () => {
    expect(await getToc("writing", "../../package")).toEqual([]);
  });
});
