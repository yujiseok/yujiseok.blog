import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";

import { cn } from "@/lib/cn";
import { BlockDeleteButton } from "./block-delete";

/*
 * lib/editor/markdown는 에디터가 모르는 JSX 블록(<Callout>, <ShowCase> 등)을
 * "mdxBlock" 노드에 원문 그대로 담아 왕복시킨다. 에디터가 이 타입을 모르면 그런
 * 글을 열자마자 내용이 깨지거나(setContent가 노드를 버림) 저장 시
 * docToMarkdown이 "지원하지 않는 노드 타입"으로 던진다.
 *
 * 읽기 전용인 건, 편집을 열어 봐야 원문 JSX를 글자로 보여 주는 것 이상을 할 수
 * 없기 때문이다. 에디터에서 값어치가 있으려면 <details> 접기처럼 실제 컴포넌트로
 * 그려져야 하고 그건 컴포넌트마다 전용 노드를 만드는 일이다. 그때까지 이 블록은
 * 원문을 잃지 않는 역할만 맡는다 — 지우거나 순서를 옮기는 것까지는 된다.
 */
const MdxBlockView = ({ node, deleteNode }: ReactNodeViewProps) => (
  <NodeViewWrapper className="group relative my-4">
    <BlockDeleteButton onDelete={deleteNode} label="MDX 블록 삭제" />
    <pre
      contentEditable={false}
      className={cn(
        "m-0 cursor-default overflow-x-auto rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2",
        "font-mono text-xs whitespace-pre-wrap text-neutral-500 select-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400",
      )}
    >
      {String(node.attrs.value ?? "")}
    </pre>
  </NodeViewWrapper>
);

export const MdxBlock = Node.create({
  name: "mdxBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      value: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-value"),
        renderHTML: (attributes) => ({ "data-value": attributes.value }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mdx-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "mdx-block" }),
      String(HTMLAttributes["data-value"] ?? ""),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MdxBlockView);
  },
});
