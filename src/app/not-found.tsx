import type { Metadata } from "next";

import { NotFoundView } from "@/components/sections/not-found-view";
import { createPageMetadata } from "@/lib/seo";

export const runtime = "edge";

export const metadata: Metadata = createPageMetadata({
  title: "Page introuvable",
  description: "La page demandée est introuvable. Revenez à l'accueil de BeFood ou contactez l'aide.",
  path: "/not-found",
  noIndex: true,
});

export default function NotFound() {
  return <NotFoundView />;
}
