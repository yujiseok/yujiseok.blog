import type { JSONContent } from "@tiptap/core";
import type { Root as MdastRoot, RootContent as MdastNode } from "mdast";
import { parser } from "./processor";
import { MARK_OF_NODE, type TiptapMark } from "./marks";
import { convertAlignDivToTiptap } from "./nodes/align-div";
import { convertDetailsToTiptap } from "./nodes/details";
import { convertImageJsxToTiptap, convertImageToTiptap } from "./nodes/image";
import { convertTableToTiptap } from "./nodes/table";

// ----------------------------------------------------------------------------
// markdown -> Tiptap JSON
// ----------------------------------------------------------------------------

export function markdownToDoc(markdown: string): JSONContent {
  const tree = parser().parse(markdown) as MdastRoot;

  return { type: "doc", content: convertBlocks(tree.children, markdown) };
}

function rawSlice(node: MdastNode, source: string): string {
  const position = node.position;
  if (
    !position ||
    position.start.offset == null ||
    position.end.offset == null
  ) {
    throw new Error(`${node.type} 노드에 position 정보가 없습니다.`);
  }
  return source.slice(position.start.offset, position.end.offset);
}

// 에디터가 모르는 블록은 원문 그대로 담아 저장해도 깎이지 않게 한다.
const rawBlock = (node: MdastNode, source: string): JSONContent => ({
  type: "mdxBlock",
  attrs: { value: rawSlice(node, source) },
});

// 블록의 mdxBlock에 대응하는 인라인판. 편집은 못 하지만 저장해도 깎이지 않는다.
const rawInline = (node: MdastNode, source: string): JSONContent => ({
  type: "mdxInline",
  attrs: { value: rawSlice(node, source) },
});

// 값이 없으면 키 자체를 두지 않는다 — Tiptap 의 getJSON 이 내놓는 모양과 맞춘다.
const attrsIfAny = (attrs: Record<string, unknown>) =>
  Object.keys(attrs).length ? { attrs } : {};

export const convertBlocks = (
  children: MdastNode[],
  source: string,
): JSONContent[] =>
  children.map((child) => convertBlockToTiptap(child, source));

export function convertBlockToTiptap(
  node: MdastNode,
  source: string,
): JSONContent {
  switch (node.type) {
    case "paragraph": {
      if (node.children.length === 1 && node.children[0].type === "image") {
        return convertImageToTiptap(node.children[0]);
      }
      // 한 줄짜리 미지의 JSX(`<Callout>내용</Callout>` 처럼 여는/닫는 태그가 한 줄에 있는 경우)는
      // remark-mdx 가 flow 가 아닌 text 요소로 파싱해 paragraph 로 감싼다. 이 경우 문단 전체를
      // 원문 그대로 보존해야 한다.
      if (
        node.children.length === 1 &&
        node.children[0].type === "mdxJsxTextElement" &&
        node.children[0].name !== "u"
      ) {
        return rawBlock(node, source);
      }
      return {
        type: "paragraph",
        content: convertInlineChildren(node.children, [], source),
      };
    }
    case "heading": {
      return {
        type: "heading",
        // 상한을 3으로 깎으면 기존 글의 ####가 조용히 ###로 강등된다.
        // 마크다운이 허용하는 6까지 그대로 받는다.
        attrs: { level: node.depth },
        content: convertInlineChildren(node.children, [], source),
      };
    }
    case "list": {
      const attrs: Record<string, unknown> = {};
      // 느슨한 목록(항목 사이 빈 줄)을 tight로 눌러버리면 렌더된 간격이 바뀐다
      if (node.spread) attrs.spread = true;
      if (node.ordered && node.start != null && node.start !== 1) {
        attrs.start = node.start;
      }
      return {
        type: node.ordered ? "orderedList" : "bulletList",
        ...attrsIfAny(attrs),
        content: convertBlocks(node.children, source),
      };
    }
    case "listItem": {
      const attrs: Record<string, unknown> = {};
      if (node.spread) attrs.spread = true;
      // GFM 체크박스. 버리면 - [x]가 그냥 -로 바뀐다
      if (node.checked != null) attrs.checked = node.checked;
      return {
        type: "listItem",
        ...attrsIfAny(attrs),
        content: convertBlocks(node.children, source),
      };
    }
    case "blockquote":
      return {
        type: "blockquote",
        content: convertBlocks(node.children, source),
      };
    case "code": {
      const attrs: Record<string, unknown> = { language: node.lang ?? null };
      // ```ts title="layout.tsx" 나 ```tsx {4-6} 의 meta. next.config.ts의
      // rehype-pretty-code가 이걸 읽어 코드블록 제목과 라인 하이라이트를
      // 그리므로, 버리면 발행된 글의 겉모습이 바뀐다.
      if (node.meta) attrs.meta = node.meta;
      const result: JSONContent = { type: "codeBlock", attrs };
      if (node.value) {
        result.content = [{ type: "text", text: node.value }];
      }
      return result;
    }
    case "table":
      return convertTableToTiptap(node, source);
    case "thematicBreak":
      return { type: "horizontalRule" };
    case "image":
      return convertImageToTiptap(node);
    case "mdxJsxFlowElement":
      // 정적으로 읽히는 <Image>, 정렬용 <div>, 접기용 <details>만 편집 가능한
      // 노드로 승격한다. 나머지 JSX는 아래로 흘러 원문 그대로 보존된다.
      return (
        convertImageJsxToTiptap(node) ??
        convertAlignDivToTiptap(node, source) ??
        convertDetailsToTiptap(node, source) ??
        rawBlock(node, source)
      );
    default:
      // 지원하지 않는 블록 노드(ESM import/export 포함): 원문을 그대로 보존해
      // 데이터 유실을 막는다.
      return rawBlock(node, source);
  }
}

