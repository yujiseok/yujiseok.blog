import type { JSONContent } from "@tiptap/core";
import type { Image, Paragraph } from "mdast";
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import { toAlign, type Align } from "../../align-value";
import { asNumber, asString } from "../attrs";

// ----------------------------------------------------------------------------
// 이미지
// 크기·정렬을 담아야 하므로 마크다운 `![]()` 만으로는 부족하다. width/height 가
// 있으면 <Image> JSX 로, 없으면 마크다운으로 쓴다 — 원래 표기가 무엇이었든
// 값이 형식을 결정하므로 왕복이 깨지지 않는다.
//
// 이미지와 문단이 같은 정렬 값 체계를 쓴다. 다만 "값 없음"의 뜻은 서로 다르다 —
// 이미지는 가운데가, 문단은 왼쪽이 렌더 기본이다. lib/editor/align.ts 참고.
// ----------------------------------------------------------------------------

export interface ImageAttrs {
  src: string;
  alt: string | null;
  title?: string | null;
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

const imageNode = (attrs: ImageAttrs): JSONContent => ({
  type: "image",
  attrs,
});

export function convertImageToTiptap(node: Image): JSONContent {
  return imageNode({
    ...EMPTY_IMAGE_ATTRS,
    src: node.url,
    alt: node.alt ?? null,
    ...(node.title ? { title: node.title } : {}),
  });
}

type JsxAttrValue = MdxJsxAttribute["value"];

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
      readString(value, (text) => {
        const align = toAlign(text);
        return align && { align };
      }),
  ],
]);

/**
 * 이름이 정확히 Image 이고 속성이 전부 정적으로 읽히는 JSX 만 편집 가능한
 * image 노드로 만든다. 하나라도 해석 못 하면 null 을 돌려 호출자가 원문
 * 그대로(mdxBlock) 두게 한다 — 억지로 파싱해 원문을 깎는 것보다 낫다.
 */
export function convertImageJsxToTiptap(
  node: MdxJsxFlowElement,
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
// Tiptap -> mdast
// ----------------------------------------------------------------------------

const jsxAttribute = (name: string, value: string): MdxJsxAttribute => ({
  type: "mdxJsxAttribute",
  name,
  value,
});

const jsxNumberAttribute = (name: string, value: number): MdxJsxAttribute => ({
  type: "mdxJsxAttribute",
  name,
  value: { type: "mdxJsxAttributeValueExpression", value: String(value) },
});

const imageToMarkdown = (node: JSONContent): Image => ({
  type: "image",
  url: asString(node.attrs?.src) ?? "",
  alt: asString(node.attrs?.alt),
  title: asString(node.attrs?.title),
});

/**
 * 크기가 있는 이미지만 JSX 속성으로 쓴다. 마크다운 `![]()` 에는 크기·정렬을
 * 담을 자리가 없기 때문이다. 크기가 없으면 null 을 돌려 마크다운 표기로 되돌린다.
 */
function imageJsxAttributes(node: JSONContent): MdxJsxAttribute[] | null {
  const attrs = node.attrs;
  const width = asNumber(attrs?.width);
  const height = asNumber(attrs?.height);

  if (width === null || height === null) return null;

  const title = asString(attrs?.title);
  const align = toAlign(attrs?.align);

  return [
    jsxAttribute("src", asString(attrs?.src) ?? ""),
    jsxAttribute("alt", asString(attrs?.alt) ?? ""),
    ...(title ? [jsxAttribute("title", title)] : []),
    jsxNumberAttribute("width", width),
    jsxNumberAttribute("height", height),
    ...(align ? [jsxAttribute("align", align)] : []),
  ];
}

export function imageToMdast(node: JSONContent): MdxJsxFlowElement | Paragraph {
  const attributes = imageJsxAttributes(node);

  return attributes
    ? { type: "mdxJsxFlowElement", name: "Image", attributes, children: [] }
    : { type: "paragraph", children: [imageToMarkdown(node)] };
}

export function inlineImageToMdast(
  node: JSONContent,
): MdxJsxTextElement | Image {
  const attributes = imageJsxAttributes(node);

  return attributes
    ? { type: "mdxJsxTextElement", name: "Image", attributes, children: [] }
    : imageToMarkdown(node);
}
