"use client";

import { Popover } from "@base-ui/react/popover";
import { Toolbar } from "@base-ui/react/toolbar";
import { Tooltip } from "@base-ui/react/tooltip";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  Fragment,
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";
import { ALIGN_OPTIONS, applyAlign, readAlign } from "@/lib/editor/align";
import type { Align } from "@/lib/editor/align-value";
import { INSERT_BLOCKS } from "./blocks";
import { StrokeIcon } from "./icons";
import { EditorSelect, type SelectOption } from "./select";
import {
  FIELD,
  ICON_BUTTON,
  KBD,
  POPUP,
  POSITIONER,
  PRESSED,
  TOOLTIP,
  UNPRESSED,
} from "./ui";

import { setUploadSlug } from "./image-upload";

interface EditorToolbarProps {
  editor: Editor | null;
  /** 업로드한 이미지가 들어갈 public/images/<slug>/ 를 정한다. 없으면 업로드를 거절한다 */
  slug?: string;
}

// 버튼·옵션 정의의 isActive/isDisabled 를 selector 가 한 번에 돌려 id별로
// 모은다. 상태 키를 따로 선언해 맞출 필요가 없다.
interface ItemState {
  active: boolean;
  disabled: boolean;
}

type ToolbarState = Record<string, ItemState>;

const EMPTY_STATE: ToolbarState = {};
const OFF: ItemState = { active: false, disabled: false };

