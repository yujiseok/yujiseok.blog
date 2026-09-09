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
        source: `${legacy}/:slug`,
        destination: "/posts/:slug",
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
    rehypePlugins: [["rehype-pretty-code", { theme: "poimandres" }]],
  },
});

export default withMDX(nextConfig);
