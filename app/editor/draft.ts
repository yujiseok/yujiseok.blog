import type { JSONContent } from "@tiptap/core";

import { isValidSlug, toSlug, type PostMetadata } from "@/lib/editor/document";

/**
 * 파일로 존재하는 글의 원본. null이면 아직 파일이 없는 새 글이다.
 * 편집 중인 값(title 등)과 따로 들고 있는 이유는 아래 draftMetadata 참고.
 */
export interface LoadedPost {
  slug: string;
  metadata: PostMetadata;
  /** 에디터를 거쳐도 본문이 복원되는지. false면 저장이 원문을 훼손한다 */
  lossless: boolean;
}

export interface Draft {
  loaded: LoadedPost | null;
  slug: string;
  /** 사용자가 슬러그를 직접 건드렸는지. 제목에서 자동 생성할지를 가른다 */
  slugTouched: boolean;
  title: string;
  summary: string;
  publishedAt: string;
  doc: JSONContent;
}

export type DraftAction =
  | {
      type: "loaded";
      slug: string;
      metadata: PostMetadata;
      doc: JSONContent;
      lossless: boolean;
    }
  | { type: "title"; value: string }
  | { type: "slug"; value: string }
  | { type: "field"; field: "summary" | "publishedAt"; value: string }
  | { type: "saved"; slug: string; metadata: PostMetadata };

/** 서버가 미리 읽어 넘겨준 글. /editor?post=<slug>로 바로 열 때 쓴다 */
export type LoadedPostInput = Omit<
  Extract<DraftAction, { type: "loaded" }>,
  "type"
>;

export const emptyDoc = (): JSONContent => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

// 오늘 날짜는 부수효과라 리듀서 밖에서 만들어 넣는다. 덕분에 리듀서가 순수하게
// 남아 시계를 흉내내지 않고도 테스트된다.
export const createDraft = (publishedAt: string): Draft => ({
  loaded: null,
  slug: "",
  slugTouched: false,
  title: "",
  summary: "",
  publishedAt,
  doc: emptyDoc(),
});

export const draftReducer = (draft: Draft, action: DraftAction): Draft => {
  switch (action.type) {
    case "loaded":
      return {
        loaded: {
          slug: action.slug,
          metadata: action.metadata,
          lossless: action.lossless,
        },
        // 불러온 글의 슬러그는 곧 파일명이다. 제목을 고쳤다고 따라 바뀌면
        // 멀쩡한 글 옆에 사본이 하나 더 생긴다.
        slugTouched: true,
        slug: action.slug,
        title: action.metadata.title,
        summary: action.metadata.summary,
        publishedAt: action.metadata.publishedAt,
        doc: action.doc,
      };

    case "title":
      return {
        ...draft,
        title: action.value,
        slug: draft.slugTouched ? draft.slug : toSlug(action.value),
      };

    case "slug":
      return { ...draft, slug: action.value, slugTouched: true };

    case "field":
      return { ...draft, [action.field]: action.value };

    case "saved":
      // 저장한 순간부터 그 파일이 원본이다 — 같은 슬러그로 다시 저장하면
      // 덮어쓰기가 허용돼야 하고, 방금 쓴 내용이 다음 저장의 기준이 된다.
      return {
        ...draft,
        loaded: {
          slug: action.slug,
          metadata: action.metadata,
          lossless: true,
        },
      };
  }
};

/**
 * 저장할 메타데이터. 기존 글은 원본 위에 편집한 값만 덮어쓴다 — 새로 조립하면
 * image처럼 에디터가 다루지 않는 키가 날아가고 키 순서도 바뀌어,
 * lib/editor/document.ts가 보장하는 바이트 왕복이 깨진다. 새 글은
 * content/writing의 관례인 title·publishedAt·summary 순으로 만든다.
 */
export const draftMetadata = (draft: Draft): PostMetadata =>
  draft.loaded
    ? {
        ...draft.loaded.metadata,
        title: draft.title,
        summary: draft.summary,
        publishedAt: draft.publishedAt,
      }
    : {
        title: draft.title,
        publishedAt: draft.publishedAt,
        summary: draft.summary,
      };

/** 불러온 그 파일을 고쳐 쓰는 중일 때만 덮어쓰기를 허용한다 */
export const isOverwrite = (draft: Draft): boolean =>
  draft.loaded?.slug === draft.slug;

/** 에디터가 표현하지 못하는 구문이 든 글. 저장하면 원문이 깎이므로 막는다 */
export const isLossy = (draft: Draft): boolean =>
  draft.loaded !== null && !draft.loaded.lossless;

export const slugInvalid = (draft: Draft): boolean =>
  draft.slug.length > 0 && !isValidSlug(draft.slug);

/** 한글 제목은 toSlug가 빈 문자열을 내놓는다. 직접 입력하라고 알려야 한다 */
export const slugNeedsManualInput = (draft: Draft): boolean =>
  draft.title.trim().length > 0 &&
  !draft.slugTouched &&
  draft.slug.length === 0;

export const canSave = (draft: Draft): boolean =>
  !isLossy(draft) &&
  isValidSlug(draft.slug) &&
  draft.title.trim().length > 0 &&
  draft.summary.trim().length > 0;
