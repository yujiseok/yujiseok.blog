import { allPosts } from "contentlayer/generated";

export default async function sitemap() {
  const posts = allPosts.map((post) => ({
    url: `https://www.yujiseok.blog/post/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  const routes = ["", "/post", "/about"].map((route) => ({
    url: `https://www.yujiseok.blog${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...posts];
}
