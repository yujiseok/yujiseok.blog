import { SITE_URL as baseURL } from "@/lib/constants";
import { getAllWritings } from "@/lib/content/repository";

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export async function GET() {
  const posts = await getAllWritings();

  const XML = posts
    .map(
      (post) =>
        `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${baseURL}/posts/${post.slug}</link>
          <!--
            guid는 URL일 필요가 없고 안정적인 고유 문자열이기만 하면 된다.
            /writing → /posts로 옮기면서 이 값을 같이 바꾸면 구독자 리더가
            기존 글 전부를 새 글로 다시 띄운다. 옛 경로를 그대로 박아 둔다.
            301 리다이렉트로는 막을 수 없다 — 리더는 guid로 식별한다.
          -->
          <guid isPermaLink="false">${baseURL}/writing/${post.slug}</guid>
          <description>${escapeXml(post.metadata.summary)}</description>
          <author>yujiseok</author>
          <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
        </item>`,
    )
    .join("\n");

  const RSS = `<?xml version="1.0" encoding="UTF-8" ?>
   <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Yujiseok's Blog</title>
        <link>${baseURL}</link>
        <description>공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그</description>
        <language>ko</language>
        <atom:link href="${baseURL}/rss.xml" rel="self" type="application/rss+xml"/>
        ${XML}
      </channel>
    </rss>`;

  // cacheComponents 아래에서 라우트 핸들러는 동적이라 매 요청 재생성된다.
  // 피드 리더는 자주 폴링하므로 CDN 캐시로 그 빈도를 흡수한다.
  const headers = new Headers({
    "content-type": "application/xml",
    "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
  });

  return new Response(RSS, { headers });
}
