import type { Metadata } from "next";
import Link from "next/link";

import { StartFreeModalTrigger } from "@/components/auth/start-free-modal-trigger";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd, getSoftwareApplicationJsonLd } from "@/lib/seo";
import { siteConfig, storeLinks } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Application nutrition photo pour comprendre ses repas",
  description:
    "Découvrez l'application iOS BeFood: analyse de repas par photo, repères clairs, guidance personnalisée et progression des habitudes.",
  path: "/app",
  keywords: [
    "application nutrition photo",
    "analyse repas iOS",
    "journal alimentaire photo",
    "coach nutrition IA",
  ],
});

const appHighlights = [
  {
    title: "Analyse de repas par photo",
    description: "Capturez un repas et obtenez une lecture claire de ses grands équilibres.",
  },
  {
    title: "Interprétation utile",
    description: "Des retours actionnables pour décider quoi ajuster au repas suivant.",
  },
  {
    title: "Suivi d'habitudes",
    description: "Visualisez votre progression dans le temps pour construire une routine durable.",
  },
  {
    title: "Coach identifiable et suivi cohérent",
    description: "Gardez un fil conducteur avec une guidance plus contextualisée et plus constante.",
  },
];

const appFit = [
  "Vous voulez comprendre vos repas sans passer votre journée à tout logger.",
  "Vous cherchez un cadre plus humain et plus constant qu'un simple compteur.",
  "Vous voulez progresser avec des actions concrètes, adaptées à votre contexte réel.",
];

export default function AppPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Produit BeFood</p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
              Une app iOS pour comprendre vos repas, pas juste compter
            </h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              BeFood associe analyse photo, guidance et suivi des habitudes pour aider à mieux manger dans la durée,
              sans promesse médicale.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {appHighlights.map((item) => (
              <Card key={item.title} className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">{item.title}</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              </Card>
            ))}
          </div>

          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 sm:p-6">
            <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">Cette app est faite pour vous si...</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              {appFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#0a1a2e,#173553)] p-6 text-white sm:p-8">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">Télécharger BeFood</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/78 sm:text-lg">
              Disponible sur iOS. Ouvrez aussi nos guides pour comprendre l&apos;approche avant de démarrer.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StartFreeModalTrigger
                trackingId="start_free"
                trackingLocation="app_page"
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                Démarrer gratuitement
              </StartFreeModalTrigger>
              {storeLinks.appStore.status === "live" ? (
                <a
                  href={siteConfig.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta-track="download_app_store"
                  data-cta-location="app_page"
                  className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Ouvrir l&apos;App Store
                </a>
              ) : (
                <span className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white/80">
                  App Store bientôt
                </span>
              )}
              <Link
                href="/guides"
                className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Lire les guides
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
              <Link href="/guide/analyser-un-repas-en-photo" className="underline-offset-4 hover:text-white hover:underline">
                Commencer par: analyser un repas en photo
              </Link>
              <span aria-hidden>·</span>
              <Link href="/guide/alternative-calorie-tracker" className="underline-offset-4 hover:text-white hover:underline">
                Voir l&apos;alternative au calorie tracker
              </Link>
            </div>
          </section>
        </Container>
      </section>
      <JsonLd data={getSoftwareApplicationJsonLd("/app")} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "App", path: "/app" },
        ])}
      />
    </>
  );
}
