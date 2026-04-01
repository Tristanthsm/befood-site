import { guidePagesBySlug, type GuidePage } from "@/content/fr/guides";

import { ArticleTemplate } from "@/components/templates/article-template";

interface GuidePillarTemplateProps {
  guide: GuidePage;
}

export function GuidePillarTemplate({ guide }: GuidePillarTemplateProps) {
  const guideRelatedLinks = guide.relatedSlugs
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
  const strategicLinks = [
    {
      href: "/app",
      label: "Application BeFood",
      description: "Voir comment appliquer ces repères directement dans l'app iOS.",
    },
    {
      href: "/comment-ca-marche",
      label: "Comment BeFood fonctionne",
      description: "Comprendre le parcours complet: photo, repères, guidance et progression.",
    },
    {
      href: "/methodologie",
      label: "Méthodologie BeFood",
      description: "Voir le périmètre, les limites et le bon usage des analyses.",
    },
  ];
  const relatedLinks = [...guideRelatedLinks, ...strategicLinks];

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
          "Démarrez avec BeFood pour appliquer ces repères sur vos repas réels et progresser avec un coach plus cohérent.",
        label: "Démarrer gratuitement",
        href: "/app",
      }}
    />
  );
}
