import { getAllWritings } from "@/lib/utils";
import type { MetadataRoute } from "next";

export const baseURL = "https://www.yujiseok.blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const writings = getAllWritings().map((writing) => ({
    url: `${baseURL}/writing/${writing.slug}`,
    lastModified: writing.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const routes = [
    {
      url: baseURL,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseURL}/writing`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  return [...routes, ...writings];
}
