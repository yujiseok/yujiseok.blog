import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.scdn.co",
      },
      {
        protocol: "https",
        hostname: "*.spotifycdn.com",
      },
    ],
  },
  // 글 경로가 두 번 바뀌었다: /post → /writing → /posts. 옛 경로는 체인으로
  // 넘기지 않고 전부 현재 경로로 직결시킨다 — 리다이렉트가 이어지면 그만큼
  // 왕복이 늘고 검색엔진도 마지막 목적지를 늦게 인식한다.
  redirects: async () =>
    ["/post", "/writing"].flatMap((legacy) => [
      { source: legacy, destination: "/posts", permanent: true },
      {
        // :path*라야 /writing/<slug>/opengraph-image 같은 하위 경로도 따라온다
        source: `${legacy}/:path*`,
        destination: "/posts/:path*",
        permanent: true,
      },
    ]),
  cacheComponents: true,
  experimental: {
    typedEnv: true,
  },
};

const withMDX = createMDX({
  options: {
    // 에디터가 표를 GFM 파이프 문법으로 저장하는데, 기본 MDX는 GFM을 몰라
    // 표가 "| a | b |" 글자 그대로 렌더됐다. remark-gfm이 표·취소선·자동
    // 링크를 열어 준다. Turbopack이라 패키지명 문자열로만 등록할 수 있다.
    remarkPlugins: [["remark-gfm"]],
    // Turbopack은 플러그인을 문자열(패키지명)로만 받는다 — 로컬 함수는 못 넘긴다.
    // rehype-slug가 heading에 id를 박아야 목차 링크가 도달할 곳이 생긴다.
    // rehype-pretty-code는 코드블록만 만지므로 순서 충돌이 없다.
    rehypePlugins: [
      ["rehype-slug"],
      ["rehype-pretty-code", { theme: "poimandres" }],
    ],
  },
});

export default withMDX(nextConfig);
