import type { MetadataRoute } from "next";

import { getAllWritings } from "@/lib/content/repository";
import { buildSitemap } from "@/lib/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ko, en] = await Promise.all([
    getAllWritings("ko"),
    getAllWritings("en"),
  ]);

  return buildSitemap({ ko, en });
}
