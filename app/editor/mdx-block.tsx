import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/cn";

/*
 * lib/editor/markdown.ts는 에디터가 모르는 JSX 블록(<Callout>, <ShowCase> 등)을
 * "mdxBlock" 노드에 원문 그대로 담아 왕복시킨다. 에디터가 이 타입을 모르면 그런
 * 글을 열자마자 내용이 깨지거나(setContent가 노드를 버림) 저장 시
 * docToMarkdown이 "지원하지 않는 노드 타입"으로 던진다.
 *
 * 원문을 그대로 담는다는 성질 덕에 편집도 같은 방식으로 열어 줄 수 있다 —
 * 텍스트를 고치면 그게 그대로 파일에 쓰인다. 에디터가 JSX를 해석하지 않으므로
 * 잘못 쓰면 빌드가 깨지는데, 그건 IDE에서 직접 쓸 때와 같은 위험이다.
 */
const MdxBlockView = ({
  node,
  updateAttributes,
  selected,
}: ReactNodeViewProps) => {
  const value = String(node.attrs.value ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  // 스크롤바 대신 내용만큼 늘어난다. 원문 전체가 한눈에 보여야 고칠 수 있다.
  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    // box-sizing이 border-box라 scrollHeight(패딩 상자)만 넣으면 테두리 두께가
    // 모자라 한 줄이 스크롤 뒤로 숨는다.
    const borders = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.height = `${textarea.scrollHeight + borders}px`;
  }, [value]);

  return (
    <NodeViewWrapper className="my-4">
      {/* 노드뷰 루트는 draggable이라, 안에서 텍스트를 끌면 블록이 통째로 끌려
          간다. 이 영역은 드래그 대상이 아니다(image-node.tsx의 alt 입력칸과
          같은 이유). */}
      <div contentEditable={false} draggable={false}>
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => updateAttributes({ value: event.target.value })}
          // 여기서 막지 않으면 ProseMirror가 Enter·Backspace를 블록 조작으로
          // 가로채 원문을 고칠 수 없다.
          onKeyDown={(event) => event.stopPropagation()}
          spellCheck={false}
          autoComplete="off"
          aria-label="MDX 원문"
          placeholder="<Callout>내용</Callout>"
          rows={1}
          className={cn(
            "block w-full resize-none overflow-hidden rounded-lg border border-dashed bg-neutral-50 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-neutral-600 focus:outline-none dark:bg-neutral-900 dark:text-neutral-300",
            selected
              ? "border-neutral-500 dark:border-neutral-400"
              : "border-neutral-300 dark:border-neutral-700",
          )}
        />
      </div>
    </NodeViewWrapper>
  );
};

export const MdxBlock = Node.create({
  name: "mdxBlock",
  group: "block",
  // 내용은 ProseMirror 문서가 아니라 attrs에 있다. 편집은 노드뷰의 textarea가
  // 맡고, 문서 입장에서는 통짜 블록 하나다.
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
