import type { MetadataRoute } from "next";

import { indexableStaticRoutes, siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableStaticRoutes.map((route) => ({
    url: new URL(route.path, siteConfig.siteUrl).toString(),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
