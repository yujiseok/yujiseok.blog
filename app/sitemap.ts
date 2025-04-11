import { getAllWritings } from "@/lib/utils";
import type { MetadataRoute } from "next";

export const baseURL = "https://www.yujiseok.blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const writings = getAllWritings().map((writing) => ({
    url: `${baseURL}/writing/${writing.slug}`,
    lastModified: writing.metadata.publishedAt,
  }));

  const routes = ["", "/writing"].map((route) => ({
    url: `${baseURL}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...writings];
}
