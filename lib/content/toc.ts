import fs from "node:fs/promises";
import path from "node:path";

import GithubSlugger from "github-slugger";
import { toString as mdastToString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Heading, Nodes } from "mdast";

import { isValidSlug, parsePost } from "./document";

export interface TocEntry {
  /** rehype-slug가 렌더 시 heading에 박는 id와 같은 값 */
  id: string;
  text: string;
  /** 문서 내 최소 heading 레벨을 0으로 맞춘 들여쓰기 단계 (0~2) */
  indent: number;
}

type ContentType = "writing" | "atelier";

// h4 이하는 목차에 담지 않는다. 세 단계를 넘으면 들여쓰기만 늘고 훑기가 어렵다.
const MAX_HEADING_DEPTH = 3;

const CONTENT_DIR = path.join(process.cwd(), "content");

/*
 * MDX는 모듈로 컴파일돼 본문이 React 컴포넌트로 온다 — 서버에서 HTML을 긁을
 * 수가 없다. 그래서 원문을 한 번 더 파싱한다. lib/editor/markdown.ts의
 * 프로세서를 빌려오지 않는 이유는 그쪽이 에디터 왕복 계약을 지고 있어서다.
 * 여기서 필요한 건 heading뿐이므로 파서만 따로 조립한다.
 */
const parser = () => unified().use(remarkParse).use(remarkGfm).use(remarkMdx);

// rehype-slug는 트리 전체를 훑으므로 JSX·인용문 안의 heading도 걷어야 순서와
// 중복 접미사가 렌더 결과와 일치한다.
const headingsOf = (node: Nodes): Heading[] =>
  node.type === "heading"
    ? [node]
    : "children" in node
      ? node.children.flatMap(headingsOf)
      : [];

export const buildToc = (body: string): TocEntry[] => {
  // slugger는 문서마다 새로 만든다. rehype-slug도 파일당 새 인스턴스를 쓰므로,
  // 공유하면 같은 제목이 두 번 나오는 글에서 -1 접미사가 어긋난다.
  const slugger = new GithubSlugger();

  const headings = headingsOf(parser().parse(body)).map((heading) => {
    const text = mdastToString(heading);

    // h4~h6도 슬러그를 소비한다. 건너뛰면 중복 접미사 번호가 밀린다.
    return { depth: heading.depth, text, id: slugger.slug(text) };
  });

  const visible = headings.filter(({ depth }) => depth <= MAX_HEADING_DEPTH);

  if (visible.length === 0) {
    return [];
  }

  // ##로 시작하는 글과 #으로 시작하는 글이 섞여 있다. 절대 레벨로 들여쓰면
  // 전자가 통째로 한 칸 밀리므로 문서 내 최상위를 0으로 맞춘다.
  const topDepth = Math.min(...visible.map(({ depth }) => depth));

  return visible.map(({ depth, text, id }) => ({
    id,
    text,
    indent: depth - topDepth,
  }));
};

export const getToc = async (
  contentType: ContentType,
  slug: string,
): Promise<TocEntry[]> => {
  "use cache";

  // slug는 URL에서 온다. 검증 없이 경로에 이으면 상위 디렉터리를 읽힐 수 있다.
  if (!isValidSlug(slug)) {
    return [];
  }

  const source = await fs.readFile(
    path.join(CONTENT_DIR, contentType, `${slug}.mdx`),
    "utf8",
  );

  return buildToc(parsePost(source).body);
};
