import { getAllWritings, getAllAtelier } from "@/lib/content/repository";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allWritings, allAtelier] = await Promise.all([
    getAllWritings(),
    getAllAtelier(),
  ]);

  const writings = allWritings.map((writing) => ({
    url: `${SITE_URL}/posts/${writing.slug}`,
    lastModified: writing.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const ateliers = allAtelier.map((item) => ({
    url: `${SITE_URL}/atelier/${item.slug}`,
    lastModified: item.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // 렌더 중 new Date()를 쓰면 cacheComponents가 이 라우트를 dynamic으로 만든다.
  // 목록 페이지는 최신 콘텐츠 날짜를, 나머지는 lastModified를 생략한다.
  const latestWriting = allWritings[0]?.metadata.publishedAt;
  const latestAtelier = allAtelier[0]?.metadata.publishedAt;

  const routes = [
    {
      url: SITE_URL,
      lastModified: latestWriting,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: latestWriting,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/atelier`,
      lastModified: latestAtelier,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/resume`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/gallery`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/music`,
      changeFrequency: "daily" as const,
      priority: 0.5,
    },
  ];

  return [...routes, ...writings, ...ateliers];
}
