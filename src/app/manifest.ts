import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "fr-FR",
    icons: [
      {
        src: "/icon.png?v=3",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png?v=3",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
