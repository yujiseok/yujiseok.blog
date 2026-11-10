import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  images: {
    // public/ 이미지는 Vercel이 max-age=0으로 내보내 기본값(4시간)마다 다시 변환된다.
    // 파일은 배포 사이에 바뀌지 않으므로 길게 둬서 Image Optimization 사용량을 줄인다.
    minimumCacheTTL: 2678400, // 31일
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
  // 글 경로가 세 번 바뀌었다: /post → /writing → /posts → /ko/posts. 옛 경로는
  // 체인으로 넘기지 않고 전부 현재 경로로 직결시킨다 — 리다이렉트가 이어지면
  // 그만큼 왕복이 늘고 검색엔진도 마지막 목적지를 늦게 인식한다.
  // 접두사 없는 옛 주소는 언어를 고르지 않고 ko로 보낸다(proxy보다 먼저 걸린다).
  // 글 본문 안의 옛 링크(/post/x)는 CustomLink가 접두사를 붙여 /ko/post/x가 되므로
  // 접두사 있는 형태도 받는다. :path*라야 하위 경로(opengraph-image)도 따라온다.
  redirects: async () => [
    ...["/post", "/writing"].flatMap((legacy) => [
      { source: legacy, destination: "/ko/posts", permanent: true },
      {
        source: `${legacy}/:path*`,
        destination: "/ko/posts/:path*",
        permanent: true,
      },
    ]),
    {
      source: "/:locale(ko|en)/:legacy(post|writing)",
      destination: "/:locale/posts",
      permanent: true,
    },
    {
      source: "/:locale(ko|en)/:legacy(post|writing)/:path*",
      destination: "/:locale/posts/:path*",
      permanent: true,
    },
  ],
  // 에이전트용 마크다운 원문. 글 페이지 [slug]가 "x.md"를 slug로 받아 404를
  // 내기 전에 route handler로 돌린다. 접두사 없는 옛 주소는 한국어 원문이다
  // (이미 llms.txt에 실려 나간 주소).
  rewrites: async () => ({
    beforeFiles: [
      { source: "/posts/:slug.md", destination: "/md/ko/posts/:slug" },
      {
        source: "/:locale(ko|en)/posts/:slug.md",
        destination: "/md/:locale/posts/:slug",
      },
    ],
  }),
  cacheComponents: true,
  // 링크는 경로당 App Shell만 미리 받는다. false는 Cache Components를
  // Partial Prefetching 이전에 켠 앱이 옛 prefetch를 유지할 때만 쓴다.
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    // 루트 레이아웃이 둘(app/[locale], app/editor)이라 하나로 404를 조립할 수 없다.
    // 접두사 밖의 못 찾는 주소는 app/global-not-found.tsx가 받는다.
    globalNotFound: true,
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
          // 라벨을 두지 않는다. 컴파일 시점에 고정되는 값이라 언어를 따라갈 수 없고,
          // 제목이 이미 앵커의 맥락이라 보조기기에는 숨긴다(링크는 목차가 대신한다).
          properties: {
            className: ["heading-anchor"],
            ariaHidden: true,
            tabIndex: -1,
          },
          content: { type: "text", value: "#" },
        },
      ],
      ["rehype-pretty-code", { theme: "poimandres" }],
    ],
  },
});

export default withMDX(nextConfig);
