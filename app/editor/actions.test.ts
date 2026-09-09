import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { PostMetadata } from "@/lib/editor/document";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const METADATA: PostMetadata = {
  title: "제목",
  publishedAt: "2026-09-09",
  summary: "요약",
};

// savePost는 doc을 JSON 문자열로 받는다 — 이유는 actions.ts의 parseDocument 참고
const DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "본문" }] }],
});

let tmpDir: string;
let writingDir: string;

// WRITING_DIR가 모듈 로드 시점에 process.cwd()로 굳어지므로,
// cwd를 먼저 갈아끼운 뒤 모듈을 새로 불러와야 임시 디렉터리를 보게 된다
const loadActions = async () => {
  vi.resetModules();
  return import("./actions");
};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "editor-actions-"));
  writingDir = path.join(tmpDir, "content", "writing");
  fs.mkdirSync(writingDir, { recursive: true });

  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
  vi.stubEnv("NODE_ENV", "development");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("savePost", () => {
  it("content/writing 아래에 mdx로 저장한다", async () => {
    const { savePost } = await loadActions();

    await savePost({ slug: "my-post", metadata: METADATA, doc: DOC });

    const written = fs.readFileSync(
      path.join(writingDir, "my-post.mdx"),
      "utf8",
    );
    expect(written).toContain('"title": "제목"');
    expect(written).toContain("본문");
  });

  it("저장한 글을 그대로 다시 읽어온다", async () => {
    const { savePost, readPost } = await loadActions();

    await savePost({ slug: "round-trip", metadata: METADATA, doc: DOC });
    const reopened = await readPost("round-trip");

    expect(reopened.metadata).toEqual(METADATA);
    // readPost는 문자열이 아니라 문서 객체를 돌려준다 — 저장 방향만 문자열이다
    expect(reopened.doc).toEqual(JSON.parse(DOC));
  });

  it.each(["../evil", "a/b", "/etc/passwd", "..", ".hidden", "", "Upper"])(
    "경로를 벗어나는 slug를 거부한다: %s",
    async (slug) => {
      const { savePost } = await loadActions();

      await expect(
        savePost({ slug, metadata: METADATA, doc: DOC }),
      ).rejects.toThrow();
    },
  );

  it("거부된 slug는 어떤 파일도 남기지 않는다", async () => {
    const { savePost } = await loadActions();

    await expect(
      savePost({ slug: "../escaped", metadata: METADATA, doc: DOC }),
    ).rejects.toThrow();

    expect(fs.readdirSync(writingDir)).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, "content", "escaped.mdx"))).toBe(
      false,
    );
  });

  it("overwrite 를 켜지 않으면 기존 글을 덮어쓰지 않는다", async () => {
    const { savePost } = await loadActions();

    await savePost({ slug: "keep-me", metadata: METADATA, doc: DOC });
    const original = fs.readFileSync(
      path.join(writingDir, "keep-me.mdx"),
      "utf8",
    );

    await expect(
      savePost({
        slug: "keep-me",
        metadata: { ...METADATA, title: "덮어쓰기" },
        doc: DOC,
      }),
    ).rejects.toThrow(/이미/);

    expect(fs.readFileSync(path.join(writingDir, "keep-me.mdx"), "utf8")).toBe(
      original,
    );
  });

  it("overwrite 를 켜면 기존 글을 고쳐 쓴다", async () => {
    const { savePost } = await loadActions();

    await savePost({ slug: "edit-me", metadata: METADATA, doc: DOC });
    await savePost({
      slug: "edit-me",
      metadata: { ...METADATA, title: "고친 제목" },
      doc: DOC,
      overwrite: true,
    });

    expect(
      fs.readFileSync(path.join(writingDir, "edit-me.mdx"), "utf8"),
    ).toContain('"title": "고친 제목"');
  });

  it.each([
    ["빈 제목", { ...METADATA, title: "  " }],
    ["빈 요약", { ...METADATA, summary: "" }],
    ["잘못된 날짜", { ...METADATA, publishedAt: "2026/09/09" }],
  ])("잘못된 메타데이터를 거부한다: %s", async (_label, metadata) => {
    const { savePost } = await loadActions();

    await expect(
      savePost({ slug: "bad-meta", metadata, doc: DOC }),
    ).rejects.toThrow();
  });

  it("Tiptap 문서가 아닌 입력을 거부한다", async () => {
    const { savePost } = await loadActions();

    await expect(
      savePost({
        slug: "bad-doc",
        metadata: METADATA,
        doc: JSON.stringify({ type: "paragraph" }),
      }),
    ).rejects.toThrow();
  });
});

