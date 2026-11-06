import { getAllWritings, getWritingMarkdown } from "@/lib/content/repository";

// llms.txt 는 목차, 이쪽은 전 글 본문. 에이전트가 블로그를 한 번에 읽어 갈 때 쓴다.
export async function GET() {
  const writings = await getAllWritings();
  const posts = await Promise.all(
    writings.map(({ slug }) => getWritingMarkdown(slug)),
  );

  const body = `# Yujiseok's Blog — Full Text

> 프론트엔드 개발자 유지석의 기술 블로그 전 글 원문. 최신 글이 먼저 온다.

${posts.filter(Boolean).join("\n---\n\n")}`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
