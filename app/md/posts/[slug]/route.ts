import { notFound } from "next/navigation";

import { getWritingMarkdown } from "@/lib/content/repository";

// /posts/<slug>.md 가 next.config.ts 의 rewrite 로 이리 들어온다. 글 페이지의
// [slug] 가 ".md" 까지 slug 로 삼키므로 경로를 따로 떼어 둔 것이다.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const markdown = await getWritingMarkdown(slug);

  if (!markdown) {
    notFound();
  }

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // llms.txt 와 같은 이유로 CDN 캐시에 맡긴다
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
