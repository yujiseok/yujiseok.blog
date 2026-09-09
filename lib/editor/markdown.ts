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
import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";

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

// 표를 쓸 때 remark-gfm 의 기본값은 셀을 열 너비에 맞춰 공백으로 채운다. 그
// 너비를 문자 개수로 재기 때문에 한글 표에서는 오히려 어긋나 보인다. 파이프만
// 최소로 찍는다 — 렌더 결과는 같다.
const GFM_WRITE_OPTIONS = { tablePipeAlign: false };

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
    .use(remarkGfm, GFM_WRITE_OPTIONS)
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
    case "table":
      return convertTableToTiptap(node, source);
    case "thematicBreak":
      return { type: "horizontalRule" };
    case "image":
      return convertImageToTiptap(node);
    case "mdxJsxFlowElement":
      // 정적으로 읽히는 <Image>와 정렬용 <div>만 편집 가능한 노드로 승격한다.
      // 나머지 JSX는 아래로 흘러 원문 그대로 보존된다.
      return (
        convertImageJsxToTiptap(node) ??
        convertAlignDivToTiptap(node, source) ?? {
          type: "mdxBlock",
          attrs: { value: rawSlice(node, source) },
        }
      );
    case "mdxjsEsm":
      return { type: "mdxBlock", attrs: { value: rawSlice(node, source) } };
    default:
      // 지원하지 않는 블록 노드: 원문을 그대로 보존해 데이터 유실을 막는다.
      return { type: "mdxBlock", attrs: { value: rawSlice(node, source) } };
  }
}

// ----------------------------------------------------------------------------
// 이미지
// 크기·정렬을 담아야 하므로 마크다운 `![]()` 만으로는 부족하다. width/height 가
// 있으면 <Image> JSX 로, 없으면 마크다운으로 쓴다 — 원래 표기가 무엇이었든
// 값이 형식을 결정하므로 왕복이 깨지지 않는다.
// ----------------------------------------------------------------------------

// 이미지와 문단이 같은 값 체계를 쓴다. 다만 "값 없음"의 뜻은 서로 다르다 —
// 이미지는 가운데가, 문단은 왼쪽이 렌더 기본이다. app/editor/align.ts 참고.
const ALIGNS = ["left", "center", "right"] as const;

type Align = (typeof ALIGNS)[number];

interface ImageAttrs {
  src: string;
  alt: string | null;
  title?: string;
  width: number | null;
  height: number | null;
  align: Align | null;
}

const EMPTY_IMAGE_ATTRS: ImageAttrs = {
  src: "",
  alt: null,
  width: null,
  height: null,
  align: null,
};

function convertImageToTiptap(
  node: MdastNode & { type: "image" },
): JSONContent {
  return imageNode({
    ...EMPTY_IMAGE_ATTRS,
    src: node.url,
    alt: node.alt ?? null,
    ...(node.title ? { title: node.title } : {}),
  });
}

const imageNode = (attrs: ImageAttrs): JSONContent => ({
  type: "image",
  attrs,
});

type JsxAttrValue = MdxJsxAttribute["value"];

const isAlign = (value: string): value is Align =>
  ALIGNS.some((candidate) => candidate === value);

// attrs 는 스키마가 타입을 보장하지 않는 Record<string, any> 다. 읽는 쪽에서
// 한 번만 좁힌다.
const toAlign = (value: unknown): Align | null =>
  typeof value === "string" && isAlign(value) ? value : null;

const readString = <T>(
  value: JsxAttrValue,
  onValue: (text: string) => T | null,
): T | null => (typeof value === "string" ? onValue(value) : null);

// width={768} 도 width="768" 도 숫자로 읽는다. 변수 참조처럼 표현식 안이
// 숫자가 아니면 읽기를 포기한다.
const readNumber = <T>(
  value: JsxAttrValue,
  onValue: (amount: number) => T | null,
): T | null => {
  const raw = (typeof value === "string" ? value : (value?.value ?? "")).trim();
  const parsed = Number(raw);

  return raw !== "" && Number.isFinite(parsed) ? onValue(parsed) : null;
};

