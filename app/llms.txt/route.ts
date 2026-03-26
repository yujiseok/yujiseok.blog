import { getAllWritings, getAllAtelier } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

export async function GET() {
  const writings = getAllWritings();
  const ateliers = getAllAtelier();

  const writingList = writings
    .map(
      (post) =>
        `- [${post.metadata.title}](${SITE_URL}/writing/${post.slug}): ${post.metadata.summary}`,
    )
    .join("\n");

  const atelierList = ateliers
    .map(
      (item) =>
        `- [${item.metadata.title}](${SITE_URL}/atelier/${item.slug}): ${item.metadata.summary}`,
    )
    .join("\n");

  const llmsTxt = `# Yujiseok's Blog

> 공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그. 프론트엔드 개발, React, Next.js, TypeScript 등 웹 개발 기술을 다룹니다.

이 블로그는 프론트엔드 개발자 유지석이 운영하는 기술 블로그입니다. 주로 React, Next.js, TypeScript, 웹 성능 최적화 등의 주제를 다룹니다.

## Writing

${writingList}

## Atelier

${atelierList}

## Links

- [RSS Feed](${SITE_URL}/rss.xml)
- [GitHub](https://github.com/yujiseok)
- [Resume](${SITE_URL}/resume)
`;

  return new Response(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
