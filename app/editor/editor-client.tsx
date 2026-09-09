"use client";

import { DragHandle } from "@tiptap/extension-drag-handle-react";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/core";
import { useActionState, useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/cn";
import { isValidSlug, toSlug, type PostMetadata } from "@/lib/editor/document";
import { listPosts, readPost, savePost, type PostListItem } from "./actions";
import { MdxBlock } from "./mdx-block";
import { SlashCommand } from "./slash-command";

const emptyDoc = (): JSONContent => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

const today = () => new Date().toISOString().slice(0, 10);

type SaveResult =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

interface EditorClientProps {
  initialPosts: PostListItem[];
}

export default function EditorClient({ initialPosts }: EditorClientProps) {
  const [posts, setPosts] = useState(initialPosts);

  const [slug, setSlug] = useState("");
  // 불러온 글의 slug. null이면 새 글이다. 이 값과 slug가 같을 때만 덮어쓰기를
  // 허용한다 — 불러온 글의 slug를 바꿔 저장하면 그건 새 파일이어야 한다
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [publishedAt, setPublishedAt] = useState(today);
  const [loadedDoc, setLoadedDoc] = useState<JSONContent>(emptyDoc);

  const [loadError, setLoadError] = useState<string | null>(null);
  // 에디터가 표현하지 못하는 구문이 든 글. 저장하면 원문이 깎이므로 막는다
  const [lossy, setLossy] = useState(false);
  const [isLoading, startLoadTransition] = useTransition();

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
      }),
      Underline,
      Image,
      MdxBlock,
      SlashCommand,
    ],
    content: loadedDoc,
  });

  // Tiptap 에디터는 React 상태가 아니라 외부 시스템이다. "불러온 문서"가
  // 바뀔 때만(글 선택·새 글) 인스턴스 내용을 동기화한다 — 타이핑마다
  // React 상태로 되돌려 리렌더를 만들지 않는다.
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(loadedDoc);
  }, [editor, loadedDoc]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(toSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const resetForNewPost = () => {
    setSlug("");
    setLoadedSlug(null);
    setSlugTouched(false);
    setTitle("");
    setSummary("");
    setPublishedAt(today());
    setLoadedDoc(emptyDoc());
    setLoadError(null);
    setLossy(false);
  };

  const loadPost = (item: PostListItem) => {
    setLoadError(null);
    startLoadTransition(async () => {
      try {
        const { metadata, doc, lossless } = await readPost(item.slug);
        setLossy(!lossless);
        setSlug(item.slug);
        setLoadedSlug(item.slug);
        setSlugTouched(true);
        setTitle(metadata.title);
        setSummary(metadata.summary);
        setPublishedAt(metadata.publishedAt);
        setLoadedDoc(doc);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "글을 불러오지 못했습니다.",
        );
      }
    });
  };

  const [saveResult, dispatchSave, isSaving] = useActionState<SaveResult, void>(
    async () => {
      if (!editor) {
        return { status: "error", message: "에디터가 아직 준비되지 않았습니다." };
      }
      if (!isValidSlug(slug)) {
        return { status: "error", message: "슬러그가 올바르지 않습니다." };
      }

      const metadata: PostMetadata = { title, summary, publishedAt };

      try {
        await savePost({
          slug,
          metadata,
          doc: editor.getJSON(),
          overwrite: loadedSlug === slug,
        });
        setLoadedSlug(slug);
        setPosts(await listPosts());
        return { status: "success" };
      } catch (error) {
        return {
          status: "error",
          message: error instanceof Error ? error.message : "저장에 실패했습니다.",
        };
      }
    },
    { status: "idle" },
  );

  const slugInvalid = slug.length > 0 && !isValidSlug(slug);
  const slugNeedsManualInput = title.trim().length > 0 && !slugTouched && slug.length === 0;
  const canSave =
    !isSaving &&
    !lossy &&
    isValidSlug(slug) &&
    title.trim().length > 0 &&
    summary.trim().length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-2">
        <button
          type="button"
          onClick={resetForNewPost}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm font-medium dark:border-neutral-800"
        >
          + 새 글
        </button>

        <ul className="flex flex-col gap-1">
          {posts.map((post) => (
            <li key={post.slug}>
              <button
                type="button"
                onClick={() => loadPost(post)}
                className={cn(
                  "block w-full truncate rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-neutral-200/10",
                  slug === post.slug &&
                    slugTouched &&
                    "bg-black/5 dark:bg-neutral-200/10",
                )}
              >
                {post.metadata.title}
              </button>
            </li>
          ))}
        </ul>

        {isLoading && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            불러오는 중...
          </p>
        )}
        {lossy && (
          <p className="rounded-md bg-amber-100 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            이 글에는 에디터가 다루지 못하는 구문(코드블록 제목, 문장 중간의 JSX 등)이
            있습니다. 여기서 저장하면 원문이 깎이므로 저장을 막았습니다. IDE에서
            편집하세요.
          </p>
        )}
        {loadError && (
          <p className="text-xs text-red-600 dark:text-red-400">{loadError}</p>
        )}
      </aside>

      <section className="flex flex-col gap-6">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">제목</span>
            <input
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">슬러그</span>
            <input
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              aria-invalid={slugInvalid}
              aria-describedby={
                slugNeedsManualInput || slugInvalid ? "slug-hint" : undefined
              }
              className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
            />
            {slugNeedsManualInput && (
              <span
                id="slug-hint"
                className="text-xs text-amber-600 dark:text-amber-400"
              >
                한글 제목은 슬러그를 자동으로 만들 수 없습니다. 직접 입력하세요.
              </span>
            )}
            {slugInvalid && (
              <span id="slug-hint" className="text-xs text-red-600 dark:text-red-400">
                소문자·숫자·하이픈만 사용할 수 있고, 하이픈으로 끝날 수 없습니다.
              </span>
            )}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">요약</span>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={2}
              className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
            />
          </label>

          <label className="grid w-fit gap-1 text-sm">
            <span className="font-medium">발행일</span>
            <input
              type="date"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
            />
          </label>
        </div>

        <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-800">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatchSave()}
            disabled={!canSave}
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
        </div>
      </section>
    </div>
  );
}

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
