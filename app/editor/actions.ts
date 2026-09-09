"use server";

import fs from "node:fs/promises";
import path from "node:path";

import type { JSONContent } from "@tiptap/core";
import { revalidatePath } from "next/cache";

import {
  isValidSlug,
  parsePost,
  serializePost,
  type PostDocument,
  type PostMetadata,
} from "@/lib/editor/document";
import { docToMarkdown, openForEditing } from "@/lib/editor/markdown";

const WRITING_DIR = path.join(process.cwd(), "content", "writing");

/**
 * 이 파일의 모든 액션은 로컬 글쓰기 도구 전용이다. Server Action은 독립된
 * 공개 엔드포인트라 페이지의 dev 가드만 믿을 수 없다 — 프로덕션에 노출되면
 * 임의 파일 쓰기로 이어지므로 액션마다 같은 가드를 다시 건다.
 */
function assertDevOnly() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("에디터는 개발 환경에서만 사용할 수 있습니다.");
  }
}

/**
 * slug로부터 content/writing 하위의 안전한 절대경로를 만든다. isValidSlug
 * 통과만으로 끝내지 않고, resolve된 최종 경로가 실제로 WRITING_DIR
 * 바로 아래인지 다시 검사해 경로 조작으로 밖으로 빠져나갈 여지를 막는다.
 */
function resolvePostPath(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error(`잘못된 slug 입니다: ${slug}`);
  }

  const filePath = path.resolve(WRITING_DIR, `${slug}.mdx`);
  if (path.dirname(filePath) !== WRITING_DIR) {
    throw new Error("허용되지 않은 경로입니다.");
  }

  return filePath;
}

function assertValidMetadata(metadata: PostMetadata) {
  if (!metadata.title.trim()) {
    throw new Error("제목을 입력하세요.");
  }
  if (!metadata.summary.trim()) {
    throw new Error("요약을 입력하세요.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.publishedAt)) {
    throw new Error("발행일은 YYYY-MM-DD 형식이어야 합니다.");
  }
}

/**
 * doc은 객체가 아니라 JSON 문자열로 받는다. ProseMirror의 node.attrs는
 * Object.create(null)로 만들어지고 toJSON()이 그 객체를 참조 그대로
 * 내보내는데, React Flight는 프로토타입이 Object.prototype이 아닌 객체를
 * "단순 객체"로 보지 않아 Server Action 인자로 넘길 때 임시 참조로 바꾼다.
 * 그러면 서버에서 attrs.language를 읽는 순간
 * "Cannot access language on the server"로 죽는다. 문자열로 받으면 그 경계를
 * 아예 만들지 않고, 타입이 string이라 호출부가 실수로 되돌릴 수도 없다.
 *
 * 클라이언트에서 넘어오는 값은 신뢰 경계 밖의 입력이기도 하다. 최소한 Tiptap
 * 문서의 형태는 갖췄는지 확인하고 아니면 즉시 던진다.
 */
function parseDocument(json: string): JSONContent {
  // 타입은 string이지만 실제로 넘어오는 값은 신뢰 경계 밖이다. 특히 dev에서
  // 서버만 HMR되고 브라우저에 옛 번들이 남아 있으면 객체가 그대로 날아온다.
  // 그때 "형식이 올바르지 않습니다"만 던지면 원인을 알 수 없어 타입을 밝힌다.
  if (typeof json !== "string") {
    throw new Error(
      `문서를 JSON 문자열로 보내야 합니다(받은 타입: ${typeof json}). 브라우저를 새로고침하세요.`,
    );
  }

  const doc: unknown = (() => {
    try {
      return JSON.parse(json);
    } catch {
      throw new Error(
        `문서 JSON을 읽지 못했습니다. 앞부분: ${json.slice(0, 40)}`,
      );
    }
  })();

  if (
    !doc ||
    typeof doc !== "object" ||
    (doc as { type?: unknown }).type !== "doc"
  ) {
    throw new Error("문서 형식이 올바르지 않습니다.");
  }

  return doc as JSONContent;
}

export interface PostListItem {
  slug: string;
  metadata: PostMetadata;
}

export async function listPosts(): Promise<PostListItem[]> {
  assertDevOnly();

  const files = await fs.readdir(WRITING_DIR);

  const posts = await Promise.all(
    files
      .filter((file) => path.extname(file) === ".mdx")
      .map(async (file) => {
        const slug = path.basename(file, ".mdx");
        const source = await fs.readFile(path.join(WRITING_DIR, file), "utf8");
        const { metadata } = parsePost(source);
        return { slug, metadata };
      }),
  );

  return posts.sort((a, b) =>
    a.metadata.publishedAt < b.metadata.publishedAt ? 1 : -1,
  );
}

export interface ReadPostResult {
  metadata: PostMetadata;
  doc: JSONContent;
  /** 에디터를 거쳐도 본문이 그대로 복원되는지. false면 저장이 원문을 훼손한다 */
  lossless: boolean;
}

export async function readPost(slug: string): Promise<ReadPostResult> {
  assertDevOnly();

  const filePath = resolvePostPath(slug);
  const source = await fs.readFile(filePath, "utf8");
  const { metadata, body } = parsePost(source);

  // 왕복 안전 판정은 markdown 모듈이 자기 계약으로 들고 있다
  return { metadata, ...openForEditing(body) };
}

export interface SavePostInput {
  slug: string;
  metadata: PostMetadata;
  /** Tiptap 문서를 JSON.stringify한 것. 문자열인 이유는 parseDocument 참고 */
  doc: string;
  /**
   * 이미 있는 글을 고쳐 쓸 때만 켠다. 기본값이 "덮어쓰지 않음"인 게 핵심이다 —
   * 호출부가 이 값을 빠뜨리면 글이 조용히 사라지는 대신 저장이 눈에 띄게 실패한다.
   */
  overwrite?: boolean;
}

const exists = (filePath: string) =>
  fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);

export async function savePost(input: SavePostInput): Promise<{ ok: true }> {
  assertDevOnly();

  const filePath = resolvePostPath(input.slug);
  assertValidMetadata(input.metadata);
  const doc = parseDocument(input.doc);

  if (!input.overwrite && (await exists(filePath))) {
    throw new Error(`이미 있는 슬러그입니다: ${input.slug}`);
  }

  const document: PostDocument = {
    metadata: input.metadata,
    body: docToMarkdown(doc),
  };

  await fs.writeFile(filePath, serializePost(document), "utf8");

  // getAllWritings/getAllContent가 "use cache"로 캐싱돼 있어 재검증 없이는
  // 새 글이 홈·목록·상세 어디에도 반영되지 않는다.
  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath(`/writing/${input.slug}`);

  return { ok: true };
}

export async function deletePost(slug: string): Promise<{ ok: true }> {
  assertDevOnly();

  const filePath = resolvePostPath(slug);

  if (!(await exists(filePath))) {
    throw new Error(`없는 글입니다: ${slug}`);
  }

  // public/images/<slug>/ 는 남긴다. 글 하나 지우자고 다른 글이 참조할 수도
  // 있는 파일까지 건드리지 않는다 — 필요하면 직접 지우는 게 안전하다.
  await fs.unlink(filePath);

  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath(`/writing/${slug}`);

  return { ok: true };
}
