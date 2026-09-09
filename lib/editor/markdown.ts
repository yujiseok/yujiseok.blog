import type { JSONContent } from "@tiptap/core";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import { toString as mdastToString } from "mdast-util-to-string";
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
      handlers: {
        // mdxRaw: 원문 그대로 보존해야 하는 노드. 이스케이프 없이 출력한다.
        mdxRaw: (node: MdxRaw) => node.value,
        // 기본값은 줄 끝 백슬래시지만 이 저장소의 기존 글은 전부 공백 두 칸을
        // 쓴다. 의미는 같아도 표기가 달라지면 왕복이 깨진다.
        break: () => "  \n",
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

export interface OpenedDocument {
  doc: JSONContent;
  /**
   * 편집 후 저장해도 본문 "내용"이 보존되는지. 빈 줄·이스케이프·목록 마커
   * 간격 같은 표기 차이는 허용한다 — remark-stringify가 항상 정규화하므로
   * 바이트 동일성을 요구하면 기존 글 전부가 편집 불가가 된다.
   */
  lossless: boolean;
}

/**
 * 이 모듈의 진짜 계약은 markdownToDoc 도 docToMarkdown 도 아니고 둘의 합성이다:
 * "열었다가 저장하면 내용이 그대로여야 한다." 그 판정을 호출자가 조립하게
 * 두면 판정 규칙이 모듈 밖으로 새므로 여기서 함께 내놓는다.
 */
export function openForEditing(markdown: string): OpenedDocument {
  const doc = markdownToDoc(markdown);

  return {
    doc,
    lossless: contentOf(docToMarkdown(doc)) === contentOf(markdown),
  };
}

const contentOf = (markdown: string): string =>
  mdastToString(parser().parse(markdown)).replace(/\s+/g, " ").trim();

export function markdownToDoc(markdown: string): JSONContent {
  const tree = parser().parse(markdown) as MdastRoot;

  const content = tree.children
    .map((node) => convertBlockToTiptap(node, markdown))
    .filter((n): n is JSONContent => n !== null);

  return { type: "doc", content };
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

function convertBlockToTiptap(
  node: MdastNode,
  source: string,
): JSONContent | null {
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
      return {
        type: "paragraph",
        content: convertInlineChildren(node.children, source),
      };
    }
    case "heading": {
      return {
        type: "heading",
        // 상한을 3으로 깎으면 기존 글의 ####가 조용히 ###로 강등된다.
        // 마크다운이 허용하는 6까지 그대로 받는다.
        attrs: { level: node.depth },
        content: convertInlineChildren(node.children, source),
      };
    }
    case "list": {
      const items = node.children
        .map((child) => convertBlockToTiptap(child, source))
        .filter((n): n is JSONContent => n !== null);
      const attrs: Record<string, unknown> = {};
      // 느슨한 목록(항목 사이 빈 줄)을 tight로 눌러버리면 렌더된 간격이 바뀐다
      if (node.spread) attrs.spread = true;
      if (node.ordered) {
        if (node.start != null && node.start !== 1) attrs.start = node.start;
        return {
          type: "orderedList",
          ...(Object.keys(attrs).length ? { attrs } : {}),
          content: items,
        };
      }
      return {
        type: "bulletList",
        ...(Object.keys(attrs).length ? { attrs } : {}),
        content: items,
      };
    }
    case "listItem": {
      const content = node.children
        .map((child) => convertBlockToTiptap(child, source))
        .filter((n): n is JSONContent => n !== null);
      const attrs: Record<string, unknown> = {};
      if (node.spread) attrs.spread = true;
      // GFM 체크박스. 버리면 - [x]가 그냥 -로 바뀐다
      if (node.checked != null) attrs.checked = node.checked;
      return {
        type: "listItem",
        ...(Object.keys(attrs).length ? { attrs } : {}),
        content,
      };
    }
    case "blockquote": {
      const content = node.children
        .map((child) => convertBlockToTiptap(child, source))
        .filter((n): n is JSONContent => n !== null);
      return { type: "blockquote", content };
    }
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

function convertImageToTiptap(
  node: MdastNode & { type: "image" },
): JSONContent {
  const attrs: Record<string, unknown> = {
    src: node.url,
    alt: node.alt ?? null,
  };
  if (node.title) attrs.title = node.title;
  return { type: "image", attrs };
}

function convertInlineChildren(
  children: MdastNode[],
  source: string,
): JSONContent[] {
  const result: JSONContent[] = [];
  for (const child of children) {
    result.push(...convertInline(child, [], source));
  }
  return result;
}

function convertInline(
  node: MdastNode,
  marks: TiptapMark[],
  source: string,
): JSONContent[] {
  switch (node.type) {
    case "text":
      return [textNode(node.value, marks)];
    case "strong":
      return flattenChildren(
        node.children,
        [...marks, { type: "bold" }],
        source,
      );
    case "emphasis":
      return flattenChildren(
        node.children,
        [...marks, { type: "italic" }],
        source,
      );
    case "delete":
      return flattenChildren(
        node.children,
        [...marks, { type: "strike" }],
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
      return flattenChildren(
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
        return flattenChildren(
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

// 블록의 mdxBlock에 대응하는 인라인판. 편집은 못 하지만 저장해도 깎이지 않는다.
function rawInline(node: MdastNode, source: string): JSONContent {
  return { type: "mdxInline", attrs: { value: rawSlice(node, source) } };
}

function flattenChildren(
  children: MdastNode[],
  marks: TiptapMark[],
  source: string,
): JSONContent[] {
  const result: JSONContent[] = [];
  for (const child of children) {
    result.push(...convertInline(child, marks, source));
  }
  return result;
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

// ----------------------------------------------------------------------------
// Tiptap JSON -> markdown
// ----------------------------------------------------------------------------

export function docToMarkdown(doc: JSONContent): string {
  const children = (doc.content ?? []).map(convertBlockToMdast);
  const tree: MdastRoot = {
    type: "root",
    children: children as MdastRoot["children"],
  };
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
        depth: (node.attrs?.level as 1 | 2 | 3 | 4 | 5 | 6) ?? 1,
        children: convertInlineToMdast(node.content ?? []),
      } as MdastNode;
    case "bulletList":
      return {
        type: "list",
        ordered: false,
        spread: (node.attrs?.spread as boolean) ?? false,
        children: (node.content ?? []).map(convertBlockToMdast),
      } as unknown as MdastNode;
    case "orderedList":
      return {
        type: "list",
        ordered: true,
        start: (node.attrs?.start as number) ?? 1,
        spread: (node.attrs?.spread as boolean) ?? false,
        children: (node.content ?? []).map(convertBlockToMdast),
      } as unknown as MdastNode;
    case "listItem":
      return {
        type: "listItem",
        spread: (node.attrs?.spread as boolean) ?? false,
        checked: (node.attrs?.checked as boolean | null) ?? null,
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
        meta: (node.attrs?.meta as string | null) ?? null,
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

const marksOf = (node: JSONContent): TiptapMark[] =>
  (node.marks ?? []) as TiptapMark[];

// code 는 inlineCode 리프로 내려가므로 감싸기 대상이 아니다
const wrappingMarksOf = (node: JSONContent): TiptapMark[] =>
  node.type === "text" ? marksOf(node).filter((m) => m.type !== "code") : [];

const markKey = (node: JSONContent): string =>
  node.type !== "text"
    ? ` ${node.type}`
    : JSON.stringify(
        wrappingMarksOf(node).map((m) => [m.type, m.attrs ?? null]),
      );

// 인접한 같은 키의 항목을 한 덩어리로 묶는다
const groupAdjacent = <T>(items: T[], keyOf: (item: T) => string): T[][] =>
  items.reduce<T[][]>((groups, item) => {
    const last = groups.at(-1);

    return last && keyOf(last[0]) === keyOf(item)
      ? [...groups.slice(0, -1), [...last, item]]
      : [...groups, [item]];
  }, []);

// 덩어리 하나를 바깥 마크로 한 번만 감싼다. 노드마다 따로 감싸면 **굵게** 가
// 인접할 때 `**a****b**` 가 되어 원문에 없던 ** 가 본문에 새어든다.
const runToMdast = (run: JSONContent[]): MdastNode[] => {
  const wrapping = wrappingMarksOf(run[0]);
  const children = run.map(inlineNodeToMdast);

  if (wrapping.length === 0) return children;

  return [
    WRAP_ORDER_INNER_TO_OUTER.filter((markType) =>
      wrapping.some((m) => m.type === markType),
    ).reduce<MdastNode | MdastNode[]>(
      (inner, markType) =>
        wrapWithMark(
          markType,
          inner,
          wrapping.find((m) => m.type === markType),
        ),
      children,
    ) as MdastNode,
  ];
};

const convertInlineToMdast = (content: JSONContent[]): MdastNode[] =>
  groupAdjacent(content, markKey).flatMap(runToMdast);

const inlineNodeToMdast = (node: JSONContent): MdastNode => {
  if (node.type === "hardBreak") return { type: "break" } as MdastNode;
  if (node.type === "image") return imageAttrsToMdast(node);
  if (node.type === "mdxInline") {
    return { type: "mdxRaw", value: node.attrs?.value as string };
  }
  if (node.type !== "text") {
    throw new Error(`지원하지 않는 인라인 노드 타입: ${node.type}`);
  }

  const text = node.text ?? "";

  // 감싸는 마크는 runToMdast 가 덩어리 단위로 처리한다. 여기서는 리프만 본다.
  return marksOf(node).some((m) => m.type === "code")
    ? ({ type: "inlineCode", value: text } as MdastNode)
    : ({ type: "text", value: text } as MdastNode);
};

function wrapWithMark(
  markType: Exclude<MarkType, "code">,
  child: MdastNode | MdastNode[],
  mark?: TiptapMark,
): MdastNode {
  const children = Array.isArray(child) ? child : [child];

  switch (markType) {
    case "bold":
      return { type: "strong", children } as MdastNode;
    case "italic":
      return { type: "emphasis", children } as MdastNode;
    case "strike":
      return { type: "delete", children } as MdastNode;
    case "underline":
      return {
        type: "mdxJsxTextElement",
        name: "u",
        attributes: [],
        children,
      } as unknown as MdastNode;
    case "link": {
      const href = (mark?.attrs?.href as string) ?? "";
      const title = (mark?.attrs?.title as string | undefined) ?? null;
      return { type: "link", url: href, title, children } as MdastNode;
    }
  }
}
