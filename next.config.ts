import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  images: {
    // Next 16부터 images.qualities에 적어 둔 값만 허용된다(기본 [75]). 갤러리는
    // 그림이라 90, 확대 뷰어는 95, atelier는 100을 쓰는데 그 값이 없으면
    // 최적화 요청이 400 - "q" parameter (quality) of 90 is not allowed - 로
    // 떨어진다. 이미지 수만큼 콘솔이 같은 에러로 덮인다.
    qualities: [75, 90, 95, 100],
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
  reactCompiler: true,
  experimental: {
    typedEnv: true,
    agentUpgrade: "latest",
    // Babel을 거치지 않고 Turbopack 안에서 컴파일러를 돌린다
    turbopackRustReactCompiler: true,
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
      // rehype-slug 다음, rehype-pretty-code 이전 — 코드블록엔 heading이 없어
      // 순서 충돌은 없고, id가 이미 박힌 heading에만 앵커를 붙이면 된다.
      // Turbopack이 옵션을 문자열로 직렬화하므로 함수(behavior 콜백 등)는 못 쓴다.
      [
        "rehype-autolink-headings",
        {
          behavior: "append",
          properties: {
            className: ["heading-anchor"],
            ariaLabel: "이 섹션 링크",
          },
          content: { type: "text", value: "#" },
        },
      ],
      ["rehype-pretty-code", { theme: "poimandres" }],
    ],
  },
});

export default withMDX(nextConfig);
