import { getAllWritings, getWritingMarkdown } from "@/lib/content/repository";
import type { Locale } from "@/lib/i18n/locales";

import { buildLlmsFull, buildLlmsTxt } from "./llms";
import { buildRss } from "./rss";

// cacheComponents 아래에서 라우트 핸들러는 동적이라 매 요청 재생성된다.
// 피드 리더·LLM 크롤러는 자주 폴링하므로 CDN 캐시로 그 빈도를 흡수한다.
export const CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";

export const rssResponse = async (locale: Locale) =>
  new Response(buildRss(locale, await getAllWritings(locale)), {
    headers: {
      "content-type": "application/xml",
      "cache-control": CACHE_CONTROL,
    },
  });

export const llmsResponse = async () => {
  const [ko, en] = await Promise.all([
    getAllWritings("ko"),
    getAllWritings("en"),
  ]);

  return new Response(buildLlmsTxt({ ko, en }), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": CACHE_CONTROL,
    },
  });
};

// llms.txt 는 목차, 이쪽은 전 글 본문. 에이전트가 블로그를 한 번에 읽어 갈 때 쓴다.
export const llmsFullResponse = async (locale: Locale) => {
  const writings = await getAllWritings(locale);
  const markdowns = await Promise.all(
    writings.map(({ slug }) => getWritingMarkdown(slug, locale)),
  );

  return new Response(
    buildLlmsFull(
      locale,
      markdowns.filter((markdown) => markdown !== undefined),
    ),
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": CACHE_CONTROL,
      },
    },
  );
};
