import { getAllPosts } from "@/lib/utils";
import type { MetadataRoute } from "next";

export const baseURL = "https://www.yujiseok.blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `https://www.yujiseok.blog/post/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ["", "/post", "/about"].map((route) => ({
    url: `https://www.yujiseok.blog${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...posts];
}
