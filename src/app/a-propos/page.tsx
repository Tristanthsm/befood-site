import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "À propos de BeFood",
  description:
    "Mission, positionnement et principes de BeFood pour aider à comprendre l'alimentation avec une approche pédagogique et durable.",
  path: "/a-propos",
  keywords: ["à propos BeFood", "mission nutrition", "approche bien-être", "repères alimentaires"],
});

const principles = [
  {
    title: "Comprendre avant de contraindre",
    description: "L'objectif est d'améliorer les décisions alimentaires, pas d'imposer des règles rigides.",
  },
  {
    title: "Pédagogie et guidance",
    description: "Chaque retour vise à clarifier ce qui peut être ajusté au quotidien.",
  },
  {
    title: "Progression durable",
    description: "La constance compte plus que la perfection d'une seule journée.",
  },
  {
    title: "Cadre non médical",
    description: "BeFood n'établit pas de diagnostic et ne remplace pas un professionnel de santé.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Entité BeFood</p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">Aider à mieux comprendre ce qu&apos;on mange</h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              BeFood est une application iOS orientée nutrition et bien-être, centrée sur l&apos;analyse de repas par photo,
              l&apos;interprétation des retours et l&apos;amélioration des habitudes dans la durée.
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            {principles.map((item) => (
              <Card key={item.title} className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">{item.title}</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              </Card>
            ))}
          </div>

          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 sm:p-6">
            <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">Commencer avec BeFood</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              Si l&apos;approche vous correspond, démarrez dans l&apos;app puis utilisez les guides pour aller plus loin.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                data-cta-track="start_free"
                data-cta-location="a_propos_page"
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                Démarrer gratuitement
              </Link>
              <Link
                href="/guide/analyser-un-repas-en-photo"
                className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)]"
              >
                Lire un guide clé
              </Link>
            </div>
          </section>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "À propos", path: "/a-propos" },
        ])}
      />
    </>
  );
}
