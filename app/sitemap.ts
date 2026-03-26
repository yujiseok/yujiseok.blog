import { getAllWritings, getAllAtelier } from "@/lib/utils";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export const baseURL = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const writings = getAllWritings().map((writing) => ({
    url: `${baseURL}/writing/${writing.slug}`,
    lastModified: writing.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const ateliers = getAllAtelier().map((item) => ({
    url: `${baseURL}/atelier/${item.slug}`,
    lastModified: item.metadata.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
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
    {
      url: `${baseURL}/atelier`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseURL}/resume`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseURL}/music`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "daily" as const,
      priority: 0.5,
    },
  ];

  return [...routes, ...writings, ...ateliers];
}
