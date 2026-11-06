import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Nodes, Root } from "mdast";

import { parsePost, type PostDocument } from "@/lib/content/document";

/** 코드 밖에 남아도 되는 한글 글자 수. 고유명사·UI 라벨 인용 정도를 봐준다 */
export const MAX_HANGUL_OUTSIDE_CODE = 10;

// 번역하면 안 되는 메타데이터 키. title·summary 만 번역 대상이다
const FROZEN_METADATA_KEYS = ["publishedAt", "published", "image"] as const;

const HANGUL = /[ㄱ-ㆎ가-힣]/g;

interface Facts {
  headings: string[];
  codes: string[];
  images: string[];
  components: string[];
  hrefs: string[];
  hangul: number;
}

interface JsxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

const countHangul = (text: string) => text.match(HANGUL)?.length ?? 0;

const processor = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

const collectFacts = (tree: Root): Facts => {
  const facts: Facts = {
    headings: [],
    codes: [],
    images: [],
    components: [],
    hrefs: [],
    hangul: 0,
  };

  const walk = (node: Nodes) => {
    switch (node.type) {
      case "heading":
        facts.headings.push(String(node.depth));
        break;
      case "code":
        facts.codes.push(`${node.lang ?? ""}|${node.meta ?? ""}|${node.value}`);
        return;
      case "inlineCode":
        facts.codes.push(node.value);
        return;
      case "image":
        facts.images.push(node.url);
        break;
      case "link":
      case "definition":
        facts.hrefs.push(node.url);
        break;
      case "text":
        facts.hangul += countHangul(node.value);
        break;
      case "mdxJsxFlowElement":
      case "mdxJsxTextElement": {
        if (node.name) facts.components.push(node.name);
        for (const attr of node.attributes as JsxAttribute[]) {
          if (typeof attr.value !== "string") continue;
          if (attr.name === "src") facts.images.push(attr.value);
          if (attr.name === "href") facts.hrefs.push(attr.value);
          // alt 는 번역 대상이라 한글 잔존 검사에 포함한다
          if (attr.name === "alt") facts.hangul += countHangul(attr.value);
        }
        break;
      }
    }
    if ("children" in node) {
      for (const child of node.children as Nodes[]) walk(child);
    }
  };

  walk(tree);
  return facts;
};

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const listDiff = (label: string, src: string[], dst: string[]): string[] =>
  sameList(src, dst)
    ? []
    : [
        `${label}이(가) 원문과 다릅니다. 원문 ${src.length}개 [${src.join(", ")}] / 번역 ${dst.length}개 [${dst.join(", ")}]`,
      ];

const parseSafely = (source: string): PostDocument | Error => {
  try {
    return parsePost(source);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * 원문과 번역문의 구조가 어긋난 곳을 사람이 읽을 수 있는 문장으로 돌려준다.
 * 빈 배열이면 통과다.
 */
export const checkTranslation = async (
  source: string,
  translation: string,
): Promise<string[]> => {
  const src = parseSafely(source);
  if (src instanceof Error) {
    return [`원문 metadata 파싱 실패: ${src.message}`];
  }
  const dst = parseSafely(translation);
  if (dst instanceof Error) {
    return [`번역문 metadata export 파싱 실패: ${dst.message}`];
  }

  const issues: string[] = [];

  for (const key of FROZEN_METADATA_KEYS) {
    const a = src.metadata[key];
    const b = dst.metadata[key];
    if (a !== b) {
      issues.push(
        `metadata.${key} 값이 원문과 다릅니다 (원문 ${JSON.stringify(a)} / 번역 ${JSON.stringify(b)})`,
      );
    }
  }
  const srcKeys = Object.keys(src.metadata);
  const dstKeys = Object.keys(dst.metadata);
  if (!sameList(srcKeys, dstKeys)) {
    issues.push(
      `metadata 키가 원문과 다릅니다 (원문 ${srcKeys.join(",")} / 번역 ${dstKeys.join(",")})`,
    );
  }

  let compileIssue: string | undefined;
  try {
    await compile(translation, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    compileIssue = `MDX 컴파일에 실패합니다: ${message}`;
  }

  let dstTree: Root;
  try {
    dstTree = processor.parse(dst.body) as Root;
  } catch {
    // 구문이 깨져 AST 를 못 만들면 구조 비교는 의미가 없다
    return [...issues, compileIssue ?? "번역문 본문을 파싱하지 못했습니다"];
  }
  const srcFacts = collectFacts(processor.parse(src.body) as Root);
  const dstFacts = collectFacts(dstTree);

  issues.push(
    ...listDiff("헤딩 레벨 순서", srcFacts.headings, dstFacts.headings),
    ...listDiff("코드(펜스·인라인)", srcFacts.codes, dstFacts.codes),
    ...listDiff("이미지 src", srcFacts.images, dstFacts.images),
    ...listDiff("JSX 컴포넌트", srcFacts.components, dstFacts.components),
    ...listDiff("링크 href", srcFacts.hrefs, dstFacts.hrefs),
  );

  const hangul =
    dstFacts.hangul +
    countHangul(dst.metadata.title ?? "") +
    countHangul(dst.metadata.summary ?? "");
  if (hangul > MAX_HANGUL_OUTSIDE_CODE) {
    issues.push(
      `코드 밖에 한글이 ${hangul}자 남아 있습니다 (허용 ${MAX_HANGUL_OUTSIDE_CODE}자). 번역하지 않은 문장이 있는지 확인하세요`,
    );
  }

  if (compileIssue) issues.push(compileIssue);
  return issues;
};
