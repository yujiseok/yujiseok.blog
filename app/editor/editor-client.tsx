"use client";

import { Combobox } from "@base-ui/react/combobox";
import { format } from "date-fns";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useActionState,
  useEffect,
  useReducer,
  useState,
  useTransition,
} from "react";

import { listPosts, readPost, savePost, type PostListItem } from "./actions";
import { CodeBlockShiki } from "./code-block-shiki";
import { DateField } from "./date-field";
import {
  canSave,
  createDraft,
  draftMetadata,
  draftReducer,
  isLossy,
  isOverwrite,
  slugInvalid,
  slugNeedsManualInput,
  type LoadedPostInput,
} from "./draft";
import { MdxBlock } from "./mdx-block";
import { SlashCommand } from "./slash-command";
import { EditorToolbar } from "./toolbar";

// toISOString()은 UTC로 변환한다 — KST 자정 근처에 새 글을 쓰면 발행일이
// 하루 밀리거나 당겨진다. date-fns의 format은 로컬 기준이다.
const today = () => format(new Date(), "yyyy-MM-dd");

type SaveResult =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

interface EditorClientProps {
  initialPosts: PostListItem[];
  /** /editor?post=<slug>로 들어왔을 때 서버가 미리 읽어 둔 글 */
  initialPost: LoadedPostInput | null;
}

export default function EditorClient({
  initialPosts,
  initialPost,
}: EditorClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, startLoadTransition] = useTransition();

  // 폼 필드·불러온 원본·왕복 안전 여부는 항상 함께 움직인다(새 글, 글 열기,
  // 저장 완료). 흩어진 setState로 두면 한 곳을 빠뜨려 image가 사라지거나
  // 덮어쓰기 판정이 어긋난다 — 전이를 draft.ts 한곳에 모아 두고 테스트한다.
  const [draft, dispatch] = useReducer(draftReducer, initialPost, (post) =>
    post
      ? draftReducer(createDraft(today()), { type: "loaded", ...post })
      : createDraft(today()),
  );

  const editor = useEditor({
    immediatelyRender: false,
    // 여기 등록된 노드/마크가 lib/editor/markdown.ts가 실제로 왕복시킬 수
    // 있는 전부다. bold·italic·strike·code·link·underline은 모두 지원되므로
    // 그대로 두고(기존 글에 이미 들어 있는 서식을 열자마자 지우면 안 된다),
    // mdxBlock은 기존 글의 <Image>·<Callout> 같은 JSX를 읽기 전용으로
    // 보존한다. 이 목록에 없는 노드를 추가하면 저장 시 docToMarkdown이
    // "지원하지 않는 노드 타입"으로 던진다.
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // StarterKit v3가 기본 포함하는 underline 대신 아래에서 명시적으로
        // 등록한다 — 중복 등록 방지.
        underline: false,
        // 기본 codeBlock은 토큰화도, meta(제목) attr도 없다. 후자가 특히
        // 위험한데, 스키마에 없는 attr은 setContent에서 조용히 버려져
        // ```ts title="..." 인 글을 열었다 저장만 해도 제목이 사라진다.
        codeBlock: false,
      }),
      // 새 블록은 language가 null이라 칠할 근거가 없다. 이 블로그 코드펜스는
      // ts/tsx가 대부분이라 ts로 열고, 다르면 블록 우상단에서 바꾼다.
      // 기존 글의 언어 없는 펜스는 markdownToDoc이 null을 명시해 그대로 남는다.
      CodeBlockShiki.configure({ defaultLanguage: "ts" }),
      Underline,
      Image,
      MdxBlock,
      SlashCommand,
    ],
    content: draft.doc,
  });

  // Tiptap 에디터는 React 상태가 아니라 외부 시스템이다. draft.doc은 새 글·글
  // 열기에서만 새 참조가 되므로(다른 액션은 그대로 흘려보낸다) 타이핑마다
  // 내용을 되돌려 쓰지 않는다.
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(draft.doc);
  }, [editor, draft.doc]);

  const startNewPost = () => {
    dispatch({ type: "reset", publishedAt: today() });
    setLoadError(null);
  };

  const loadPost = (slug: string) => {
    setLoadError(null);
    startLoadTransition(async () => {
      try {
        const { metadata, doc, lossless } = await readPost(slug);
        dispatch({ type: "loaded", slug, metadata, doc, lossless });
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "글을 불러오지 못했습니다.",
        );
      }
    });
  };

  // form의 action으로 넘기므로 payload는 FormData다. 폼에 입력 요소가 없어
  // 값을 읽지는 않고, 트랜지션 안에서 실행되도록 하는 게 목적이다.
  const [saveResult, dispatchSave, isSaving] = useActionState<
    SaveResult,
    FormData
  >(
    async () => {
      if (!editor) {
        return {
          status: "error",
          message: "에디터가 아직 준비되지 않았습니다.",
        };
      }
      if (!canSave(draft)) {
        return { status: "error", message: "저장할 수 없는 상태입니다." };
      }

      const metadata = draftMetadata(draft);

      try {
        await savePost({
          slug: draft.slug,
          metadata,
          // 객체 그대로 넘기면 ProseMirror의 attrs가 임시 참조로 바뀐다.
          // 자세한 이유는 actions.ts의 parseDocument 주석에 있다.
          doc: JSON.stringify(editor.getJSON()),
          overwrite: isOverwrite(draft),
        });
        dispatch({ type: "saved", slug: draft.slug, metadata });
        setPosts(await listPosts());
        return { status: "success" };
      } catch (error) {
        return {
          status: "error",
          message:
            error instanceof Error ? error.message : "저장에 실패했습니다.",
        };
      }
    },
    { status: "idle" },
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <PostPicker
          posts={posts}
          selectedSlug={draft.loaded?.slug ?? null}
          onSelect={loadPost}
        />
        <button
          type="button"
          onClick={startNewPost}
          className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium dark:border-neutral-800"
        >
          + 새 글
        </button>
        {isLoading && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            불러오는 중...
          </span>
        )}
      </div>

      {isLossy(draft) && (
        <p className="rounded-md bg-amber-100 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          이 글에는 에디터가 다루지 못하는 구문(코드블록 제목, 문장 중간의 JSX
          등)이 있습니다. 여기서 저장하면 원문이 깎이므로 저장을 막았습니다.
          IDE에서 편집하세요.
        </p>
      )}
      {loadError && (
        <p className="text-xs text-red-600 dark:text-red-400">{loadError}</p>
      )}

      <section className="flex flex-col gap-6">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">제목</span>
            <input
              value={draft.title}
              onChange={(event) =>
                dispatch({ type: "title", value: event.target.value })
              }
              className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">슬러그</span>
            <input
              value={draft.slug}
              onChange={(event) =>
                dispatch({ type: "slug", value: event.target.value })
              }
              aria-invalid={slugInvalid(draft)}
              aria-describedby={
                slugNeedsManualInput(draft) || slugInvalid(draft)
                  ? "slug-hint"
                  : undefined
              }
              className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
            />
            {slugNeedsManualInput(draft) && (
              <span
                id="slug-hint"
                className="text-xs text-amber-600 dark:text-amber-400"
              >
                한글 제목은 슬러그를 자동으로 만들 수 없습니다. 직접 입력하세요.
              </span>
            )}
            {slugInvalid(draft) && (
              <span
                id="slug-hint"
                className="text-xs text-red-600 dark:text-red-400"
              >
                소문자·숫자·하이픈만 사용할 수 있고, 하이픈으로 끝날 수
                없습니다.
              </span>
            )}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">요약</span>
            <textarea
              value={draft.summary}
              onChange={(event) =>
                dispatch({
                  type: "field",
                  field: "summary",
                  value: event.target.value,
                })
              }
              rows={2}
              className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
            />
          </label>

          <div className="grid w-fit gap-1 text-sm">
            <label htmlFor="published-at" className="font-medium">
              발행일
            </label>
            <DateField
              id="published-at"
              value={draft.publishedAt}
              onChange={(value) =>
                dispatch({ type: "field", field: "publishedAt", value })
              }
            />
          </div>
        </div>

        <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-800">
          <EditorToolbar editor={editor} />
          {editor && (
            <DragHandle editor={editor}>
              <GripIcon />
            </DragHandle>
          )}
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none px-6 py-4 focus:outline-none [&_.ProseMirror]:focus:outline-none"
          />
        </div>

        {/* useActionState의 dispatch는 트랜지션 안에서 불러야 isSaving이 제대로
            갱신된다. form의 action으로 넘기면 React가 알아서 감싸 준다. */}
        <form action={dispatchSave} className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving || !canSave(draft)}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 dark:bg-white dark:text-black"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
          {saveResult.status === "success" && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              저장했습니다.
            </span>
          )}
          {saveResult.status === "error" && (
            <span className="text-sm text-red-600 dark:text-red-400">
              {saveResult.message}
            </span>
          )}
        </form>
      </section>
    </div>
  );
}

