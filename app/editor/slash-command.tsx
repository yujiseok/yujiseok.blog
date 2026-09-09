import { Extension, type Editor, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionOptions,
  type SuggestionProps,
} from "@tiptap/suggestion";
import { useEffect, useImperativeHandle, useState, type Ref } from "react";

import { cn } from "@/lib/cn";
import { MENU_ITEM, POPUP } from "./ui";

import { insertImageByUpload } from "./image-upload";

export interface SlashCommandItem {
  title: string;
  keywords: string[];
  run: (editor: Editor, range: Range) => void;
}

// 여기 없는 노드는 슬래시 메뉴로 만들 수 없다 — 지원하지 않는 서식이
// 에디터에 들어갈 길을 아예 막는다.
const SLASH_ITEMS: SlashCommandItem[] = [
  {
    title: "제목 1",
    keywords: ["heading1", "h1", "제목"],
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run(),
  },
  {
    title: "제목 2",
    keywords: ["heading2", "h2", "제목"],
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run(),
  },
  {
    title: "제목 3",
    keywords: ["heading3", "h3", "제목"],
    run: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run(),
  },
  {
    title: "본문",
    keywords: ["paragraph", "text", "본문"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("paragraph").run(),
  },
  {
    title: "불릿 목록",
    keywords: ["bullet", "list", "목록"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "번호 목록",
    keywords: ["ordered", "number", "번호"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "인용",
    keywords: ["quote", "blockquote", "인용"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "코드 블록",
    keywords: ["code", "codeblock", "코드"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "구분선",
    keywords: ["divider", "hr", "구분선"],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "이미지",
    keywords: ["image", "img", "이미지"],
    run: (editor, range) => {
      // 파일 선택창을 열기 전에 "/이미지" 텍스트부터 지운다. 업로드가 끝날
      // 때까지 남겨두면 명령이 씹힌 것처럼 보이고, 그 사이 커서가 움직이면
      // range가 엉뚱한 곳을 가리킨다.
      editor.chain().focus().deleteRange(range).run();
      void insertImageByUpload(editor);
    },
  },
];

function filterItems(query: string): SlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((keyword) => keyword.toLowerCase().includes(q)),
  );
}

interface SlashMenuHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

interface SlashMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  ref?: Ref<SlashMenuHandle>;
}

function SlashMenu({ items, command, ref }: SlashMenuProps) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (items.length === 0) return false;

      if (event.key === "ArrowDown") {
        setSelected((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelected((prev) => (prev - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selected];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className={cn(POPUP, "w-56 p-2 text-sm text-neutral-500")}>
        일치하는 블록이 없습니다
      </div>
    );
  }

  return (
    <div className={cn(POPUP, "w-56 overflow-hidden p-1")}>
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          onClick={() => command(item)}
          className={cn(
            MENU_ITEM,
            "w-full",
            // 슬래시 메뉴는 포인터가 아니라 키보드로 고르는 자리라
            // data-highlighted 대신 선택 인덱스로 직접 표시한다.
            index === selected && "bg-black/5 dark:bg-neutral-200/10",
          )}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}

type SlashCommandOptions = {
  suggestion: Omit<
    SuggestionOptions<SlashCommandItem, SlashCommandItem>,
    "editor"
  >;
};

// "/" 입력 시 뜨는 노션 스타일 블록 메뉴. 목록·포지셔닝은 @tiptap/suggestion의
// mount()가 floating-ui로 알아서 처리해 별도 포지셔닝 라이브러리가 필요 없다.
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        items: ({ query }) => filterItems(query),
        command: ({ editor, range, props }) => {
          props.run(editor, range);
        },
        render: () => {
          let component: ReactRenderer<SlashMenuHandle, SlashMenuProps> | null =
            null;
          let unmount: (() => void) | null = null;

          return {
            onStart: (props: SuggestionProps<SlashCommandItem>) => {
              component = new ReactRenderer(SlashMenu, {
                editor: props.editor,
                props: {
                  items: props.items,
                  command: (item: SlashCommandItem) => props.command(item),
                },
              });
              unmount = props.mount(component.element);
            },
            onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashCommandItem) => props.command(item),
              });
            },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") {
                unmount?.();
                component?.destroy();
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              unmount?.();
              component?.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
