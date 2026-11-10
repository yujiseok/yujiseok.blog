import { describe, expect, it } from "vitest";

import type { PostMetadata } from "@/lib/content/document";
import {
  canSave,
  createDraft,
  draftMetadata,
  draftReducer,
  emptyDoc,
  isLossy,
  isOverwrite,
  slugInvalid,
  type Draft,
  type DraftAction,
} from "./draft";

const apply = (draft: Draft, ...actions: DraftAction[]): Draft =>
  actions.reduce(draftReducer, draft);

const blank = () => createDraft("2026-09-09");

type LoadedAction = Extract<DraftAction, { type: "loaded" }>;

const loadedAction = (
  metadata: Partial<PostMetadata> & { title: string },
): LoadedAction => ({
  type: "loaded",
  slug: "hello-world",
  lossless: true,
  doc: emptyDoc(),
  metadata: {
    publishedAt: "2025-01-02",
    summary: "요약",
    published: true,
    ...metadata,
  },
});

describe("제목에서 슬러그 자동 생성", () => {
  it("슬러그를 건드리기 전에는 제목을 따라간다", () => {
    const draft = apply(blank(), { type: "title", value: "Hello World" });
    expect(draft.slug).toBe("hello-world");
  });

  it("슬러그를 직접 고친 뒤에는 제목이 바뀌어도 그대로다", () => {
    const draft = apply(
      blank(),
      { type: "title", value: "Hello World" },
      { type: "slug", value: "my-own-slug" },
      { type: "title", value: "Something Else" },
    );
    expect(draft.slug).toBe("my-own-slug");
  });

  it("불러온 글은 제목을 고쳐도 슬러그가 따라가지 않는다", () => {
    const draft = apply(blank(), loadedAction({ title: "원래 제목" }), {
      type: "title",
      value: "Renamed Title",
    });
    // 슬러그가 따라가면 원본 파일은 그대로 둔 채 사본이 하나 더 생긴다
    expect(draft.slug).toBe("hello-world");
  });
});

describe("저장할 메타데이터", () => {
  it("새 글은 content/writing 관례인 title·publishedAt·summary 순서로 만든다", () => {
    const draft = apply(
      blank(),
      { type: "title", value: "New Post" },
      { type: "field", field: "summary", value: "새 글 요약" },
    );
    expect(Object.keys(draftMetadata(draft))).toEqual([
      "title",
      "publishedAt",
      "summary",
      "published",
    ]);
  });

  it("기존 글의 요약을 비우면 summary 키가 빠진다", () => {
    const draft = apply(blank(), loadedAction({ title: "원래 제목" }), {
      type: "field",
      field: "summary",
      value: "",
    });
    expect("summary" in draftMetadata(draft)).toBe(false);
  });

  it("기존 글의 키 순서를 그대로 보존한다", () => {
    // 글마다 키 순서가 다를 수 있어, 새로 조립하면 저장만 해도 파일이 변형된다
    const draft = apply(
      blank(),
      {
        type: "loaded",
        slug: "hello-world",
        lossless: true,
        doc: emptyDoc(),
        metadata: {
          title: "원래 제목",
          summary: "원래 요약",
          publishedAt: "2025-01-02",
          image: "/cover.png",
          published: true,
        },
      },
      { type: "title", value: "고친 제목" },
    );

    expect(Object.keys(draftMetadata(draft))).toEqual([
      "title",
      "summary",
      "publishedAt",
      "image",
      "published",
    ]);
  });

  it("편집하지 않는 키(image)를 잃지 않는다", () => {
    const draft = apply(
      blank(),
      loadedAction({ title: "원래 제목", image: "/cover.png" }),
      { type: "field", field: "summary", value: "고친 요약" },
    );
    expect(draftMetadata(draft).image).toBe("/cover.png");
    expect(draftMetadata(draft).summary).toBe("고친 요약");
  });
});

describe("덮어쓰기 허용 여부", () => {
  it("새 글은 덮어쓰지 않는다", () => {
    expect(isOverwrite(apply(blank(), { type: "title", value: "New" }))).toBe(
      false,
    );
  });

  it("불러온 글을 그대로 저장하면 덮어쓴다", () => {
    expect(isOverwrite(apply(blank(), loadedAction({ title: "글" })))).toBe(
      true,
    );
  });

  it("불러온 글의 슬러그를 바꾸면 덮어쓰지 않는다", () => {
    const draft = apply(blank(), loadedAction({ title: "글" }), {
      type: "slug",
      value: "renamed",
    });
    // 다른 파일명이니 새 파일이어야 한다. 여기서 true가 되면 남의 글을 덮는다
    expect(isOverwrite(draft)).toBe(false);
  });

  it("새 글을 한 번 저장하고 나면 그 다음 저장은 덮어쓰기다", () => {
    const draft = apply(
      blank(),
      { type: "title", value: "New Post" },
      { type: "field", field: "summary", value: "요약" },
      {
        type: "saved",
        slug: "new-post",
        metadata: {
          title: "New Post",
          publishedAt: "2026-09-09",
          summary: "요약",
          published: false,
        },
      },
    );
    expect(isOverwrite(draft)).toBe(true);
  });
});

describe("저장 가능 여부", () => {
  const complete = () =>
    apply(
      blank(),
      { type: "title", value: "Hello World" },
      { type: "field", field: "summary", value: "요약" },
    );

  it("제목·슬러그가 있으면 저장할 수 있다", () => {
    expect(canSave(complete())).toBe(true);
  });

  it("요약은 비어 있어도 저장할 수 있다", () => {
    const draft = apply(complete(), {
      type: "field",
      field: "summary",
      value: " ",
    });
    expect(canSave(draft)).toBe(true);
  });

  it.each([
    ["제목", { type: "title", value: "  " } as DraftAction],
    ["슬러그", { type: "slug", value: "" } as DraftAction],
  ])("%s가 비면 저장할 수 없다", (_, action) => {
    expect(canSave(apply(complete(), action))).toBe(false);
  });

  it("왕복이 깨지는 글은 저장할 수 없다", () => {
    const draft = apply(blank(), {
      ...loadedAction({ title: "글" }),
      lossless: false,
    });
    expect(isLossy(draft)).toBe(true);
    expect(canSave(draft)).toBe(false);
  });

  it("잘못된 슬러그를 표시하고 저장을 막는다", () => {
    const draft = apply(complete(), { type: "slug", value: "Not A Slug" });
    expect(slugInvalid(draft)).toBe(true);
    expect(canSave(draft)).toBe(false);
  });
});

describe("발행 여부", () => {
  it("불러온 글의 발행 상태를 이어받는다", () => {
    const draft = apply(
      blank(),
      loadedAction({ title: "초안", published: false }),
    );
    expect(draft.published).toBe(false);
    expect(draftMetadata(draft).published).toBe(false);
  });

  // published 키가 없던 시절의 글을 열면 초안으로 본다
  it("published 키가 없는 글은 초안으로 연다", () => {
    const action = loadedAction({ title: "옛 글" });
    delete (action.metadata as Partial<PostMetadata>).published;

    expect(apply(blank(), action).published).toBe(false);
  });
});