interface PostOption {
  value: string;
  label: string;
}

interface PostPickerProps {
  posts: PostListItem[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

// 글이 25편을 넘겨 목록을 통째로 늘어놓으면 훑기가 더 느리다. 제목을 쳐서
// 좁히는 편이 빠르므로 Select 대신 Combobox를 쓴다.
const PostPicker = ({ posts, selectedSlug, onSelect }: PostPickerProps) => {
  const options: PostOption[] = posts.map((post) => ({
    value: post.slug,
    label: post.metadata.title,
  }));
  const selected = options.find(({ value }) => value === selectedSlug) ?? null;

  return (
    <Combobox.Root
      items={options}
      value={selected}
      // 매 렌더마다 새 객체를 만드므로 참조 비교로는 선택이 유지되지 않는다
      isItemEqualToValue={(a, b) => a.value === b.value}
      onValueChange={(option) => option && onSelect(option.value)}
    >
      <Combobox.InputGroup className="relative w-64 shrink-0">
        <Combobox.Input
          placeholder="글 열기..."
          aria-label="글 열기"
          className="w-full rounded-lg border border-neutral-200 bg-transparent py-2 pr-8 pl-3 text-sm focus:outline-none dark:border-neutral-800"
        />
        <Combobox.Trigger
          aria-label="목록 열기"
          className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-neutral-400 dark:text-neutral-600"
        >
          <CaretDownIcon />
        </Combobox.Trigger>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="z-20 outline-none">
          <Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <Combobox.Empty className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
              해당하는 글이 없습니다.
            </Combobox.Empty>
            <Combobox.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain data-empty:p-0">
              {(option: PostOption) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  className="cursor-default truncate rounded-md px-3 py-2 text-sm text-neutral-700 outline-none select-none data-highlighted:bg-black/5 dark:text-neutral-300 dark:data-highlighted:bg-neutral-200/10"
                >
                  {option.label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
};

const CaretDownIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M2 4l3 3 3-3" />
  </svg>
);

const GripIcon = () => (
  <svg
    width="12"
    height="18"
    viewBox="0 0 12 18"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="cursor-grab text-neutral-400 dark:text-neutral-600"
  >
    <circle cx="3" cy="3" r="1.4" />
    <circle cx="9" cy="3" r="1.4" />
    <circle cx="3" cy="9" r="1.4" />
    <circle cx="9" cy="9" r="1.4" />
    <circle cx="3" cy="15" r="1.4" />
    <circle cx="9" cy="15" r="1.4" />
  </svg>
);
