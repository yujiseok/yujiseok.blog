import { getAllWritings } from "@/lib/content/repository";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { CACHE_CONTROL } from "@/lib/seo/responses";

export async function GET() {
  const [ko, en] = await Promise.all([
    getAllWritings("ko"),
    getAllWritings("en"),
  ]);

  return new Response(buildLlmsTxt({ ko, en }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // cacheComponents 아래에서 라우트 핸들러는 동적이라 매 요청 재생성된다.
      // LLM 크롤러가 자주 폴링하므로 CDN 캐시로 그 빈도를 흡수한다.
      "cache-control": CACHE_CONTROL,
    },
  });
}
