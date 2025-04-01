import { baseURL } from "../sitemap";
import { getAllWritings } from "@/lib/utils";

export async function GET() {
  const posts = getAllWritings();

  const XML = posts
    .map(
      (post) =>
        `<item>
          <title>${post.metadata.title}</title>
          <link>${baseURL}/post/${post.slug}</link>
          <description>${post.metadata.summary}</description>
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

  return new Response(RSS, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
