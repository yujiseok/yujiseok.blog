"use client";

import { Popover } from "@base-ui/react/popover";
import { Select } from "@base-ui/react/select";
import { Toolbar } from "@base-ui/react/toolbar";
import { Tooltip } from "@base-ui/react/tooltip";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  Fragment,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

import { insertImageByUpload, setUploadSlug } from "./image-upload";

interface EditorToolbarProps {
  editor: Editor | null;
  /** 업로드한 이미지가 들어갈 public/images/<slug>/ 를 정한다. 없으면 업로드를 거절한다 */
  slug?: string;
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
  // 업로드처럼 시간이 걸리는 명령은 Promise를 돌려준다. 그동안 버튼이 잠기고
  // 스피너가 돈다 — 진행 상태를 명령마다 따로 들고 있을 필요가 없다.
  // 반환 타입이 unknown인 건 대부분의 명령이 chain().run()의 boolean을 그대로
  // 흘려보내기 때문이다. Promise가 아닌 값은 전부 무시한다.
  run: (editor: Editor) => unknown;
}

// 대부분의 항목은 누르는 즉시 run이 도는 버튼이지만, 링크는 URL을 받아야 해서
// 팝오버가 필요하다. 섹션이 kind로 갈리듯 항목도 kind로 갈라 특별 취급을
// 렌더러 한 곳에 가둔다 — 나머지 버튼은 여전히 설정 배열 그대로 렌더된다.
// 링크 항목이 라벨·아이콘을 들고 있지 않은 건 BlockTypeSelect가 BLOCK_OPTIONS를
// 들고 있는 것과 같은 이유다: 팝오버가 자기 UI를 온전히 소유한다.
type ToolbarButton =
  ({ kind: "command" } & ButtonConfig) | { kind: "link"; id: string };

const HISTORY_BUTTONS: ToolbarButton[] = [
  {
    kind: "command",
    id: "undo",
    label: "실행 취소",
    shortcut: "⌘Z",
    content: <UndoIcon />,
    isDisabled: (state) => !state.canUndo,
    run: (editor) => editor.chain().focus().undo().run(),
  },
  {
    kind: "command",
    id: "redo",
    label: "다시 실행",
    shortcut: "⇧⌘Z",
    content: <RedoIcon />,
    isDisabled: (state) => !state.canRedo,
    run: (editor) => editor.chain().focus().redo().run(),
  },
];

