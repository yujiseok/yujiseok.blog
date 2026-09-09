import type { JSONContent } from "@tiptap/core";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import type {
  Literal as MdastLiteral,
  Root as MdastRoot,
  RootContent as MdastNode,
} from "mdast";

/**
 * 원문을 이스케이프 없이 그대로 뱉기 위한 커스텀 mdast 노드.
 * mdast 타입에 등록해 두면 노드 생성과 remark-stringify 핸들러 양쪽에서
 * 캐스팅 없이 쓸 수 있다.
 */
interface MdxRaw extends MdastLiteral {
  type: "mdxRaw";
}

declare module "mdast" {
  interface RootContentMap {
    mdxRaw: MdxRaw;
  }
}

// ----------------------------------------------------------------------------
// unified 프로세서
// ----------------------------------------------------------------------------

function parser() {
  return unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
}

function stringifier() {
  return unified()
    .use(remarkStringify, {
      bullet: "-",
      emphasis: "_",
      strong: "*",
      rule: "-",
      fence: "`",
      // mdxRaw: 원문 그대로 보존해야 하는 노드. 이스케이프 없이 그대로 출력한다.
      handlers: {
        mdxRaw: (node: MdxRaw) => node.value,
      },
    })
    .use(remarkGfm)
    .use(remarkMdx);
}

// ----------------------------------------------------------------------------
// 마크 순서
// 직렬화 시 바깥쪽부터: link > underline > bold > italic > strike > code(leaf)
// ----------------------------------------------------------------------------

type MarkType = "bold" | "italic" | "strike" | "code" | "link" | "underline";

interface TiptapMark {
  type: MarkType;
  attrs?: Record<string, unknown>;
}

const WRAP_ORDER_INNER_TO_OUTER: Exclude<MarkType, "code">[] = [
  "strike",
  "italic",
  "bold",
  "underline",
  "link",
];

// ----------------------------------------------------------------------------
// markdown -> Tiptap JSON
// ----------------------------------------------------------------------------

export function markdownToDoc(markdown: string): JSONContent {
  const tree = parser().parse(markdown) as MdastRoot;

  const content = tree.children
    .map((node) => convertBlockToTiptap(node, markdown))
    .filter((n): n is JSONContent => n !== null);

  return { type: "doc", content };
}

function rawSlice(node: MdastNode, source: string): string {
  const position = node.position;
  if (!position || position.start.offset == null || position.end.offset == null) {
    throw new Error(`${node.type} 노드에 position 정보가 없습니다.`);
  }
  return source.slice(position.start.offset, position.end.offset);
}

function convertBlockToTiptap(node: MdastNode, source: string): JSONContent | null {
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
        return { type: "mdxBlock", attrs: { value: rawSlice(node, source) } };
      }
      return { type: "paragraph", content: convertInlineChildren(node.children, source) };
    }
    case "heading": {
      const level = Math.min(3, Math.max(1, node.depth)) as 1 | 2 | 3;
      return {
        type: "heading",
        attrs: { level },
        content: convertInlineChildren(node.children, source),
      };
    }
    case "list": {
      const items = node.children
        .map((child) => convertBlockToTiptap(child, source))
        .filter((n): n is JSONContent => n !== null);
      if (node.ordered) {
        const attrs: Record<string, unknown> = {};
        if (node.start != null && node.start !== 1) attrs.start = node.start;
        return { type: "orderedList", ...(Object.keys(attrs).length ? { attrs } : {}), content: items };
      }
      return { type: "bulletList", content: items };
    }
    case "listItem": {
      const content = node.children
        .map((child) => convertBlockToTiptap(child, source))
        .filter((n): n is JSONContent => n !== null);
      return { type: "listItem", content };
    }
    case "blockquote": {
      const content = node.children
        .map((child) => convertBlockToTiptap(child, source))
        .filter((n): n is JSONContent => n !== null);
      return { type: "blockquote", content };
    }
    case "code": {
      const attrs = { language: node.lang ?? null };
      const result: JSONContent = { type: "codeBlock", attrs };
      if (node.value) {
        result.content = [{ type: "text", text: node.value }];
      }
      return result;
    }
    case "thematicBreak":
      return { type: "horizontalRule" };
    case "image":
      return convertImageToTiptap(node);
    case "mdxJsxFlowElement":
    case "mdxjsEsm":
      return { type: "mdxBlock", attrs: { value: rawSlice(node, source) } };
    default:
      // 지원하지 않는 블록 노드: 원문을 그대로 보존해 데이터 유실을 막는다.
      return { type: "mdxBlock", attrs: { value: rawSlice(node, source) } };
  }
}

function convertImageToTiptap(node: MdastNode & { type: "image" }): JSONContent {
  const attrs: Record<string, unknown> = { src: node.url, alt: node.alt ?? null };
  if (node.title) attrs.title = node.title;
  return { type: "image", attrs };
}

function convertInlineChildren(children: MdastNode[], source: string): JSONContent[] {
  const result: JSONContent[] = [];
  for (const child of children) {
    result.push(...convertInline(child, [], source));
  }
  return result;
}

