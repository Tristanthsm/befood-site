import type { MetadataRoute } from "next";

import { siteConfig, staticRoutes } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticRoutes.map((path) => ({
    url: new URL(path, siteConfig.siteUrl).toString(),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/support" || path === "/pour-les-coachs" ? 0.8 : 0.6,
  }));
}
