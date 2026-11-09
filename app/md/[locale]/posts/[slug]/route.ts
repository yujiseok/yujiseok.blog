import { notFound } from "next/navigation";

import { getWritingMarkdown } from "@/lib/content/repository";
import { requireLocale } from "@/lib/i18n/params";
import { CACHE_CONTROL } from "@/lib/seo/responses";

// /posts/<slug>.md(ko)와 /{ko,en}/posts/<slug>.md 가 next.config.ts 의 rewrite 로
// 이리 들어온다. 글 페이지의 [slug] 가 ".md" 까지 slug 로 삼키므로 경로를 따로
// 떼어 둔 것이다. 번역이 없는 slug 는 getWritingMarkdown 이 못 찾아 404 다.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const locale = await requireLocale(params);
  const { slug } = await params;

  const markdown = await getWritingMarkdown(slug, locale);

  if (!markdown) {
    notFound();
  }

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // llms.txt 와 같은 이유로 CDN 캐시에 맡긴다
      "cache-control": CACHE_CONTROL,
    },
  });
}
