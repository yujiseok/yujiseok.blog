import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
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
  experimental: {
    typedEnv: true,
    viewTransition: true,
  },
};

export default nextConfig;