function convertInline(node: MdastNode, marks: TiptapMark[], source: string): JSONContent[] {
  switch (node.type) {
    case "text":
      return [textNode(node.value, marks)];
    case "strong":
      return flattenChildren(node.children, [...marks, { type: "bold" }], source);
    case "emphasis":
      return flattenChildren(node.children, [...marks, { type: "italic" }], source);
    case "delete":
      return flattenChildren(node.children, [...marks, { type: "strike" }], source);
    case "inlineCode":
      return [textNode(node.value, [...marks, { type: "code" }])];
    case "link": {
      const attrs: Record<string, unknown> = { href: node.url };
      if (node.title) attrs.title = node.title;
      return flattenChildren(node.children, [...marks, { type: "link", attrs }], source);
    }
    case "break":
      return [{ type: "hardBreak" }];
    case "image":
      return [convertImageToTiptap(node)];
    case "mdxJsxTextElement":
      if (node.name === "u") {
        return flattenChildren(node.children, [...marks, { type: "underline" }], source);
      }
      // 지원하지 않는 인라인 JSX: 원문 텍스트로라도 보존한다.
      return [textNode(rawSlice(node, source), marks)];
    default:
      return [];
  }
}

function flattenChildren(children: MdastNode[], marks: TiptapMark[], source: string): JSONContent[] {
  const result: JSONContent[] = [];
  for (const child of children) {
    result.push(...convertInline(child, marks, source));
  }
  return result;
}

function textNode(text: string, marks: TiptapMark[]): JSONContent {
  if (marks.length === 0) return { type: "text", text };
  return { type: "text", text, marks: marks.map((m) => (m.attrs ? { type: m.type, attrs: m.attrs } : { type: m.type })) };
}

// ----------------------------------------------------------------------------
// Tiptap JSON -> markdown
// ----------------------------------------------------------------------------

export function docToMarkdown(doc: JSONContent): string {
  const children = (doc.content ?? []).map(convertBlockToMdast);
  const tree: MdastRoot = { type: "root", children: children as MdastRoot["children"] };
  return String(stringifier().stringify(tree));
}

function convertBlockToMdast(node: JSONContent): MdastNode {
  switch (node.type) {
    case "paragraph":
      return {
        type: "paragraph",
        children: convertInlineToMdast(node.content ?? []),
      } as MdastNode;
    case "heading":
      return {
        type: "heading",
        depth: (node.attrs?.level as 1 | 2 | 3) ?? 1,
        children: convertInlineToMdast(node.content ?? []),
      } as MdastNode;
    case "bulletList":
      return {
        type: "list",
        ordered: false,
        spread: false,
        children: (node.content ?? []).map(convertBlockToMdast),
      } as unknown as MdastNode;
    case "orderedList":
      return {
        type: "list",
        ordered: true,
        start: (node.attrs?.start as number) ?? 1,
        spread: false,
        children: (node.content ?? []).map(convertBlockToMdast),
      } as unknown as MdastNode;
    case "listItem":
      return {
        type: "listItem",
        spread: false,
        children: (node.content ?? []).map(convertBlockToMdast),
      } as unknown as MdastNode;
    case "blockquote":
      return {
        type: "blockquote",
        children: (node.content ?? []).map(convertBlockToMdast),
      } as MdastNode;
    case "codeBlock": {
      const value = (node.content ?? []).map((t) => t.text ?? "").join("");
      return {
        type: "code",
        lang: (node.attrs?.language as string | null) ?? null,
        value,
      } as MdastNode;
    }
    case "horizontalRule":
      return { type: "thematicBreak" } as MdastNode;
    case "image":
      return {
        type: "paragraph",
        children: [imageAttrsToMdast(node)],
      } as MdastNode;
    case "mdxBlock":
      return { type: "mdxRaw", value: node.attrs?.value as string };
    default:
      throw new Error(`지원하지 않는 노드 타입: ${node.type}`);
  }
}

function imageAttrsToMdast(node: JSONContent): MdastNode {
  const attrs = node.attrs ?? {};
  return {
    type: "image",
    url: attrs.src as string,
    alt: (attrs.alt as string | null) ?? null,
    title: (attrs.title as string | undefined) ?? null,
  } as MdastNode;
}

function convertInlineToMdast(content: JSONContent[]): MdastNode[] {
  const result: MdastNode[] = [];
  for (const node of content) {
    result.push(inlineNodeToMdast(node));
  }
  return result;
}

function inlineNodeToMdast(node: JSONContent): MdastNode {
  if (node.type === "hardBreak") return { type: "break" } as MdastNode;
  if (node.type === "image") return imageAttrsToMdast(node);
  if (node.type !== "text") {
    throw new Error(`지원하지 않는 인라인 노드 타입: ${node.type}`);
  }

  const marks = (node.marks ?? []) as TiptapMark[];
  const markTypes = new Set(marks.map((m) => m.type));
  const text = node.text ?? "";

  let current: MdastNode = markTypes.has("code")
    ? ({ type: "inlineCode", value: text } as MdastNode)
    : ({ type: "text", value: text } as MdastNode);

  for (const markType of WRAP_ORDER_INNER_TO_OUTER) {
    if (!markTypes.has(markType)) continue;
    current = wrapWithMark(markType, current, marks.find((m) => m.type === markType));
  }

  return current;
}

function wrapWithMark(markType: Exclude<MarkType, "code">, child: MdastNode, mark?: TiptapMark): MdastNode {
  switch (markType) {
    case "bold":
      return { type: "strong", children: [child] } as MdastNode;
    case "italic":
      return { type: "emphasis", children: [child] } as MdastNode;
    case "strike":
      return { type: "delete", children: [child] } as MdastNode;
    case "underline":
      return {
        type: "mdxJsxTextElement",
        name: "u",
        attributes: [],
        children: [child],
      } as unknown as MdastNode;
    case "link": {
      const href = (mark?.attrs?.href as string) ?? "";
      const title = (mark?.attrs?.title as string | undefined) ?? null;
      return { type: "link", url: href, title, children: [child] } as MdastNode;
    }
  }
}