/**
 * 이름별 속성 리더. 여기 없는 이름(style, className, priority...)이나 값을
 * 정적으로 못 읽는 속성이 하나라도 있으면 그 <Image>는 승격하지 않는다.
 */
const IMAGE_ATTR_READERS = new Map<
  string,
  (value: JsxAttrValue) => Partial<ImageAttrs> | null
>([
  ["src", (value) => readString(value, (src) => (src ? { src } : null))],
  ["alt", (value) => readString(value, (alt) => ({ alt }))],
  ["title", (value) => readString(value, (title) => ({ title }))],
  ["width", (value) => readNumber(value, (width) => ({ width }))],
  ["height", (value) => readNumber(value, (height) => ({ height }))],
  [
    "align",
    (value) =>
      readString(value, (align) => (isAlign(align) ? { align } : null)),
  ],
]);

/**
 * 이름이 정확히 Image 이고 속성이 전부 정적으로 읽히는 JSX 만 편집 가능한
 * image 노드로 만든다. 하나라도 해석 못 하면 null 을 돌려 호출자가 원문
 * 그대로(mdxBlock) 두게 한다 — 억지로 파싱해 원문을 깎는 것보다 낫다.
 */
function convertImageJsxToTiptap(
  node: MdastNode & { type: "mdxJsxFlowElement" },
): JSONContent | null {
  if (node.name !== "Image" || node.children.length > 0) return null;

  // 스프레드({...props})는 이름이 없어 리더를 고를 수 없다.
  const named = node.attributes.filter(
    (attribute) => attribute.type === "mdxJsxAttribute",
  );
  const parts = named.flatMap((attribute) => {
    const part = IMAGE_ATTR_READERS.get(attribute.name)?.(attribute.value);
    return part ? [part] : [];
  });

  if (parts.length !== node.attributes.length) return null;

  const attrs = parts.reduce<ImageAttrs>(
    (merged, part) => ({ ...merged, ...part }),
    EMPTY_IMAGE_ATTRS,
  );

  return attrs.src ? imageNode(attrs) : null;
}

// ----------------------------------------------------------------------------
// 문단 정렬
// 마크다운에는 정렬을 담을 자리가 없어 <div style={{ textAlign }}> 로 감싼다.
// <p style> 는 remark 가 자식을 다시 paragraph 로 넣어 <p><p> 가 되므로 쓸 수
// 없다. <Image> 와 같은 구조 — 판독기와 생성기를 한 쌍의 함수로 격리한다.
// ----------------------------------------------------------------------------

/**
 * style={{ textAlign: "center" }} 하나만 정렬로 읽는다. 프로퍼티가 더 있거나
 * 값이 변수면(= 정적으로 못 읽으면) null 이다.
 */
function readTextAlign(value: JsxAttrValue): Align | null {
  if (value == null || typeof value === "string") return null;

  const body = value.data?.estree?.body ?? [];
  const [statement] = body;
  if (body.length !== 1 || statement?.type !== "ExpressionStatement") {
    return null;
  }

  const { expression } = statement;
  if (expression.type !== "ObjectExpression") return null;

  const [property] = expression.properties;
  if (expression.properties.length !== 1 || property?.type !== "Property") {
    return null;
  }
  if (property.key.type !== "Identifier" || property.key.name !== "textAlign") {
    return null;
  }

  const literal = property.value;
  return literal.type === "Literal" &&
    typeof literal.value === "string" &&
    isAlign(literal.value)
    ? literal.value
    : null;
}

/**
 * 이름이 정확히 div 이고, 속성이 style 하나뿐이고, 그 값이 textAlign 한
 * 프로퍼티짜리 객체이고, 자식이 문단·제목 하나뿐일 때만 정렬로 승격한다.
 *
 * 이렇게까지 좁히는 이유: openForEditing 의 lossless 판정이 쓰는
 * mdast-util-to-string 은 attribute 값을 보지 않는다. <div className="flex"> 를
 * 잘못 승격시켜 className 을 날려도 lossless 는 계속 true 다. 안전망은 판정식이
 * 아니라 오직 이 조건들이다 — 하나라도 어긋나면 null 을 돌려 호출자가 원문
 * 그대로(mdxBlock) 두게 한다.
 */