interface ButtonConfig {
  id: string;
  // 슬래시 메뉴와 같은 이름이어야 한다 — 두 진입점이 서로 다른 이름을 쓰면
  // 같은 동작을 다른 것으로 오해하게 된다. 삽입 항목은 blocks.tsx 한 곳에서
  // 나오므로 이름이 갈릴 수 없고, 나머지는 여기서 맞춘다.
  label: string;
  // 단축키가 없는 명령(구분선·이미지·링크 등)은 생략한다.
  shortcut?: string;
  content: ReactNode;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
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
  | ({ kind: "command" } & ButtonConfig)
  | ({ kind: "link" } & Pick<ButtonConfig, "id" | "isActive">);

const HISTORY_BUTTONS: ToolbarButton[] = [
  {
    kind: "command",
    id: "undo",
    label: "실행 취소",
    shortcut: "⌘Z",
    content: <UndoIcon />,
    isDisabled: (editor) => !editor.can().undo(),
    run: (editor) => editor.chain().focus().undo().run(),
  },
  {
    kind: "command",
    id: "redo",
    label: "다시 실행",
    shortcut: "⇧⌘Z",
    content: <RedoIcon />,
    isDisabled: (editor) => !editor.can().redo(),
    run: (editor) => editor.chain().focus().redo().run(),
  },
];

const MARK_BUTTONS: ToolbarButton[] = [
  { id: "bold", label: "굵게", shortcut: "⌘B", glyph: "B", style: "font-bold" },
  {
    id: "italic",
    label: "기울임",
    shortcut: "⌘I",
    glyph: "I",
    style: "italic",
  },
  {
    id: "strike",
    label: "취소선",
    shortcut: "⇧⌘S",
    glyph: "S",
    style: "line-through",
  },
  {
    id: "underline",
    label: "밑줄",
    shortcut: "⌘U",
    glyph: "U",
    style: "underline",
  },
  {
    id: "code",
    label: "인라인 코드",
    shortcut: "⌘E",
    glyph: "</>",
    style: "font-mono",
  },
].map(({ id, label, shortcut, glyph, style }): ToolbarButton => ({
  kind: "command",
  id,
  label,
  shortcut,
  content: <span className={style}>{glyph}</span>,
  isActive: (editor) => editor.isActive(id),
  run: (editor) => editor.chain().focus().toggleMark(id).run(),
}));

// 이미지든 문단이든 정렬 버튼은 이 세 개뿐이다. 무엇에 적용할지(그리고 지금
// 값이 무엇인지)는 align.ts가 판정하므로 여기선 같은 run을 그대로 나열한다.
const ALIGN_BUTTONS: ToolbarButton[] = ALIGN_OPTIONS.map((option) => ({
  kind: "command",
  id: `align-${option.value}`,
  label: option.label,
  content: <AlignIcon variant={option.value} />,
  isActive: (editor) => {
    // 정렬은 "무엇에 걸리는지"와 "지금 값이 무엇인지"가 한 판정에서 같이
    // 나온다. 둘을 따로 읽으면 이미지/문단 사이에서 어긋난다.
    const { target, align } = readAlign(editor);
    return target !== null && align === option.value;
  },
  // 코드블록·mdxBlock·목록 안처럼 정렬을 저장할 수 없는 자리에서는 잠근다.
  isDisabled: (editor) => readAlign(editor).target === null,
  run: (editor) => applyAlign(editor, option.value),
}));

// 삽입 항목은 슬래시 메뉴와 같은 목록에서 나온다. 링크만 여기 따로 붙는데,
// URL을 받아야 해서 명령 하나로 끝나지 않기 때문이다.
const INSERT_BUTTONS: ToolbarButton[] = [
  ...INSERT_BLOCKS.map((block): ToolbarButton => ({
    kind: "command",
    id: block.id,
    label: block.label,
    content: block.icon,
    run: block.run,
  })),
  { kind: "link", id: "link", isActive: (editor) => editor.isActive("link") },
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
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

// 여기 없는 노드는 드롭다운에 넣지 않는다 — editor-client.tsx의 extensions
// 배열에 등록된 것만 저장 시 docToMarkdown이 왕복시킬 수 있다.
const BLOCK_OPTIONS: BlockOption[] = [
  {
    value: "paragraph",
    label: "본문",
    isActive: (editor) => editor.isActive("paragraph"),
    run: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    value: "heading1",
    label: "제목 1",
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    value: "heading2",
    label: "제목 2",
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    value: "heading3",
    label: "제목 3",
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    value: "blockquote",
    label: "인용",
    isActive: (editor) => editor.isActive("blockquote"),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    value: "codeBlock",
    label: "코드 블록",
    isActive: (editor) => editor.isActive("codeBlock"),
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
];

type ListValue = "none" | "bulletList" | "orderedList";

interface ListOption {
  value: ListValue;
  label: string;
  isActive: (editor: Editor) => boolean;
  /**
   * "목록 없음"에는 켤 명령이 없다 — 끄는 건 지금 걸린 목록의 토글이 맡는다.
   * 해제 전용 명령을 따로 두면 켜는 경로와 끄는 경로가 갈려 어긋난다.
   */
  run?: (editor: Editor) => void;
}

const LIST_OPTIONS: ListOption[] = [
  {
    value: "none",
    label: "목록 없음",
    isActive: (editor) =>
      !editor.isActive("bulletList") && !editor.isActive("orderedList"),
  },
  {
    value: "bulletList",
    label: "글머리 기호",
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    value: "orderedList",
    label: "번호 매기기",
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
];

// 그룹을 데이터로 표현해 구분선이 그룹 사이에 자동으로 나오게 한다. 버튼을
// 하나씩 나열하는 대신 이 배열 + BLOCK_OPTIONS/LIST_OPTIONS만 고치면 툴바가
// 바뀐다.
type ToolbarSection =
  | { id: string; label: string; kind: "buttons"; buttons: ToolbarButton[] }
  | { id: string; label: string; kind: "block-select" }
  | { id: string; label: string; kind: "list-select" };

const SECTIONS: ToolbarSection[] = [
  {
    id: "history",
    label: "실행 기록",
    kind: "buttons",
    buttons: HISTORY_BUTTONS,
  },
  { id: "marks", label: "텍스트 서식", kind: "buttons", buttons: MARK_BUTTONS },
  { id: "block", label: "블록 종류", kind: "block-select" },
  { id: "lists", label: "목록", kind: "list-select" },
  { id: "align", label: "정렬", kind: "buttons", buttons: ALIGN_BUTTONS },
  { id: "insert", label: "삽입", kind: "buttons", buttons: INSERT_BUTTONS },
];

interface StateItem {
  id: string;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

const STATE_ITEMS: StateItem[] = [
  ...[HISTORY_BUTTONS, MARK_BUTTONS, ALIGN_BUTTONS, INSERT_BUTTONS].flat(),
  ...BLOCK_OPTIONS.map((option) => ({ ...option, id: option.value })),
  ...LIST_OPTIONS.map((option) => ({ ...option, id: option.value })),
];

function readState(editor: Editor): ToolbarState {
  return Object.fromEntries(
    STATE_ITEMS.map((item) => [
      item.id,
      {
        active: item.isActive?.(editor) ?? false,
        disabled: item.isDisabled?.(editor) ?? false,
      },
    ]),
  );
}

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
  const state =
    useEditorState({
      editor,
      selector: ({ editor }) => (editor ? readState(editor) : EMPTY_STATE),
    }) ?? EMPTY_STATE;

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
            <SectionContent section={section} editor={editor} state={state} />
          </Fragment>
        ))}
      </Toolbar.Root>
    </Tooltip.Provider>
  );
}

