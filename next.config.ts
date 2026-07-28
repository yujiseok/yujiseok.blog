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
    rehypePlugins: [["rehype-pretty-code", { theme: "poimandres" }]],
  },
});

export default withMDX(nextConfig);
