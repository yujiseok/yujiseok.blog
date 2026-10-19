"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Combobox } from "@base-ui/react/combobox";
import { Toast } from "@base-ui/react/toast";
import { format } from "date-fns";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useActionState, useReducer, useState, useTransition } from "react";

import { cn } from "@/lib/cn";
import { isPublished } from "@/lib/content/document";
import { deletePost, listPosts, savePost, type PostListItem } from "./actions";
import { BlockAlign } from "@/lib/editor/align";
import { CodeBlockShiki } from "./code-block-shiki";
import { DateField } from "./date-field";
import { DetailsNodes } from "./details-node";
import { ResizableImage } from "./image-node";
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
} from "@/lib/editor/draft";
import { CaretDownIcon } from "./icons";
import { MdxBlock } from "./mdx-block";
import { SlashCommand } from "./slash-command";
import { TabTrap } from "./tab-trap";
import { TableNodes } from "./table-node";
import { EditorToastViewport, useSaveToast } from "./toast";
import { EditorToolbar } from "./toolbar";
import {
  ACTION_BUTTON,
  CONTROL,
  SURFACE,
  DIALOG_BUTTON,
  FIELD,
  MENU_ITEM,
  POPUP,
  POSITIONER,
} from "./ui";

// toISOString()은 UTC로 변환한다 — KST 자정 근처에 새 글을 쓰면 발행일이
// 하루 밀리거나 당겨진다. date-fns의 format은 로컬 기준이다.
const today = () => format(new Date(), "yyyy-MM-dd");

interface EditorClientProps {
  initialPosts: PostListItem[];
  /** /editor?post=<slug>로 들어왔을 때 서버가 미리 읽어 둔 글 */
  initialPost: LoadedPostInput | null;
}

export default function EditorClient(props: EditorClientProps) {
  // 저장 결과는 토스트로만 알린다. useSaveToast가 Provider 안에서만 동작하므로
  // 폼을 한 겹 안으로 넣는다.
  // limit 없이 두면 같은 실패를 반복할 때 토스트가 끝없이 쌓여 화면을 덮는다.
  return (
    <Toast.Provider limit={3}>
      {/* URL의 ?post이 곧 "열려 있는 글"이다. 그게 바뀌면 폼을 통째로 다시
          세운다 — 어떤 글을 열었는지가 상태가 아니라 주소에 있어야
          새로고침해도 살아남고, 뒤로 가기도 그냥 동작한다. */}
      <EditorForm key={props.initialPost?.slug ?? "new"} {...props} />
      <EditorToastViewport />
    </Toast.Provider>
  );
}

