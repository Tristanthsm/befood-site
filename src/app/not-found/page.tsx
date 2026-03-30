import type { Metadata } from "next";

import { NotFoundView } from "@/components/sections/not-found-view";
import { createPageMetadata } from "@/lib/seo";

export const runtime = "edge";

export const metadata: Metadata = createPageMetadata({
  title: "Page introuvable",
  description: "Page dédiée d'information 404 pour BeFood.",
  path: "/not-found",
  noIndex: true,
});

export default function NotFoundPage() {
  return <NotFoundView />;
}
