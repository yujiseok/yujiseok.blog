import type { JSONContent } from "@tiptap/core";
import type {
  BlockContent,
  DefinitionContent,
  Heading,
  ListItem,
  PhrasingContent,
  Root as MdastRoot,
} from "mdast";
import { toAlign, type Align } from "../align-value";
import { asBoolean, asNumber, asString } from "./attrs";
import { NODE_OF_MARK, WRAP_ORDER_INNER_TO_OUTER } from "./marks";
import { alignDivToMdast } from "./nodes/align-div";
import { detailsToMdast } from "./nodes/details";
import { imageToMdast, inlineImageToMdast } from "./nodes/image";
import { tableToMdast } from "./nodes/table";
import { stringifier } from "./processor";

// ----------------------------------------------------------------------------
// Tiptap JSON -> markdown
// ----------------------------------------------------------------------------

export type MdastBlock = BlockContent | DefinitionContent;

type TiptapMark = NonNullable<JSONContent["marks"]>[number];

export function docToMarkdown(doc: JSONContent): string {
  const tree: MdastRoot = {
    type: "root",
    children: (doc.content ?? []).map(convertTopLevelBlockToMdast),
  };
  return String(stringifier().stringify(tree));
}

/**
 * 정렬 div 는 최상위에서만 씌운다. 목록·인용 안에서 감싸면 `- <div ...>` 가
 * 되어 마크다운이 깨지므로, 재귀 경로인 convertBlockToMdast 는 align 을 아예
 * 보지 않는다.
 */
function convertTopLevelBlockToMdast(node: JSONContent): MdastBlock {
  const align = wrappingAlignOf(node);
  const mdast = convertBlockToMdast(node);

  return align === null ? mdast : alignDivToMdast(align, mdast);
}

// 왼쪽(과 null)은 문단의 렌더 기본이라 감쌀 이유가 없다. 이미지의 align 은
// image 노드가 <Image align="..."> 로 따로 쓴다.
const wrappingAlignOf = (node: JSONContent): Exclude<Align, "left"> | null => {
  if (node.type !== "paragraph" && node.type !== "heading") return null;

  const align = toAlign(node.attrs?.align);
  return align === "left" ? null : align;
};

const convertBlocksToMdast = (nodes: JSONContent[] | undefined): MdastBlock[] =>
  (nodes ?? []).map(convertBlockToMdast);

export function convertBlockToMdast(node: JSONContent): MdastBlock {
  switch (node.type) {
    case "paragraph":
      return {
        type: "paragraph",
        children: convertInlineToMdast(node.content ?? []),
      };
    case "heading":
      return {
        type: "heading",
        depth: (node.attrs?.level as Heading["depth"] | undefined) ?? 1,
        children: convertInlineToMdast(node.content ?? []),
      };
    case "bulletList":
    case "orderedList": {
      const ordered = node.type === "orderedList";
      return {
        type: "list",
        ordered,
        ...(ordered && { start: asNumber(node.attrs?.start) ?? 1 }),
        spread: asBoolean(node.attrs?.spread) ?? false,
        children: (node.content ?? []).map(convertListItemToMdast),
      };
    }
    case "blockquote":
      return {
        type: "blockquote",
        children: convertBlocksToMdast(node.content),
      };
    case "codeBlock":
      return {
        type: "code",
        lang: asString(node.attrs?.language),
        meta: asString(node.attrs?.meta),
        value: (node.content ?? []).map((t) => t.text ?? "").join(""),
      };
    case "table":
      return tableToMdast(node);
    case "horizontalRule":
      return { type: "thematicBreak" };
    case "image":
      return imageToMdast(node);
    case "details":
      return detailsToMdast(node);
    case "mdxBlock":
      return { type: "mdxRaw", value: asString(node.attrs?.value) ?? "" };
    default:
      throw new Error(`지원하지 않는 노드 타입: ${node.type}`);
  }
}

// 목록 항목은 list 의 자식 자리에만 올 수 있어 블록 변환과 따로 둔다.
const convertListItemToMdast = (node: JSONContent): ListItem => ({
  type: "listItem",
  spread: asBoolean(node.attrs?.spread) ?? false,
  checked: asBoolean(node.attrs?.checked),
  children: convertBlocksToMdast(node.content),
});

// code 는 inlineCode 리프로 내려가므로 감싸기 대상이 아니다
const wrappingMarksOf = (node: JSONContent): TiptapMark[] =>
  node.type === "text"
    ? (node.marks ?? []).filter((m) => m.type !== "code")
    : [];

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
const runToMdast = (run: JSONContent[]): PhrasingContent[] => {
  const wrapping = wrappingMarksOf(run[0]);

  return WRAP_ORDER_INNER_TO_OUTER.filter((markType) =>
    wrapping.some((m) => m.type === markType),
  ).reduce<PhrasingContent[]>(
    (inner, markType) => [
      wrapWithMark(
        markType,
        inner,
        wrapping.find((m) => m.type === markType),
      ),
    ],
    run.map(inlineNodeToMdast),
  );
};

export const convertInlineToMdast = (
  content: JSONContent[],
): PhrasingContent[] => groupAdjacent(content, markKey).flatMap(runToMdast);

const inlineNodeToMdast = (node: JSONContent): PhrasingContent => {
  if (node.type === "hardBreak") return { type: "break" };
  if (node.type === "image") return inlineImageToMdast(node);
  if (node.type === "mdxInline") {
    return { type: "mdxRaw", value: asString(node.attrs?.value) ?? "" };
  }
  if (node.type !== "text") {
    throw new Error(`지원하지 않는 인라인 노드 타입: ${node.type}`);
  }

  const value = node.text ?? "";

  // 감싸는 마크는 runToMdast 가 덩어리 단위로 처리한다. 여기서는 리프만 본다.
  return (node.marks ?? []).some((m) => m.type === "code")
    ? { type: "inlineCode", value }
    : { type: "text", value };
};

function wrapWithMark(
  markType: (typeof WRAP_ORDER_INNER_TO_OUTER)[number],
  children: PhrasingContent[],
  mark?: TiptapMark,
): PhrasingContent {
  switch (markType) {
    case "underline":
      return {
        type: "mdxJsxTextElement",
        name: "u",
        attributes: [],
        children,
      };
    case "link":
      return {
        type: "link",
        url: asString(mark?.attrs?.href) ?? "",
        title: asString(mark?.attrs?.title),
        children,
      };
    default:
      return { type: NODE_OF_MARK[markType], children };
  }
}