const MARK_BUTTONS: ToolbarButton[] = [
  {
    kind: "command",
    id: "bold",
    label: "굵게",
    shortcut: "⌘B",
    content: <span className="font-bold">B</span>,
    isActive: (state) => state.bold,
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    kind: "command",
    id: "italic",
    label: "기울임",
    shortcut: "⌘I",
    content: <span className="italic">I</span>,
    isActive: (state) => state.italic,
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    kind: "command",
    id: "strike",
    label: "취소선",
    shortcut: "⇧⌘S",
    content: <span className="line-through">S</span>,
    isActive: (state) => state.strike,
    run: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    kind: "command",
    id: "underline",
    label: "밑줄",
    shortcut: "⌘U",
    content: <span className="underline">U</span>,
    isActive: (state) => state.underline,
    run: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    kind: "command",
    id: "code",
    label: "인라인 코드",
    shortcut: "⌘E",
    content: <span className="font-mono">{"</>"}</span>,
    isActive: (state) => state.code,
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
];

const LIST_BUTTONS: ToolbarButton[] = [
  {
    kind: "command",
    id: "bulletList",
    label: "불릿 목록",
    content: "•",
    isActive: (state) => state.bulletList,
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    kind: "command",
    id: "orderedList",
    label: "번호 목록",
    content: "1.",
    isActive: (state) => state.orderedList,
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
];

const INSERT_BUTTONS: ToolbarButton[] = [
  {
    kind: "command",
    id: "horizontalRule",
    label: "구분선",
    content: "—",
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    kind: "command",
    id: "image",
    label: "이미지",
    content: <ImageIcon />,
    run: insertImageByUpload,
  },
  { kind: "link", id: "link" },
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
  | { id: string; label: string; kind: "buttons"; buttons: ToolbarButton[] }
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

export function EditorToolbar({ editor, slug }: EditorToolbarProps) {
  // 슬래시 커맨드의 이미지 항목은 ProseMirror 플러그인 안에서 실행돼 이 prop이
  // 닿지 않는다. 업로드 모듈이 들고 있는 값과 동기화해 두 진입점이 같은 slug를
  // 쓰게 한다 — React 밖의 외부 시스템이라 effect가 맞는 자리다.
  useEffect(() => {
    setUploadSlug(slug ?? null);
    return () => setUploadSlug(null);
  }, [slug]);

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
                {section.buttons.map((button) =>
                  button.kind === "command" ? (
                    <ToolbarButtonItem
                      key={button.id}
                      button={button}
                      editor={editor}
                      state={state}
                    />
                  ) : (
                    <LinkPopover
                      key={button.id}
                      editor={editor}
                      state={state}
                    />
                  ),
                )}
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
  const [isRunning, setIsRunning] = useState(false);

  const isActive = button.isActive?.(state) ?? false;
  const disabled =
    !editor || isRunning || (button.isDisabled?.(state) ?? false);

  // 동기 명령이면 run이 아무 것도 돌려주지 않아 상태가 한 번도 바뀌지 않는다.
  // 업로드처럼 Promise를 돌려주는 명령만 끝날 때까지 버튼을 잠근다 — 파일
  // 선택창이 열려 있는 동안 같은 버튼이 두 번 눌리는 걸 막는다.
  const handleClick = async () => {
    if (!editor) return;
    const running = button.run(editor);
    if (!(running instanceof Promise)) return;

    setIsRunning(true);
    try {
      await running;
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Toolbar.Button
            aria-label={button.label}
            aria-pressed={isActive}
            aria-busy={isRunning}
            disabled={disabled}
            // 클릭이 mousedown 시점에 에디터의 selection focus를 뺏어가는 걸
            // 막는다 — preventDefault 없이는 버튼을 누르는 순간 에디터가
            // blur되어 다음 커맨드가 잘못된(또는 사라진) selection에 적용된다.
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClick}
            className={cn(
              buttonBaseClass,
              isActive ? buttonActiveClass : buttonInactiveClass,
            )}
          />
        }
      >
        {isRunning ? <SpinnerIcon /> : button.content}
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

// 팝오버를 여는 순간의 selection과 그때의 href. 입력창으로 포커스가 넘어가면
// 에디터가 blur되고, 그 사이 selection이 흔들리면 엉뚱한 곳에 링크가 붙는다.
// 적용 시점에 이 범위를 되돌린 뒤 명령을 건다.
interface LinkDraft {
  from: number;
  to: number;
  href: string;
}

interface LinkPopoverProps {
  editor: Editor | null;
  state: ActiveState;
}

// window.prompt를 대신한다. 세 갈래 동작은 그대로다 — 그냥 닫으면 아무 일도
// 없고(취소), 빈 값으로 적용하면 unsetLink, 값이 있으면 setLink다.
function LinkPopover({ editor, state }: LinkPopoverProps) {
  // 열림 여부와 "어디에 적용할지"를 한 상태로 묶는다 — selection을 모르는 채
  // 열려 있는 상태를 만들 수 없다. 닫히면 팝업이 언마운트돼 다음에 열 때
  // 입력값이 defaultValue로 새로 채워진다.
  const [draft, setDraft] = useState<LinkDraft | null>(null);
  const isOpen = draft !== null;

  const handleOpenChange = (open: boolean) => {
    if (!editor) return;
    if (!open) {
      setDraft(null);
      // Esc·바깥 클릭으로 닫아도 커서를 에디터로 돌려준다. 안 그러면 포커스가
      // body로 떨어져 방금까지 쓰던 자리를 잃는다.
      editor.chain().focus().run();
      return;
    }
    const { from, to } = editor.state.selection;
    // getAttributes는 Record<string, any>라 값을 그대로 믿지 않는다.
    const href: unknown = editor.getAttributes("link").href;
    setDraft({ from, to, href: typeof href === "string" ? href : "" });
  };

  const applyLink = (rawHref: string) => {
    if (!editor || !draft) return;
    const href = rawHref.trim();
    const chain = editor
      .chain()
      .focus()
      .setTextSelection({ from: draft.from, to: draft.to });
    (href === "" ? chain.unsetLink() : chain.setLink({ href })).run();
    setDraft(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // form이라 Enter가 곧 적용이다. 별도 키 핸들러를 달 이유가 없다.
    const url = new FormData(event.currentTarget).get("url");
    applyLink(typeof url === "string" ? url : "");
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      {/* 팝오버가 열려 있는 동안엔 툴팁을 끈다 — 같은 버튼에 말풍선과 입력창이
          겹쳐 뜨면 입력창을 가린다. */}
      <Tooltip.Root disabled={isOpen}>
        <Tooltip.Trigger
          render={
            <Popover.Trigger
              render={
                <Toolbar.Button
                  aria-label="링크"
                  aria-pressed={state.link}
                  disabled={!editor}
                  // 다른 버튼과 같은 이유로 mousedown을 막는다 — 여기서
                  // 에디터가 blur되면 팝오버를 열기도 전에 selection을 잃는다.
                  onMouseDown={(event) => event.preventDefault()}
                  className={cn(
                    buttonBaseClass,
                    state.link ? buttonActiveClass : buttonInactiveClass,
                  )}
                />
              }
            />
          }
        >
          <LinkIcon />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className={tooltipPopupClass}>링크</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Popover.Portal>
        <Popover.Positioner
          align="start"
          sideOffset={8}
          className="z-20 outline-none"
        >
          {/* 닫힐 때 Base UI가 트리거로 포커스를 되돌리면 위에서 건 에디터
              포커스를 도로 뺏는다. 포커스 복귀는 이 컴포넌트가 직접 맡는다. */}
          <Popover.Popup
            finalFocus={false}
            className="rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              <input
                // type="url"로 두면 /posts/foo 같은 내부 경로가 네이티브 검증에
                // 걸린다. 본문 링크는 상대 경로도 쓰므로 형식을 강제하지 않는다.
                type="text"
                name="url"
                inputMode="url"
                autoComplete="off"
                aria-label="링크 URL"
                placeholder="https://example.com"
                defaultValue={draft?.href ?? ""}
                className="w-56 rounded-md border border-neutral-200 bg-transparent px-2 py-1 text-sm focus:outline-none dark:border-neutral-800"
              />
              <button
                type="submit"
                className={cn(buttonBaseClass, buttonInactiveClass, "px-2")}
              >
                적용
              </button>
              {/* 걸린 링크가 없을 때 띄우면 아무 일도 하지 않는 버튼이 된다 */}
              {draft !== null && draft.href !== "" && (
                <button
                  type="button"
                  onClick={() => applyLink("")}
                  className={cn(buttonBaseClass, buttonInactiveClass, "px-2")}
                >
                  해제
                </button>
              )}
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
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

// 회전은 CSS에 맡긴다 — 진행 표시 하나 때문에 애니메이션 루프를 돌릴 이유가 없다
function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
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
