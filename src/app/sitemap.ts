import type { MetadataRoute } from "next";

import { guidePages } from "@/content/fr/guides";
import { indexableStaticRoutes, siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = indexableStaticRoutes.map((route) => ({
    url: new URL(route.path, siteConfig.siteUrl).toString(),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const guideEntries: MetadataRoute.Sitemap = guidePages.map((guide) => ({
    url: new URL(`/guide/${guide.slug}`, siteConfig.siteUrl).toString(),
    lastModified: guide.updatedAt,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticEntries, ...guideEntries];
}