describe("개발 환경 가드", () => {
  it.each(["production", "test"])(
    "NODE_ENV가 %s면 모든 액션이 거부된다",
    async (env) => {
      vi.stubEnv("NODE_ENV", env);
      const { listPosts, readPost, savePost, deletePost } = await loadActions();

      await expect(listPosts()).rejects.toThrow();
      await expect(readPost("any-post")).rejects.toThrow();
      await expect(
        savePost({ slug: "any-post", metadata: METADATA, doc: DOC }),
      ).rejects.toThrow();
      await expect(deletePost("any-post")).rejects.toThrow();
    },
  );
});

describe("listPosts", () => {
  it("발행일 내림차순으로 정렬한다", async () => {
    const { savePost, listPosts } = await loadActions();

    await savePost({
      slug: "older",
      metadata: { ...METADATA, publishedAt: "2024-01-01" },
      doc: DOC,
    });
    await savePost({
      slug: "newer",
      metadata: { ...METADATA, publishedAt: "2026-05-05" },
      doc: DOC,
    });

    expect((await listPosts()).map((p) => p.slug)).toEqual(["newer", "older"]);
  });
});

describe("readPost 무손실 판정", () => {
  const withBody = (body: string) =>
    `export const metadata = {\n  "title": "제목",\n  "publishedAt": "2026-09-09",\n  "summary": "요약"\n}\n\n${body}\n`;

  it("지원하는 구문만 쓴 글은 무손실이다", async () => {
    const { readPost } = await loadActions();
    fs.writeFileSync(
      path.join(writingDir, "plain.mdx"),
      withBody("본문 문단입니다.\n\n## 소제목\n\n- 항목"),
    );

    expect((await readPost("plain")).lossless).toBe(true);
  });

  it("코드펜스 meta 를 보존하므로 무손실이다", async () => {
    const { readPost } = await loadActions();
    fs.writeFileSync(
      path.join(writingDir, "fence-meta.mdx"),
      withBody('```bash title="cli"\necho hi\n```'),
    );

    expect((await readPost("fence-meta")).lossless).toBe(true);
  });

  it("문장 중간의 인라인 JSX 를 보존하므로 무손실이다", async () => {
    const { readPost } = await loadActions();
    fs.writeFileSync(
      path.join(writingDir, "inline-jsx.mdx"),
      withBody('문장 <span className="line-through">취소선</span> 이어짐.'),
    );

    expect((await readPost("inline-jsx")).lossless).toBe(true);
  });
});

describe("deletePost", () => {
  it("글 파일을 지운다", async () => {
    const { savePost, deletePost, listPosts } = await loadActions();

    await savePost({ slug: "goodbye", metadata: METADATA, doc: DOC });
    await deletePost("goodbye");

    expect(fs.existsSync(path.join(writingDir, "goodbye.mdx"))).toBe(false);
    expect(await listPosts()).toEqual([]);
  });

  it("다른 글은 건드리지 않는다", async () => {
    const { savePost, deletePost, listPosts } = await loadActions();

    await savePost({ slug: "keep", metadata: METADATA, doc: DOC });
    await savePost({ slug: "drop", metadata: METADATA, doc: DOC });
    await deletePost("drop");

    expect((await listPosts()).map((post) => post.slug)).toEqual(["keep"]);
  });

  it("없는 글을 지우려 하면 실패한다", async () => {
    const { deletePost } = await loadActions();

    // 조용히 성공하면 슬러그를 잘못 눌러도 알 수 없다
    await expect(deletePost("never-existed")).rejects.toThrow();
  });

  it.each(["../evil", "a/b", "/etc/passwd", "..", ".hidden", "", "Upper"])(
    "경로를 벗어나는 slug를 거부한다: %s",
    async (slug) => {
      const { deletePost } = await loadActions();

      await expect(deletePost(slug)).rejects.toThrow();
    },
  );

  it("업로드한 이미지는 남긴다", async () => {
    const { savePost, deletePost } = await loadActions();
    const imageDir = path.join(tmpDir, "public", "images", "with-image");
    fs.mkdirSync(imageDir, { recursive: true });
    fs.writeFileSync(path.join(imageDir, "shot.png"), "png");

    await savePost({ slug: "with-image", metadata: METADATA, doc: DOC });
    await deletePost("with-image");

    // 다른 글이 같은 파일을 참조할 수 있다. 글 하나 지우자고 지우지 않는다
    expect(fs.existsSync(path.join(imageDir, "shot.png"))).toBe(true);
  });
});
