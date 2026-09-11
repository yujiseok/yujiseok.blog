import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import EditorClient from "./editor-client";
import { listPosts, readPost } from "./actions";
import type { LoadedPostInput } from "@/lib/editor/draft";

// 에디터는 (main) 레이아웃 밖이라 헤더도 푸터 내비도 없다. 여기 링크가 없으면
// 주소를 직접 고치는 것 말고는 나갈 길이 없다.
const EXIT_LINKS = [
  { href: "/", label: "홈" },
  { href: "/posts", label: "글 목록" },
];

// 로컬 도구라 스트리밍 껍데기를 먼저 보낼 이유가 없다. Suspense로 감싸는 대신
// 블로킹 렌더를 허용해 목록을 갖춘 완성된 화면을 한 번에 준다.
export const instant = false;

const isMissingFile = (error: unknown) =>
  (error as NodeJS.ErrnoException | null)?.code === "ENOENT";

/**
 * 글 페이지의 "수정" 버튼이 /editor?post=<slug>로 보낸다. 클라이언트에서 다시
 * 왕복하지 않도록 여기서 미리 읽어 넘긴다. 없거나 못 읽는 슬러그면 빈 화면으로
 * 연다 — 주소를 손으로 고쳤을 뿐인데 도구가 막히면 곤란하다.
 */
async function loadRequestedPost(
  slug: string | undefined,
): Promise<LoadedPostInput | null> {
  if (!slug) return null;

  try {
    const { metadata, doc, lossless } = await readPost(slug);
    return { slug, metadata, doc, lossless };
  } catch (error) {
    // 없는 슬러그를 새 글로 여는 건 정상 경로다. 반면 파일은 있는데 못 읽은
    // 것(프론트매터 깨짐 등)은 고쳐야 할 고장인데, 화면은 둘을 똑같은 빈
    // 에디터로 보여준다. 적어도 개발 서버 콘솔에서는 구별되게 남긴다.
    if (!isMissingFile(error)) {
      console.error(
        `[editor] "${slug}" 글을 읽지 못해 빈 화면으로 엽니다. content/writing/${slug}.mdx 를 확인하세요.`,
        error,
      );
    }
    return null;
  }
}

export default async function EditorPage(props: {
  searchParams: Promise<{ post?: string }>;
}) {
  // 로컬 dev 전용 글쓰기 도구다. 프로덕션 빌드에는 아예 없는 라우트로 취급한다
  // — Server Action 쪽 가드는 actions.ts에서 별도로 다시 건다.
  // cacheComponents가 켜져 있어 세그먼트 설정(dynamic = "force-dynamic")은 쓸 수
  // 없다. fs를 읽는 listPosts가 빌드 타임 프리렌더에 걸리지 않도록
  // connection()으로 요청 시점까지 미룬다.
  await connection();

  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { post } = await props.searchParams;
  const [posts, initialPost] = await Promise.all([
    listPosts(),
    loadRequestedPost(post),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-2 py-10 sm:px-4">
      <nav aria-label="사이트 이동" className="mb-6 flex items-center gap-4">
        {EXIT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-neutral-500 underline decoration-dashed underline-offset-4 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <EditorClient initialPosts={posts} initialPost={initialPost} />
    </main>
  );
}
