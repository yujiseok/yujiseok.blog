import type { JSONContent } from "@tiptap/core";
import type { MdxJsxAttribute, MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { toAlign, type Align } from "../../align-value";
import { convertBlockToTiptap } from "../parse";
import type { MdastBlock } from "../serialize";

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
function readTextAlign(value: MdxJsxAttribute["value"]): Align | null {
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
  return literal.type === "Literal" ? toAlign(literal.value) : null;
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
export function convertAlignDivToTiptap(
  node: MdxJsxFlowElement,
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
  if (child.type !== "paragraph" && child.type !== "heading") return null;

  // 왼쪽은 문단의 렌더 기본이라 attr 을 비운다 — 보이는 결과는 같고 div 만
  // 사라진다.
  return align === "left"
    ? child
    : { ...child, attrs: { ...child.attrs, align } };
}

export const alignDivToMdast = (
  align: Align,
  child: MdastBlock,
): MdxJsxFlowElement => ({
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
});
