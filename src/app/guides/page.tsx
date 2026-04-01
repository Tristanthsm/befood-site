import type { Metadata } from "next";
import Link from "next/link";

import { StartFreeModalTrigger } from "@/components/auth/start-free-modal-trigger";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { guidePages } from "@/content/fr/guides";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Guides nutrition et habitudes alimentaires",
  description:
    "Guides BeFood pour analyser ses repas en photo, mieux comprendre son alimentation et construire des habitudes durables.",
  path: "/guides",
  keywords: [
    "guide nutrition photo",
    "comprendre ce que je mange",
    "journal alimentaire photo",
    "habitudes alimentaires durables",
  ],
});

const startGuides = [
  "analyser-un-repas-en-photo",
  "comprendre-ce-que-je-mange",
  "alternative-calorie-tracker",
];

export default function GuidesPage() {
  const featuredGuides = guidePages.filter((guide) => startGuides.includes(guide.slug));
  const remainingGuides = guidePages.filter((guide) => !startGuides.includes(guide.slug));

  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Bibliothèque BeFood</p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
              Guides pour comprendre ses repas et progresser durablement
            </h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              Des contenus pratiques pour interpréter un repas, éviter le tout-calories et prendre de meilleures décisions
              au quotidien.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/comment-ca-marche" className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
                Voir le parcours BeFood
              </Link>
              <span className="text-[var(--color-muted)]">·</span>
              <Link href="/methodologie" className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
                Lire la méthodologie
              </Link>
            </div>
          </header>

          <section aria-labelledby="guides-start-title" className="space-y-4">
            <h2 id="guides-start-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              Commencer par ces guides
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredGuides.map((guide) => (
                <Card key={guide.slug} className="space-y-3 bg-white/95">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Priorité</p>
                  <h3 className="text-xl font-semibold leading-tight text-[var(--color-ink)]">
                    <Link href={`/guide/${guide.slug}`} className="underline-offset-4 hover:underline">
                      {guide.title}
                    </Link>
                  </h3>
                  <p className="text-sm leading-6 text-[var(--color-muted)]">{guide.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {remainingGuides.map((guide) => (
              <Card key={guide.slug} className="space-y-3 bg-white/95">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Guide pilier</p>
                <h2 className="text-2xl font-semibold leading-tight text-[var(--color-ink)]">
                  <Link href={`/guide/${guide.slug}`} className="underline-offset-4 hover:underline">
                    {guide.title}
                  </Link>
                </h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">{guide.description}</p>
                <p className="text-sm font-medium text-[var(--color-muted)]">Quand lire ce guide: {guide.intent}</p>
              </Card>
            ))}
          </div>

          <section className="rounded-3xl border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#0a1a2e,#173553)] p-6 text-white sm:p-8">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">Passez des guides à l&apos;action</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">
              Utilisez BeFood pour appliquer ces repères sur vos repas réels, avec une guidance plus cohérente.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StartFreeModalTrigger
                trackingId="start_free"
                trackingLocation="guides_page"
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                Démarrer gratuitement
              </StartFreeModalTrigger>
              <Link
                href="/app"
                className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Voir l&apos;app iOS
              </Link>
            </div>
          </section>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
    </>
  );
}
