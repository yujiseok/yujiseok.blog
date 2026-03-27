import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  serverExternalPackages: ["shiki", "shiki/wasm", "rehype-pretty-code"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "image-cdn-fa.spotifycdn.com",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
      },
      {
        protocol: "https",
        hostname: "image-cdn-ak.spotifycdn.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  redirects: async () => [
    {
      source: "/post",
      destination: "/writing",
      permanent: true,
    },
    {
      source: "/post/:slug",
      destination: "/writing/:slug",
      permanent: true,
    },
  ],
  cacheComponents: true,
  experimental: {
    typedEnv: true,
    viewTransition: true,
  },
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      ["rehype-pretty-code", { theme: "poimandres" }],
    ],
  },
});

export default withMDX(nextConfig);