function EditorForm({ initialPosts, initialPost }: EditorClientProps) {
  const toast = useSaveToast();
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, startLoadTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // 글을 여는 건 클라이언트 상태 변경이 아니라 이동이다. page.tsx가 ?post을
  // 읽어 서버에서 미리 읽어 넘기므로 여기서 readPost를 다시 부를 일이 없다.
  const openPost = (slug: string) =>
    startLoadTransition(() => router.push(`/editor?post=${slug}`));

  // 폼 필드·불러온 원본·왕복 안전 여부는 항상 함께 움직인다(새 글, 글 열기,
  // 저장 완료). 흩어진 setState로 두면 한 곳을 빠뜨려 image가 사라지거나
  // 덮어쓰기 판정이 어긋난다 — 전이를 lib/editor/draft.ts 한곳에 모아 두고 테스트한다.
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
      // 코드블록 안에서 Tab은 포커스를 옮기는 대신 들여쓴다. 목록의 Tab
      // 들여쓰기는 StarterKit의 listItem이 이미 처리한다.
      CodeBlockShiki.configure({
        defaultLanguage: "ts",
        enableTabIndentation: true,
        tabSize: 2,
      }),
      Underline,
      // 문단·제목에 align attr만 얹는다. 저장하면 markdown.ts가
      // <div style={{ textAlign }}>로 감싼다.
      BlockAlign,
      ResizableImage,
      MdxBlock,
      // GFM 파이프 표. 표·행·셀 네 노드가 한 벌이라 배열째 펼친다.
      ...TableNodes,
      // <details> 접기. details > (detailsSummary, detailsContent) 세 노드가
      // 한 벌이다.
      ...DetailsNodes,
      SlashCommand,
      TabTrap,
    ],
    content: draft.doc,
  });

  // Tiptap 에디터는 React 상태가 아니라 외부 시스템이다. draft.doc은 새 글·글
  // 열기에서만 새 참조가 되므로(다른 액션은 그대로 흘려보낸다) 타이핑마다
  // 내용을 되돌려 쓰지 않는다.
  const removePost = (slug: string) =>
    startDeleteTransition(async () => {
      try {
        await deletePost(slug);
        // 방금 지운 글을 계속 보여 줄 수 없다. 빈 에디터로 되돌린다.
        router.push("/editor");
      } catch (error) {
        toast.failed(
          error instanceof Error ? error.message : "삭제하지 못했습니다.",
        );
      }
    });

  // form의 action으로 넘기므로 payload는 FormData다. 폼에 입력 요소가 없어
  // 값을 읽지는 않고, 트랜지션 안에서 실행되도록 하는 게 목적이다.
  const [, dispatchSave, isSaving] = useActionState<null, FormData>(
    async () => {
      if (!editor) {
        toast.failed("에디터가 아직 준비되지 않았습니다.");
        return null;
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
        toast.saved(draft.slug);

        // 새 글이었거나 슬러그를 바꿔 저장했다면 주소가 아직 그 글을 가리키지
        // 않는다. 여기서 맞춰 둬야 새로고침했을 때 방금 쓴 글이 열린다.
        if (initialPost?.slug !== draft.slug) {
          router.replace(`/editor?post=${draft.slug}`);
        }
      } catch (error) {
        toast.failed(
          error instanceof Error ? error.message : "저장에 실패했습니다.",
        );
      }

      return null;
    },
    null,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <PostPicker
          posts={posts}
          selectedSlug={draft.loaded?.slug ?? null}
          onSelect={openPost}
        />
        <button
          type="button"
          onClick={() => startLoadTransition(() => router.push("/editor"))}
          className={cn(CONTROL, "shrink-0 font-medium")}
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
      <section className="flex flex-col gap-6">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">제목</span>
            <input
              value={draft.title}
              onChange={(event) =>
                dispatch({ type: "title", value: event.target.value })
              }
              className={FIELD}
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
              className={FIELD}
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
            {/* 한 줄짜리다. serializePost가 JSON.stringify로 프론트매터를 한 줄에
                쓰는 데다, 이 값은 meta description·RSS·og로 그대로 나가서
                줄바꿈이 들어갈 자리가 없다. input이면 아예 못 넣는다. */}
            <input
              type="text"
              value={draft.summary}
              onChange={(event) =>
                dispatch({
                  type: "field",
                  field: "summary",
                  value: event.target.value,
                })
              }
              className={FIELD}
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

          <label className="flex w-fit items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) =>
                dispatch({ type: "published", value: event.target.checked })
              }
              className="size-4 accent-black dark:accent-white"
            />
            <span className="font-medium">발행</span>
            {!draft.published && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                끄면 초안으로 저장돼 개발 서버에서만 보입니다
              </span>
            )}
          </label>
        </div>

        <div className={cn(SURFACE, "relative")}>
          <EditorToolbar editor={editor} slug={draft.slug} />
          {/* DragHandle의 기본 배치는 left-start라 핸들 오른쪽 끝이 블록 왼쪽
              끝에 딱 붙고 위로 정렬된다. 오른쪽 여백으로 본문과 떼어 놓고,
              본문 한 줄 높이(1.75rem) 안에서 세로 가운데로 맞춘다. */}
          {editor && (
            <DragHandle editor={editor} className="flex h-7 items-center pr-2">
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
        <div className="flex items-center gap-3">
          <form action={dispatchSave}>
            <button
              type="submit"
              disabled={isSaving || !canSave(draft)}
              className={cn(
                ACTION_BUTTON,
                "bg-black text-white dark:bg-white dark:text-black",
              )}
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </form>

          {/* 저장된 글만 열 수 있다. 개발 서버의 실제 글 페이지라 shiki
              하이라이트·MDX 컴포넌트·본문 스타일이 전부 그대로다 — 초안이어도
              개발 서버에서는 보이고 프로덕션에는 나가지 않는다. */}
          {draft.loaded && (
            <a
              href={`/posts/${draft.loaded.slug}`}
              target="_blank"
              rel="noreferrer"
              className={cn(CONTROL, "flex items-center font-medium")}
            >
              미리보기
            </a>
          )}

          {/* 이미 파일이 있는 글만 지울 수 있다. 저장한 적 없는 새 글은
              지울 대상 자체가 없다. */}
          {draft.loaded && (
            <DeletePostDialog
              title={draft.loaded.metadata.title}
              disabled={isDeleting}
              onConfirm={() => removePost(draft.loaded!.slug)}
            />
          )}
        </div>
      </section>
    </div>
  );
}

