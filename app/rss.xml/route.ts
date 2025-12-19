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
          <description>${escapeXml(post.metadata.summary)}</description>
          <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
        </item>`,
    )
    .join("\n");

  const RSS = `<?xml version="1.0" encoding="UTF-8" ?>
   <rss version="2.0">
      <channel>
        <title>Yujiseok's Blog</title>
        <link>${baseURL}</link>
        <description>This is my blog RSS feed</description>
        ${XML}
      </channel>
    </rss>`;

  const headers = new Headers({ "content-type": "application/xml" });

  return new Response(RSS, { headers });
}

