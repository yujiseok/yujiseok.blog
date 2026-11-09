import type { MetadataRoute } from "next";

import { getAllAtelier, getAllWritings } from "@/lib/content/repository";
import { buildSitemap } from "@/lib/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ko, en, atelier] = await Promise.all([
    getAllWritings("ko"),
    getAllWritings("en"),
    getAllAtelier(),
  ]);

  return buildSitemap({ ko, en, atelier });
}
