import { getAllWritings, getAllAtelier } from "@/lib/utils";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const baseURL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allWritings, allAtelier] = await Promise.all([
    getAllWritings(),
    getAllAtelier(),
  ]);

  const writings = allWritings.map((writing) => ({
    url: `${baseURL}/writing/${writing.slug}`,
    lastModified: writing.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const ateliers = allAtelier.map((item) => ({
    url: `${baseURL}/atelier/${item.slug}`,
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
      url: baseURL,
      lastModified: latestWriting,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseURL}/writing`,
      lastModified: latestWriting,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseURL}/atelier`,
      lastModified: latestAtelier,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseURL}/resume`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseURL}/music`,
      changeFrequency: "daily" as const,
      priority: 0.5,
    },
  ];

  return [...routes, ...writings, ...ateliers];
}
