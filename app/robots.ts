import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.yujiseok.blog/sitemap.xml",
    host: "https://www.yujiseok.blog",
  };
}
