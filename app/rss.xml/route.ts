import { baseURL } from "../sitemap";
import { getAllWritings } from "@/lib/utils";

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export async function GET() {
  const posts = getAllWritings();

  const XML = posts
    .map(
      (post) =>
        `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${baseURL}/writing/${post.slug}</link>
          <guid isPermaLink="true">${baseURL}/writing/${post.slug}</guid>
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

  const headers = new Headers({ "content-type": "application/xml" });

  return new Response(RSS, { headers });
}