interface SectionContentProps {
  section: ToolbarSection;
  editor: Editor | null;
  state: ToolbarState;
}

function SectionContent({ section, editor, state }: SectionContentProps) {
  switch (section.kind) {
    case "buttons":
      return (
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
              <LinkPopover key={button.id} editor={editor} state={state} />
            ),
          )}
        </Toolbar.Group>
      );
    case "block-select":
      return (
        <StateSelect
          label="블록 종류"
          options={BLOCK_OPTIONS}
          fallback="paragraph"
          editor={editor}
          state={state}
        />
      );
    case "list-select":
      return (
        <StateSelect
          label="목록"
          options={LIST_OPTIONS}
          fallback="none"
          editor={editor}
          state={state}
        />
      );
  }
}

interface ToolbarButtonItemProps {
  button: ButtonConfig;
  editor: Editor | null;
  state: ToolbarState;
}

function ToolbarButtonItem({ button, editor, state }: ToolbarButtonItemProps) {
  const [isRunning, setIsRunning] = useState(false);

  const { active: isActive, disabled: isDisabled } = state[button.id] ?? OFF;
  const disabled = !editor || isRunning || isDisabled;

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
    <ToolbarTooltip
      label={button.label}
      shortcut={button.shortcut}
      trigger={
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
          className={cn(ICON_BUTTON, isActive ? PRESSED : UNPRESSED)}
        />
      }
    >
      {isRunning ? <SpinnerIcon /> : button.content}
    </ToolbarTooltip>
  );
}

interface ToolbarTooltipProps {
  label: string;
  shortcut?: string;
  /** 팝오버가 열려 있는 동안처럼 말풍선을 띄우면 안 될 때 */
  disabled?: boolean;
  trigger: ReactElement;
  children: ReactNode;
}