interface DeletePostDialogProps {
  title: string;
  disabled: boolean;
  onConfirm: () => void;
}

// 되돌릴 수 없는 동작이라 한 번 묻는다. 네이티브 confirm 대신 Base UI를 써
// 나머지 UI와 톤을 맞춘다.
const DeletePostDialog = ({
  title,
  disabled,
  onConfirm,
}: DeletePostDialogProps) => (
  <AlertDialog.Root>
    <AlertDialog.Trigger
      // form 안이 아니지만, 나중에 옮겨도 submit으로 새지 않게 명시한다
      type="button"
      disabled={disabled}
      className={cn(
        ACTION_BUTTON,
        "text-red-600 hover:bg-red-500/10 dark:text-red-400",
      )}
    >
      {disabled ? "삭제 중..." : "삭제"}
    </AlertDialog.Trigger>

    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-black/40 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <AlertDialog.Popup
        className={cn(
          POPUP,
          "fixed top-1/2 left-1/2 z-50 flex w-80 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 p-4",
        )}
      >
        <AlertDialog.Title className="text-sm font-medium">
          이 글을 지울까요?
        </AlertDialog.Title>
        <AlertDialog.Description className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          &ldquo;{title}&rdquo; 파일을 지웁니다. 되돌릴 수 없습니다. 올린
          이미지는 남습니다.
        </AlertDialog.Description>
        <div className="flex justify-end gap-2">
          <AlertDialog.Close
            className={cn(
              DIALOG_BUTTON,
              "text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-neutral-200/10",
            )}
          >
            취소
          </AlertDialog.Close>
          <AlertDialog.Close
            onClick={onConfirm}
            className={cn(
              DIALOG_BUTTON,
              "bg-red-600 text-white hover:bg-red-700",
            )}
          >
            삭제
          </AlertDialog.Close>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

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
    // 목록에서 초안과 발행된 글이 구분돼야 어느 쪽을 여는지 알 수 있다
    label: isPublished(post.metadata)
      ? post.metadata.title
      : `${post.metadata.title} (초안)`,
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
      {/* w-64로는 한글 제목이 트리거에서 잘린다. 목록과 같은 폭을 주되
          좁은 화면에서는 줄어들게 상한만 건다. */}
      <Combobox.InputGroup className="relative w-[28rem] max-w-full shrink">
        <Combobox.Input
          placeholder="글 열기..."
          aria-label="글 열기"
          className={cn(FIELD, "w-full pr-8")}
        />
        <Combobox.Trigger
          aria-label="목록 열기"
          className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-neutral-400 dark:text-neutral-600"
        >
          <CaretDownIcon />
        </Combobox.Trigger>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner
          align="start"
          sideOffset={4}
          className={POSITIONER}
        >
          {/* 목록은 제목을 읽으라고 여는 것이라 내용만큼 넓어지게 둔다. 그러면
              기본 center 정렬로는 팝업이 좌우로 퍼져 입력창 왼쪽 밖까지
              삐져나가므로 align="start"로 왼쪽을 맞춘다. */}
          <Combobox.Popup
            className={cn(
              POPUP,
              "max-w-[var(--available-width)] min-w-[var(--anchor-width)] overflow-hidden p-1",
            )}
          >
            <Combobox.Empty className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
              해당하는 글이 없습니다.
            </Combobox.Empty>
            <Combobox.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain data-empty:p-0">
              {(option: PostOption) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  className={cn(MENU_ITEM, "truncate")}
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