function convertAlignDivToTiptap(
  node: MdastNode & { type: "mdxJsxFlowElement" },
  source: string,
): JSONContent | null {
  if (node.name !== "div" || node.attributes.length !== 1) return null;

  const [attribute] = node.attributes;
  if (attribute.type !== "mdxJsxAttribute" || attribute.name !== "style") {
    return null;
  }

  const align = readTextAlign(attribute.value);
  if (align === null || node.children.length !== 1) return null;

  const child = convertBlockToTiptap(node.children[0], source);
  // 이미지나 중첩 JSX 가 나오면 align attr 의 뜻이 달라진다(이미지는 null 이
  // 가운데다). 문단·제목으로 읽힌 것만 받는다.
  if (
    child === null ||
    (child.type !== "paragraph" && child.type !== "heading")
  ) {
    return null;
  }

  // 왼쪽은 문단의 렌더 기본이라 attr 을 비운다 — 보이는 결과는 같고 div 만
  // 사라진다.
  return align === "left"
    ? child
    : { ...child, attrs: { ...child.attrs, align } };
}

// ----------------------------------------------------------------------------
// 표
// GFM 파이프 표 <-> table > tableRow > (tableHeader|tableCell) > paragraph.
// 정렬은 mdast 에서 열 단위(table.align) 한 벌이지만 Tiptap 스키마에는 열을 담을
// 노드가 없다. 셀마다 같은 값을 실어 두고, 되돌릴 때 헤더 행에서 다시 읽는다 —
// 값 체계는 이미지·문단과 같은 "left"|"center"|"right"|null 이다.
// ----------------------------------------------------------------------------

function convertTableToTiptap(
  node: MdastNode & { type: "table" },
  source: string,
): JSONContent {
  const align = node.align ?? [];

  return {
    type: "table",
    content: node.children.map((row, rowIndex) => ({
      type: "tableRow",
      content: row.children.map((cell, columnIndex) => ({
        // GFM 표의 첫 행은 언제나 헤더다. 구분선 없이 본문만 있는 표는 문법상
        // 존재하지 않으므로 행 번호만으로 판정할 수 있다.
        type: rowIndex === 0 ? "tableHeader" : "tableCell",
        attrs: { align: align[columnIndex] ?? null },
        content: [
          cellParagraph(convertInlineChildren(cell.children, [], source)),
        ],
      })),
    })),
  };
}

// 빈 셀도 문단 하나는 있어야 스키마를 만족한다. 내용이 없을 때 content 키를
// 비워 두는 건 Tiptap 의 getJSON 이 내놓는 모양과 맞추기 위해서다.
const cellParagraph = (content: JSONContent[]): JSONContent =>
  content.length === 0 ? { type: "paragraph" } : { type: "paragraph", content };

function tableToMdast(node: JSONContent): MdastNode {
  const rows = node.content ?? [];

  return {
    type: "table",
    // 열 정렬은 구분선 한 줄에만 실린다. 행마다 다른 값이 들어 있어도 쓸 수
    // 있는 건 하나뿐이라 헤더 행을 그 열의 대표값으로 삼는다.
    align: (rows[0]?.content ?? []).map((cell) => toAlign(cell.attrs?.align)),
    children: rows.map((row) => ({
      type: "tableRow",
      children: (row.content ?? []).map((cell) => ({
        type: "tableCell",
        // GFM 셀에는 블록을 담을 수 없다. 셀 안 문단들의 인라인만 이어 붙인다.
        children: (cell.content ?? []).flatMap((block) =>
          convertInlineToMdast(block.content ?? []),
        ),
      })),
    })),
  } as unknown as MdastNode;
}

