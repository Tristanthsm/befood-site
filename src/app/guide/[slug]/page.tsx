import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { GuidePillarTemplate } from "@/components/templates/guide-pillar-template";
import { guidePages, guidePagesBySlug } from "@/content/fr/guides";
import { createPageMetadata, getArticleJsonLd, getBreadcrumbJsonLd } from "@/lib/seo";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guidePages.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guidePagesBySlug[slug];

  if (!guide) {
    return createPageMetadata({
      title: "Guide introuvable",
      description: "Le guide demandé est introuvable.",
      path: `/guide/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${guide.title}`,
    description: guide.description,
    path: `/guide/${guide.slug}`,
    keywords: [
      "analyse repas photo",
      "comprendre son alimentation",
      "habitudes alimentaires",
      "guide BeFood",
    ],
  });
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = guidePagesBySlug[slug];

  if (!guide) {
    notFound();
  }

  const path = `/guide/${guide.slug}`;

  return (
    <>
      <GuidePillarTemplate guide={guide} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path },
        ])}
      />
      <JsonLd
        data={getArticleJsonLd({
          title: guide.title,
          description: guide.description,
          path,
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
        })}
      />
    </>
  );
}
