import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pour les créateurs nutrition et bien-être",
  description:
    "Comment les créateurs peuvent collaborer avec BeFood pour proposer des repères utiles et encourager des habitudes durables.",
  path: "/pour-les-createurs",
  keywords: [
    "créateur nutrition",
    "partenariat bien-être",
    "communauté alimentation",
    "créateur BeFood",
  ],
});

const creatorUseCases = [
  {
    title: "Créer des contenus pédagogiques activables",
    description: "Transformer des conseils nutrition en actions simples, appliquées au repas réel.",
  },
  {
    title: "Renforcer l'engagement communautaire",
    description: "Structurer une dynamique positive autour du partage de repas et de la progression.",
  },
  {
    title: "Collaborer avec une approche non restrictive",
    description: "Promouvoir la compréhension et les habitudes durables, sans promesse médicale.",
  },
];

export default function CreatorsPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Segment créateurs</p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
              Pour les créateurs qui veulent aider à mieux manger, concrètement
            </h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              BeFood peut soutenir des collaborations utiles entre produit, communauté et contenus pédagogiques.
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-3">
            {creatorUseCases.map((item) => (
              <Card key={item.title} className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">{item.title}</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              </Card>
            ))}
          </div>

          <p className="text-sm text-[var(--color-muted)]">
            Vous êtes aussi coach ou professionnel ?{" "}
            <Link href="/pour-les-coachs" className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
              Voir la page dédiée
            </Link>
            .
          </p>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Pour les créateurs", path: "/pour-les-createurs" },
        ])}
      />
    </>
  );
}
