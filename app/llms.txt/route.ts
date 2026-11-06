import { getAllWritings, getAllAtelier } from "@/lib/content/repository";
import { SITE_URL } from "@/lib/constants";
import { getGallery } from "@/lib/gallery";

const describe = (summary?: string) => (summary ? `: ${summary}` : "");

export async function GET() {
  const [writings, ateliers, gallery] = await Promise.all([
    getAllWritings(),
    getAllAtelier(),
    getGallery(),
  ]);

  const writingList = writings
    .map(
      (post) =>
        // llms.txt 관례대로 HTML 대신 마크다운 원문을 가리킨다
        `- [${post.metadata.title}](${SITE_URL}/posts/${post.slug}.md)${describe(post.metadata.summary)}`,
    )
    .join("\n");

  const atelierList = ateliers
    .map(
      (item) =>
        `- [${item.metadata.title}](${SITE_URL}/atelier/${item.slug})${describe(item.metadata.summary)}`,
    )
    .join("\n");

  // 이미지 자체는 LLM에게 줄 게 없다. 어떤 작가를 몇 점 모아 뒀는지만 알린다.
  const galleryList = [...new Set(gallery.map(({ artist }) => artist.name))]
    .map((name) => ({
      name,
      count: gallery.filter(({ artist }) => artist.name === name).length,
    }))
    .sort((a, b) => b.count - a.count)
    .map(({ name, count }) => `- ${name}: ${count}점`)
    .join("\n");

  const llmsTxt = `# Yujiseok's Blog

> 공부하는 것을 기록하고 공유하는 유지석의 개인 기술 블로그. 프론트엔드 개발, React, Next.js, TypeScript 등 웹 개발 기술을 다룹니다.

이 블로그는 프론트엔드 개발자 유지석이 운영하는 기술 블로그입니다. 주로 React, Next.js, TypeScript, 웹 성능 최적화 등의 주제를 다룹니다.

## Writing

${writingList}

## Atelier

${atelierList}

## Gallery

모아 둔 그림. ${SITE_URL}/gallery

${galleryList}

## Links

- [Full text of all posts](${SITE_URL}/llms-full.txt)
- [RSS Feed](${SITE_URL}/rss.xml)
- [GitHub](https://github.com/yujiseok)
- [Resume](${SITE_URL}/resume)
`;

  return new Response(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // cacheComponents 아래에서 라우트 핸들러는 동적이라 매 요청 재생성된다.
      // LLM 크롤러가 자주 폴링하므로 CDN 캐시로 그 빈도를 흡수한다.
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