export const convertInlineChildren = (
  children: MdastNode[],
  marks: TiptapMark[],
  source: string,
): JSONContent[] =>
  children.flatMap((child) => convertInline(child, marks, source));

function convertInline(
  node: MdastNode,
  marks: TiptapMark[],
  source: string,
): JSONContent[] {
  switch (node.type) {
    case "text":
      return [textNode(node.value, marks)];
    case "strong":
    case "emphasis":
    case "delete":
      return convertInlineChildren(
        node.children,
        [...marks, { type: MARK_OF_NODE[node.type] }],
        source,
      );
    case "inlineCode":
      return [textNode(node.value, [...marks, { type: "code" }])];
    case "link": {
      // GFM 자동 링크(맨 URL)와 <url> 표기. 대괄호 표기로 바꿔 쓰면 원문이
      // 달라지고, URL 속 _ 가 이스케이프까지 된다. 글자 그대로 보존한다.
      if (!rawSlice(node, source).startsWith("[")) {
        return [rawInline(node, source)];
      }
      const attrs: Record<string, unknown> = { href: node.url };
      if (node.title) attrs.title = node.title;
      return convertInlineChildren(
        node.children,
        [...marks, { type: "link", attrs }],
        source,
      );
    }
    case "break":
      return [{ type: "hardBreak" }];
    case "image":
      return [convertImageToTiptap(node)];
    case "mdxJsxTextElement":
      if (node.name === "u") {
        return convertInlineChildren(
          node.children,
          [...marks, { type: "underline" }],
          source,
        );
      }
      // 지원하지 않는 인라인 JSX(<strong>, <span> 등): 원문 그대로 보존한다.
      // 텍스트로 넘기면 직렬화 때 < 가 이스케이프돼 원문이 훼손된다.
      return [rawInline(node, source)];
    default:
      // 각주 참조처럼 아직 모르는 인라인 노드도 버리지 않고 원문을 남긴다.
      return [rawInline(node, source)];
  }
}

function textNode(text: string, marks: TiptapMark[]): JSONContent {
  if (marks.length === 0) return { type: "text", text };
  return {
    type: "text",
    text,
    marks: marks.map((m) =>
      m.attrs ? { type: m.type, attrs: m.attrs } : { type: m.type },
    ),
  };
}
