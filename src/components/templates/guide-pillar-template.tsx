import { guidePagesBySlug, type GuidePage } from "@/content/fr/guides";

import { ArticleTemplate } from "@/components/templates/article-template";

interface GuidePillarTemplateProps {
  guide: GuidePage;
}

export function GuidePillarTemplate({ guide }: GuidePillarTemplateProps) {
  const relatedLinks = guide.relatedSlugs
    .map((slug) => {
      const relatedGuide = guidePagesBySlug[slug];
      if (!relatedGuide) {
        return null;
      }

      return {
        href: `/guide/${relatedGuide.slug}`,
        label: relatedGuide.title,
        description: relatedGuide.description,
      };
    })
    .filter(Boolean) as Array<{ href: string; label: string; description: string }>;

  return (
    <ArticleTemplate
      eyebrow="Guide pilier BeFood"
      title={guide.title}
      description={guide.description}
      intro={guide.intro}
      intent={guide.intent}
      updatedAt={new Date(guide.updatedAt).toLocaleDateString("fr-FR")}
      breadcrumbs={[
        { name: "Accueil", path: "/" },
        { name: "Guides", path: "/guides" },
        { name: guide.title, path: `/guide/${guide.slug}` },
      ]}
      sections={guide.sections}
      relatedLinks={relatedLinks}
      cta={{
        title: "Passez de la lecture à l'action",
        description:
          "Téléchargez BeFood pour analyser vos repas en photo, clarifier vos repères et suivre des habitudes plus durables.",
        label: "Découvrir l'application",
        href: "/app",
      }}
    />
  );
}
