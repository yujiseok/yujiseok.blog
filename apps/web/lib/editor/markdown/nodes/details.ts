import type { JSONContent } from "@tiptap/core";
import type { RootContent as MdastNode } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import type { ToMdast, ToTiptap } from "./recurse";

// ----------------------------------------------------------------------------
// 접기 블록
// 기존 글이 쓰는 <details><summary>제목</summary> 본문…</details> 그대로다.
// remark 는 한 줄짜리 <summary> 를 flow 가 아니라 문단 안의 text 요소로 읽으므로
// 첫 자식은 언제나 "mdxJsxTextElement 하나만 든 문단"이다 — 되돌릴 때도 같은
// 모양으로 쓴다.
// ----------------------------------------------------------------------------

/**
 * 속성은 없거나 open 하나뿐이어야 한다. JSX 불리언 단축(`<details open>`)은
 * 값이 없고, `open={true}` 는 표현식이다. 그 둘 말고는(문자열 값, 변수 참조,
 * 다른 이름의 속성) 전부 null 을 돌려 승격을 거부한다.
 */
function readDetailsOpen(node: MdxJsxFlowElement): boolean | null {
  if (node.attributes.length === 0) return false;
  if (node.attributes.length > 1) return null;

  const [attribute] = node.attributes;
  if (attribute.type !== "mdxJsxAttribute" || attribute.name !== "open") {
    return null;
  }
  if (attribute.value == null) return true;
  if (typeof attribute.value === "string") return null;

  const literal = attribute.value.value.trim();
  return literal === "true" ? true : literal === "false" ? false : null;
}

/**
 * 첫 자식이 <summary> 이고 그 안이 인라인 텍스트뿐일 때만 요약을 읽는다.
 * detailsSummary 스키마가 text* 라, 하드브레이크·이미지·미지의 인라인 JSX가
 * 섞이면 담을 자리가 없어 통째로 거부한다.
 */
function readDetailsSummary(
  node: MdastNode,
  source: string,
  to: ToTiptap,
): JSONContent[] | null {
  // 내용이 없는 <summary /> 는 remark 가 문단이 아니라 flow 요소로 읽는다.
  // 잃을 내용 자체가 없으므로 빈 요약으로 받는다 — 그래야 제목을 비워 둔
  // 접기 블록이 저장 후 다시 열려도 편집 가능한 채로 남는다.
  if (node.type === "mdxJsxFlowElement" && node.name === "summary") {
    return node.attributes.length === 0 && node.children.length === 0
      ? []
      : null;
  }

  if (node.type !== "paragraph" || node.children.length !== 1) return null;

  const [element] = node.children;
  if (
    element.type !== "mdxJsxTextElement" ||
    element.name !== "summary" ||
    element.attributes.length > 0
  ) {
    return null;
  }

  const content = to.inline(element.children, [], source);
  return content.every((child) => child.type === "text") ? content : null;
}

// 빈 요약은 content 키를 비워 둔다 — Tiptap 의 getJSON 이 내놓는 모양과 맞춘다.
const detailsSummaryNode = (content: JSONContent[]): JSONContent =>
  content.length === 0
    ? { type: "detailsSummary" }
    : { type: "detailsSummary", content };

/**
 * 이름이 정확히 details 이고, 속성이 open 하나뿐이고, 첫 자식이 인라인만 든
 * <summary> 이고, 본문이 한 블록 이상일 때만 편집 가능한 노드로 승격한다.
 * <Image>·정렬 div 와 같은 이유로 이렇게 좁힌다 — lossless 판정은 attribute 를
 * 보지 않으므로 안전망은 이 조건들뿐이다. 하나라도 어긋나면 null 을 돌려
 * 호출자가 원문 그대로(mdxBlock) 두게 한다.
 */
export function convertDetailsToTiptap(
  node: MdxJsxFlowElement,
  source: string,
  to: ToTiptap,
): JSONContent | null {
  if (node.name !== "details") return null;

  const open = readDetailsOpen(node);
  if (open === null) return null;

  const [first, ...rest] = node.children;
  const summary = first ? readDetailsSummary(first, source, to) : null;
  if (summary === null || rest.length === 0) return null;

  return {
    type: "details",
    attrs: { open },
    content: [
      detailsSummaryNode(summary),
      { type: "detailsContent", content: to.blocks(rest, source) },
    ],
  };
}

export function detailsToMdast(
  node: JSONContent,
  to: ToMdast,
): MdxJsxFlowElement {
  const [summary, body] = node.content ?? [];

  return {
    type: "mdxJsxFlowElement",
    name: "details",
    // 열린 상태만 적는다. 닫힘이 <details> 의 렌더 기본이라 false 를 쓰면
    // 원문에 없던 속성이 생긴다.
    attributes:
      node.attrs?.open === true
        ? [{ type: "mdxJsxAttribute", name: "open", value: null }]
        : [],
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "mdxJsxTextElement",
            name: "summary",
            attributes: [],
            children: to.inline(summary?.content ?? []),
          },
        ],
      },
      ...(body?.content ?? []).map(to.block),
    ],
  };
}
