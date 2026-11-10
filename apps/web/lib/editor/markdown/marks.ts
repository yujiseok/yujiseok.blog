// ----------------------------------------------------------------------------
// 마크 <-> mdast 노드
// 파싱은 MARK_OF_NODE 를, 직렬화는 그 역표 NODE_OF_MARK 를 쓴다. underline(<u>)
// 과 link 는 모양이 달라 각자 따로 다룬다.
// 직렬화 시 바깥쪽부터: link > underline > bold > italic > strike > code(leaf)
// ----------------------------------------------------------------------------

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export const MARK_OF_NODE = {
  strong: "bold",
  emphasis: "italic",
  delete: "strike",
} as const;

type MarkOfNode = typeof MARK_OF_NODE;
type NodeOfMark = { [N in keyof MarkOfNode as MarkOfNode[N]]: N };

export const NODE_OF_MARK = Object.fromEntries(
  Object.entries(MARK_OF_NODE).map(([node, mark]) => [mark, node]),
) as NodeOfMark;

export const WRAP_ORDER_INNER_TO_OUTER = [
  "strike",
  "italic",
  "bold",
  "underline",
  "link",
] as const;
