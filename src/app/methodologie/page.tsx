import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Méthodologie d'analyse BeFood",
  description:
    "Méthodologie BeFood: comment l'analyse photo des repas fonctionne, quelles limites garder en tête et comment interpréter les résultats.",
  path: "/methodologie",
  keywords: [
    "méthodologie analyse repas",
    "limites analyse photo nutrition",
    "interprétation repas",
    "BeFood méthode",
  ],
});

const methodologyBlocks = [
  {
    title: "Ce que fait BeFood",
    points: [
      "Analyse le contenu visible d'un repas à partir d'une photo.",
      "Fournit des repères nutritionnels compréhensibles.",
      "Propose des pistes d'ajustement concrètes pour le prochain repas.",
    ],
  },
  {
    title: "Ce que BeFood ne fait pas",
    points: [
      "N'établit pas de diagnostic médical.",
      "Ne remplace pas un suivi clinique ou diététique personnalisé.",
      "Ne garantit pas une mesure parfaite des portions ou ingrédients non visibles.",
    ],
  },
  {
    title: "Comment utiliser les retours",
    points: [
      "Lire les résultats comme des repères décisionnels, pas comme un verdict absolu.",
      "Privilégier la progression sur plusieurs semaines plutôt que la perfection quotidienne.",
      "Consulter un professionnel de santé qualifié en cas de doute médical.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Transparence produit</p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">Comment interpréter l&apos;analyse BeFood</h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              BeFood aide à comprendre l&apos;alimentation au quotidien avec une logique pédagogique. Cette page précise le périmètre,
              les limites et le bon usage des retours.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            {methodologyBlocks.map((block) => (
              <Card key={block.title} className="space-y-3 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">{block.title}</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--color-muted)]">
                  {block.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <section className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-5 sm:p-6">
            <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">Prochaine étape recommandée</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              Appliquez ces principes sur vos repas réels dans l&apos;app, puis approfondissez avec les guides.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                data-cta-track="start_free"
                data-cta-location="methodologie_page"
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                Démarrer gratuitement
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)]"
              >
                Explorer les guides
              </Link>
            </div>
          </section>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Méthodologie", path: "/methodologie" },
        ])}
      />
    </>
  );
}
