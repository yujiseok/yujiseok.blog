"use client";

import { Select } from "@base-ui/react/select";
import { Toolbar } from "@base-ui/react/toolbar";
import { Tooltip } from "@base-ui/react/tooltip";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ActiveState {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  code: boolean;
  underline: boolean;
  link: boolean;
  heading1: boolean;
  heading2: boolean;
  heading3: boolean;
  paragraph: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

const INACTIVE_STATE: ActiveState = {
  bold: false,
  italic: false,
  strike: false,
  code: false,
  underline: false,
  link: false,
  heading1: false,
  heading2: false,
  heading3: false,
  paragraph: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  codeBlock: false,
  canUndo: false,
  canRedo: false,
};

interface ButtonConfig {
  id: string;
  // app/editor/slash-command.tsx의 SLASH_ITEMS와 같은 이름을 쓴다 — 두 진입점이
  // 서로 다른 이름을 쓰면 같은 동작을 다른 것으로 오해하게 된다.
  label: string;
  // 단축키가 없는 명령(구분선·이미지·링크 등)은 생략한다.
  shortcut?: string;
  content: ReactNode;
  isActive?: (state: ActiveState) => boolean;
  isDisabled?: (state: ActiveState) => boolean;
  run: (editor: Editor) => void;
}

const HISTORY_BUTTONS: ButtonConfig[] = [
  {
    id: "undo",
    label: "실행 취소",
    shortcut: "⌘Z",
    content: <UndoIcon />,
    isDisabled: (state) => !state.canUndo,
    run: (editor) => editor.chain().focus().undo().run(),
  },
  {
    id: "redo",
    label: "다시 실행",
    shortcut: "⇧⌘Z",
    content: <RedoIcon />,
    isDisabled: (state) => !state.canRedo,
    run: (editor) => editor.chain().focus().redo().run(),
  },
];

const MARK_BUTTONS: ButtonConfig[] = [
  {
    id: "bold",
    label: "굵게",
    shortcut: "⌘B",
    content: <span className="font-bold">B</span>,
    isActive: (state) => state.bold,
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    id: "italic",
    label: "기울임",
    shortcut: "⌘I",
    content: <span className="italic">I</span>,
    isActive: (state) => state.italic,
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: "strike",
    label: "취소선",
    shortcut: "⇧⌘S",
    content: <span className="line-through">S</span>,
    isActive: (state) => state.strike,
    run: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    id: "underline",
    label: "밑줄",
    shortcut: "⌘U",
    content: <span className="underline">U</span>,
    isActive: (state) => state.underline,
    run: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    id: "code",
    label: "인라인 코드",
    shortcut: "⌘E",
    content: <span className="font-mono">{"</>"}</span>,
    isActive: (state) => state.code,
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
];

const LIST_BUTTONS: ButtonConfig[] = [
  {
    id: "bulletList",
    label: "불릿 목록",
    content: "•",
    isActive: (state) => state.bulletList,
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "orderedList",
    label: "번호 목록",
    content: "1.",
    isActive: (state) => state.orderedList,
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
];

const handleLink = (editor: Editor) => {
  const previousUrl = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("링크 URL을 입력하세요", previousUrl ?? "");
  if (url === null) return; // 취소
  if (url.trim() === "") {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().setLink({ href: url.trim() }).run();
};

const handleImage = (editor: Editor) => {
  const url = window.prompt("이미지 URL을 입력하세요");
  if (!url) return;
  editor.chain().focus().setImage({ src: url }).run();
};

const INSERT_BUTTONS: ButtonConfig[] = [
  {
    id: "horizontalRule",
    label: "구분선",
    content: "—",
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: "image",
    label: "이미지",
    content: <ImageIcon />,
    run: handleImage,
  },
  {
    id: "link",
    label: "링크",
    content: <LinkIcon />,
    isActive: (state) => state.link,
    run: handleLink,
  },
];

type BlockValue =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "blockquote"
  | "codeBlock";

interface BlockOption {
  value: BlockValue;
  label: string;
  isActive: (state: ActiveState) => boolean;
  run: (editor: Editor) => void;
}

// 여기 없는 노드는 드롭다운에 넣지 않는다 — editor-client.tsx의 extensions
// 배열에 등록된 것만 저장 시 docToMarkdown이 왕복시킬 수 있다.
const BLOCK_OPTIONS: BlockOption[] = [
  {
    value: "paragraph",
    label: "본문",
    isActive: (state) => state.paragraph,
    run: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    value: "heading1",
    label: "제목 1",
    isActive: (state) => state.heading1,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    value: "heading2",
    label: "제목 2",
    isActive: (state) => state.heading2,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    value: "heading3",
    label: "제목 3",
    isActive: (state) => state.heading3,
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    value: "blockquote",
    label: "인용",
    isActive: (state) => state.blockquote,
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    value: "codeBlock",
    label: "코드 블록",
    isActive: (state) => state.codeBlock,
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
];

// 그룹을 데이터로 표현해 구분선이 그룹 사이에 자동으로 나오게 한다. 버튼을
// 하나씩 나열하는 대신 이 배열 + BLOCK_OPTIONS만 고치면 툴바가 바뀐다.
type ToolbarSection =
  | { id: string; label: string; kind: "buttons"; buttons: ButtonConfig[] }
  | { id: string; label: string; kind: "block-select" };

const SECTIONS: ToolbarSection[] = [
  {
    id: "history",
    label: "실행 기록",
    kind: "buttons",
    buttons: HISTORY_BUTTONS,
  },
  { id: "marks", label: "텍스트 서식", kind: "buttons", buttons: MARK_BUTTONS },
  { id: "block", label: "블록 종류", kind: "block-select" },
  { id: "lists", label: "목록", kind: "buttons", buttons: LIST_BUTTONS },
  { id: "insert", label: "삽입", kind: "buttons", buttons: INSERT_BUTTONS },
];

export function EditorToolbar({ editor }: EditorToolbarProps) {
  // 트랜잭션마다 필요한 불리언만 구독한다 — editor 자체를 상태로 들고 있으면
  // 타이핑 한 글자마다 이 컴포넌트가 리렌더된다.
  const active = useEditorState({
    editor,
    selector: ({ editor }): ActiveState =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            strike: editor.isActive("strike"),
            code: editor.isActive("code"),
            underline: editor.isActive("underline"),
            link: editor.isActive("link"),
            heading1: editor.isActive("heading", { level: 1 }),
            heading2: editor.isActive("heading", { level: 2 }),
            heading3: editor.isActive("heading", { level: 3 }),
            paragraph: editor.isActive("paragraph"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            blockquote: editor.isActive("blockquote"),
            codeBlock: editor.isActive("codeBlock"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : INACTIVE_STATE,
  });

  const state = active ?? INACTIVE_STATE;

  return (
    <Tooltip.Provider delay={400}>
      <Toolbar.Root
        aria-label="서식 도구모음"
        className="sticky top-0 z-10 flex items-center gap-1 overflow-x-auto rounded-t-lg border-b border-neutral-200 bg-white px-2 py-1.5 dark:border-neutral-800 dark:bg-black"
      >
        {SECTIONS.map((section, index) => (
          <Fragment key={section.id}>
            {index > 0 && (
              <Toolbar.Separator className="mx-1 h-5 w-px shrink-0 bg-neutral-200 dark:bg-neutral-800" />
            )}
            {section.kind === "buttons" ? (
              <Toolbar.Group
                aria-label={section.label}
                className="flex shrink-0 items-center gap-0.5"
              >
                {section.buttons.map((button) => (
                  <ToolbarButtonItem
                    key={button.id}
                    button={button}
                    editor={editor}
                    state={state}
                  />
                ))}
              </Toolbar.Group>
            ) : (
              <BlockTypeSelect editor={editor} state={state} />
            )}
          </Fragment>
        ))}
      </Toolbar.Root>
    </Tooltip.Provider>
  );
}

const buttonBaseClass =
  "flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1.5 text-xs text-neutral-700 transition-colors disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-300";
const buttonActiveClass = "bg-black text-white dark:bg-white dark:text-black";
const buttonInactiveClass = "hover:bg-black/5 dark:hover:bg-neutral-200/10";

const tooltipPopupClass =
  "flex items-center gap-1.5 rounded-md bg-neutral-900 px-2 py-1 text-[11px] leading-none font-medium text-white shadow-md dark:bg-neutral-100 dark:text-black";
const kbdClass =
  "rounded border border-white/25 px-1 py-0.5 font-mono text-[10px] leading-none dark:border-black/20";

interface ToolbarButtonItemProps {
  button: ButtonConfig;
  editor: Editor | null;
  state: ActiveState;
}

function ToolbarButtonItem({ button, editor, state }: ToolbarButtonItemProps) {
  const isActive = button.isActive?.(state) ?? false;
  const disabled = !editor || (button.isDisabled?.(state) ?? false);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Toolbar.Button
            aria-label={button.label}
            aria-pressed={isActive}
            disabled={disabled}
            // 클릭이 mousedown 시점에 에디터의 selection focus를 뺏어가는 걸
            // 막는다 — preventDefault 없이는 버튼을 누르는 순간 에디터가
            // blur되어 다음 커맨드가 잘못된(또는 사라진) selection에 적용된다.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor && button.run(editor)}
            className={cn(
              buttonBaseClass,
              isActive ? buttonActiveClass : buttonInactiveClass,
            )}
          />
        }
      >
        {button.content}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup className={tooltipPopupClass}>
            {button.label}
            {button.shortcut && (
              <kbd className={kbdClass}>{button.shortcut}</kbd>
            )}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface BlockTypeSelectProps {
  editor: Editor | null;
  state: ActiveState;
}

function BlockTypeSelect({ editor, state }: BlockTypeSelectProps) {
  const current =
    BLOCK_OPTIONS.find((option) => option.isActive(state))?.value ??
    "paragraph";

  const handleValueChange = (value: BlockValue | null) => {
    // 이미 선택된 값을 다시 고르면 아무 것도 하지 않는다 — 여기 쓰이는 명령은
    // toggleHeading 같은 토글이라, 같은 값을 다시 실행하면 본문으로 꺼져버린다.
    if (!editor || value === null || value === current) return;
    BLOCK_OPTIONS.find((option) => option.value === value)?.run(editor);
  };

  return (
    <Select.Root
      value={current}
      onValueChange={handleValueChange}
      disabled={!editor}
    >
      <Toolbar.Button
        render={<Select.Trigger />}
        aria-label="블록 종류"
        disabled={!editor}
        className={cn(
          buttonBaseClass,
          buttonInactiveClass,
          "w-24 min-w-24 justify-between gap-1 px-2",
        )}
      >
        <Select.Value className="truncate">
          {() =>
            BLOCK_OPTIONS.find((option) => option.value === current)?.label ??
            "본문"
          }
        </Select.Value>
        <Select.Icon className="text-neutral-400 dark:text-neutral-600">
          <CaretDownIcon />
        </Select.Icon>
      </Toolbar.Button>
      <Select.Portal>
        <Select.Positioner sideOffset={4} className="z-20 outline-none">
          <Select.Popup className="min-w-[var(--anchor-width)] overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <Select.List>
              {BLOCK_OPTIONS.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-700 outline-none select-none data-highlighted:bg-black/5 dark:text-neutral-300 dark:data-highlighted:bg-neutral-200/10"
                >
                  <Select.ItemIndicator className="flex w-3.5 shrink-0 items-center text-neutral-900 dark:text-white">
                    <CheckIcon />
                  </Select.ItemIndicator>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function UndoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 7h3a5 5 0 0 1 0 10h-3" />
      <path d="M9 17H6a5 5 0 0 1 0-10h3" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function CaretDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
