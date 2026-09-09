import { mergeAttributes, Node } from "@tiptap/core";

/*
 * lib/editor/markdown.ts는 알려지지 않은 JSX 블록(예: 기존 글의 <Image>,
 * <Callout>)을 "mdxBlock" 노드에 원문 그대로 담아 왕복시킨다. 에디터가 이
 * 타입을 모르면 그런 글을 열자마자 내용이 깨지거나(setContent가 노드를
 * 버림) 저장 시 docToMarkdown이 "지원하지 않는 노드 타입"으로 던진다.
 * 편집은 못 해도 최소한 원문이 사라지지 않아야 하므로 읽기 전용으로
 * 보존만 한다.
 */
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
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-type", "mdx-block");
      dom.setAttribute("contenteditable", "false");
      dom.className =
        "cursor-default rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-neutral-500 select-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400";
      dom.textContent = String(node.attrs.value ?? "");
      return { dom };
    };
  },
});
