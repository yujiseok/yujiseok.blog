import { getAllAtelier, getAllWritings } from "@/lib/content/repository";
import { getGallery } from "@/lib/gallery";
import { buildLlmsTxt } from "@/lib/seo/llms";

export async function GET() {
  const [ko, en, atelier, gallery] = await Promise.all([
    getAllWritings("ko"),
    getAllWritings("en"),
    getAllAtelier(),
    getGallery(),
  ]);

  const artists = [...new Set(gallery.map(({ artist }) => artist.name))]
    .map((name) => ({
      name,
      count: gallery.filter(({ artist }) => artist.name === name).length,
    }))
    .sort((a, b) => b.count - a.count);

  return new Response(buildLlmsTxt({ ko, en, atelier, gallery: artists }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // cacheComponents 아래에서 라우트 핸들러는 동적이라 매 요청 재생성된다.
      // LLM 크롤러가 자주 폴링하므로 CDN 캐시로 그 빈도를 흡수한다.
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
