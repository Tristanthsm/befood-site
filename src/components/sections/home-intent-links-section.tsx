import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const intentLinks = [
  {
    href: "/guide/analyser-un-repas-en-photo",
    title: "Analyser un repas en photo",
    description: "Méthode pratique, limites à connaître, et comment interpréter un repas sans surpromesse.",
  },
  {
    href: "/guide/alternative-calorie-tracker",
    title: "Pas un simple calorie tracker",
    description: "BeFood privilégie la compréhension du repas et la guidance, plutôt qu'une logique purement chiffrée.",
  },
  {
    href: "/methodologie",
    title: "Méthodologie BeFood",
    description: "Ce que l'analyse fait, ce qu'elle ne fait pas, et pourquoi BeFood n'est pas un service médical.",
  },
  {
    href: "/comment-ca-marche",
    title: "Comment BeFood vous guide",
    description: "Du repas réel à une action concrète: lecture du contexte, repères utiles, et ajustement réaliste.",
  },
];

export function HomeIntentLinksSection() {
  return (
    <section className="py-10 sm:py-12">
      <Container>
        <div className="space-y-4 rounded-[1.75rem] border border-[var(--color-border)] bg-white/90 p-6 sm:p-8">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Repères utiles
            </p>
            <h2 className="font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
              Trouvez la bonne ressource selon votre objectif
            </h2>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              BeFood aide à comprendre les repas, interpréter les retours de l&apos;IA et avancer avec une guidance cohérente.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {intentLinks.map((item) => (
              <Card key={item.href} className="space-y-2 bg-[var(--color-panel)]">
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                  <Link href={item.href} className="underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              data-cta-track="start_free"
              data-cta-location="home_intent_links"
              className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
            >
              Démarrer gratuitement
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)]"
            >
              Voir l&apos;app iOS
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