function ToolbarTooltip({
  label,
  shortcut,
  disabled,
  trigger,
  children,
}: ToolbarTooltipProps) {
  return (
    <Tooltip.Root disabled={disabled}>
      <Tooltip.Trigger render={trigger}>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup className={TOOLTIP}>
            {label}
            {shortcut && <kbd className={KBD}>{shortcut}</kbd>}
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
  state: ToolbarState;
}

// window.prompt를 대신한다. 세 갈래 동작은 그대로다 — 그냥 닫으면 아무 일도
// 없고(취소), 빈 값으로 적용하면 unsetLink, 값이 있으면 setLink다.
function LinkPopover({ editor, state }: LinkPopoverProps) {
  // 열림 여부와 "어디에 적용할지"를 한 상태로 묶는다 — selection을 모르는 채
  // 열려 있는 상태를 만들 수 없다. 닫히면 팝업이 언마운트돼 다음에 열 때
  // 입력값이 defaultValue로 새로 채워진다.
  const [draft, setDraft] = useState<LinkDraft | null>(null);
  const isOpen = draft !== null;
  const isActive = state.link?.active ?? false;

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
      <ToolbarTooltip
        label="링크"
        disabled={isOpen}
        trigger={
          <Popover.Trigger
            render={
              <Toolbar.Button
                aria-label="링크"
                aria-pressed={isActive}
                disabled={!editor}
                // 다른 버튼과 같은 이유로 mousedown을 막는다 — 여기서
                // 에디터가 blur되면 팝오버를 열기도 전에 selection을 잃는다.
                onMouseDown={(event) => event.preventDefault()}
                className={cn(ICON_BUTTON, isActive ? PRESSED : UNPRESSED)}
              />
            }
          />
        }
      >
        <LinkIcon />
      </ToolbarTooltip>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={8} className={POSITIONER}>
          {/* 닫힐 때 Base UI가 트리거로 포커스를 되돌리면 위에서 건 에디터
              포커스를 도로 뺏는다. 포커스 복귀는 이 컴포넌트가 직접 맡는다. */}
          <Popover.Popup finalFocus={false} className={cn(POPUP, "p-2")}>
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
                // 팝오버 안의 한 줄은 h-7 아이콘 버튼과 나란하므로 FIELD의
                // 높이·반경만 그 리듬으로 낮춘다.
                className={cn(FIELD, "h-7 w-56 rounded-md px-2")}
              />
              <button
                type="submit"
                className={cn(ICON_BUTTON, UNPRESSED, "px-2")}
              >
                적용
              </button>
              {/* 걸린 링크가 없을 때 띄우면 아무 일도 하지 않는 버튼이 된다 */}
              {draft !== null && draft.href !== "" && (
                <button
                  type="button"
                  onClick={() => applyLink("")}
                  className={cn(ICON_BUTTON, UNPRESSED, "px-2")}
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

interface StateOption<Value extends string> extends SelectOption<Value> {
  run?: (editor: Editor) => void;
}

interface StateSelectProps<Value extends string> {
  label: string;
  options: StateOption<Value>[];
  /** 켜진 옵션이 없을 때 보여줄 값 */
  fallback: Value;
  editor: Editor | null;
  state: ToolbarState;
}

// 블록 종류·목록처럼 옵션이 곧 에디터 상태인 드롭다운. 옵션에 켤 명령이 없으면
// ("목록 없음") 지금 켜진 옵션의 토글을 한 번 더 불러 끈다 — 해제 전용 명령을
// 따로 두면 켜는 경로와 끄는 경로가 갈려 어긋난다. 같은 값을 다시 고르는 경우는
// ToolbarSelect가 이미 막았으므로 이때 current는 반드시 명령이 있는 옵션이다.
function StateSelect<Value extends string>({
  label,
  options,
  fallback,
  editor,
  state,
}: StateSelectProps<Value>) {
  const current =
    options.find((option) => state[option.value]?.active)?.value ?? fallback;

  return (
    <ToolbarSelect
      label={label}
      options={options}
      value={current}
      disabled={!editor}
      onChange={(value) => {
        const pick = (target: Value) =>
          options.find((option) => option.value === target)?.run;
        if (editor) (pick(value) ?? pick(current))?.(editor);
      }}
    />
  );
}

interface ToolbarSelectProps<Value extends string> {
  label: string;
  options: SelectOption<Value>[];
  value: Value;
  disabled: boolean;
  onChange: (value: Value) => void;
}

/**
 * 블록 종류·목록처럼 "여럿 중 하나"인 상태를 고르는 드롭다운. 렌더 트리는
 * select.tsx가 코드블록과 나눠 쓰고, 여기서는 툴바 자리에 맞춰 트리거만
 * Toolbar.Button으로 감싼다 — 그래야 방향키로 다른 버튼과 함께 넘어간다.
 */
function ToolbarSelect<Value extends string>({
  label,
  options,
  value,
  disabled,
  onChange,
}: ToolbarSelectProps<Value>) {
  return (
    <EditorSelect
      label={label}
      options={options}
      value={value}
      disabled={disabled}
      onChange={onChange}
      trigger={<Toolbar.Button />}
      triggerClassName={cn(UNPRESSED, "w-24 min-w-24 px-2")}
    />
  );
}

function UndoIcon() {
  return (
    <StrokeIcon>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </StrokeIcon>
  );
}

function RedoIcon() {
  return (
    <StrokeIcon>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </StrokeIcon>
  );
}

function LinkIcon() {
  return (
    <StrokeIcon>
      <path d="M15 7h3a5 5 0 0 1 0 10h-3" />
      <path d="M9 17H6a5 5 0 0 1 0-10h3" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </StrokeIcon>
  );
}

// 회전은 CSS에 맡긴다 — 진행 표시 하나 때문에 애니메이션 루프를 돌릴 이유가 없다
function SpinnerIcon() {
  return (
    <StrokeIcon className="animate-spin">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </StrokeIcon>
  );
}

// 정렬 아이콘 세 개는 가운데 짧은 줄의 시작점만 다르다. 같은 SVG를 세 번
// 적는 대신 그 좌표만 데이터로 둔다.
const ALIGN_LINE_START: Record<Align, number> = {
  left: 3,
  center: 6,
  right: 9,
};
const ALIGN_LINE_LENGTH = 12;

function AlignIcon({ variant }: { variant: Align }) {
  const start = ALIGN_LINE_START[variant];

  return (
    <StrokeIcon>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line
        x1={start}
        y1="12"
        x2={start + ALIGN_LINE_LENGTH}
        y2="12"
        strokeWidth="3"
      />
      <line x1="3" y1="18" x2="21" y2="18" />
    </StrokeIcon>
  );
}