const convertInlineChildren = (
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
      return convertInlineChildren(
        node.children,
        [...marks, { type: "bold" }],
        source,
      );
    case "emphasis":
      return convertInlineChildren(
        node.children,
        [...marks, { type: "italic" }],
        source,
      );
    case "delete":
      return convertInlineChildren(
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

// 블록의 mdxBlock에 대응하는 인라인판. 편집은 못 하지만 저장해도 깎이지 않는다.
function rawInline(node: MdastNode, source: string): JSONContent {
  return { type: "mdxInline", attrs: { value: rawSlice(node, source) } };
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
  const children = (doc.content ?? []).map(convertTopLevelBlockToMdast);
  const tree: MdastRoot = {
    type: "root",
    children: children as MdastRoot["children"],
  };
  return String(stringifier().stringify(tree));
}

/**
 * 정렬 div 는 최상위에서만 씌운다. 목록·인용 안에서 감싸면 `- <div ...>` 가
 * 되어 마크다운이 깨지므로, 재귀 경로인 convertBlockToMdast 는 align 을 아예
 * 보지 않는다.
 */
function convertTopLevelBlockToMdast(node: JSONContent): MdastNode {
  const align = wrappingAlignOf(node);
  const mdast = convertBlockToMdast(node);

  return align === null ? mdast : alignDivToMdast(align, mdast);
}

// 왼쪽(과 null)은 문단의 렌더 기본이라 감쌀 이유가 없다. 이미지의 align 은
// image 노드가 <Image align="..."> 로 따로 쓴다.
const wrappingAlignOf = (node: JSONContent): Exclude<Align, "left"> | null => {
  if (node.type !== "paragraph" && node.type !== "heading") return null;

  const align = node.attrs?.align;
  return align === "center" || align === "right" ? align : null;
};

const alignDivToMdast = (align: Align, child: MdastNode): MdastNode =>
  ({
    type: "mdxJsxFlowElement",
    name: "div",
    attributes: [
      {
        type: "mdxJsxAttribute",
        name: "style",
        value: {
          type: "mdxJsxAttributeValueExpression",
          value: `{ textAlign: "${align}" }`,
        },
      },
    ],
    children: [child],
  }) as unknown as MdastNode;

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
    case "table":
      return tableToMdast(node);
    case "horizontalRule":
      return { type: "thematicBreak" } as MdastNode;
    case "image":
      return (
        imageJsxToMdast(node, "mdxJsxFlowElement") ??
        ({
          type: "paragraph",
          children: [imageAttrsToMdast(node)],
        } as MdastNode)
      );
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

const jsxAttribute = (name: string, value: string) => ({
  type: "mdxJsxAttribute" as const,
  name,
  value,
});

const jsxNumberAttribute = (name: string, value: number) => ({
  type: "mdxJsxAttribute" as const,
  name,
  value: {
    type: "mdxJsxAttributeValueExpression" as const,
    value: String(value),
  },
});

/**
 * 크기가 있는 이미지만 JSX 로 쓴다. 마크다운 `![]()` 에는 크기·정렬을 담을
 * 자리가 없기 때문이다. 크기가 없으면 null 을 돌려 마크다운 표기로 되돌린다.
 */
function imageJsxToMdast(
  node: JSONContent,
  elementType: "mdxJsxFlowElement" | "mdxJsxTextElement",
): MdastNode | null {
  const attrs = node.attrs ?? {};
  const width = attrs.width as number | null | undefined;
  const height = attrs.height as number | null | undefined;

  if (width == null || height == null) return null;

  const title = attrs.title as string | undefined;
  const align = attrs.align as Align | null | undefined;

  return {
    type: elementType,
    name: "Image",
    attributes: [
      jsxAttribute("src", (attrs.src as string) ?? ""),
      jsxAttribute("alt", (attrs.alt as string | null) ?? ""),
      ...(title ? [jsxAttribute("title", title)] : []),
      jsxNumberAttribute("width", width),
      jsxNumberAttribute("height", height),
      ...(align ? [jsxAttribute("align", align)] : []),
    ],
    children: [],
  } as unknown as MdastNode;
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
  if (node.type === "image") {
    return (
      imageJsxToMdast(node, "mdxJsxTextElement") ?? imageAttrsToMdast(node)
    );
  }
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
