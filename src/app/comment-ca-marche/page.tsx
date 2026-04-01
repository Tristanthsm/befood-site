import type { Metadata } from "next";
import Link from "next/link";

import { StartFreeModalTrigger } from "@/components/auth/start-free-modal-trigger";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Comment BeFood fonctionne",
  description:
    "Découvrez le fonctionnement BeFood: photo du repas, repères nutritionnels, interprétation guidée et progression des habitudes.",
  path: "/comment-ca-marche",
  keywords: [
    "comment marche BeFood",
    "analyse repas par photo",
    "interprétation nutritionnelle",
    "habitudes alimentaires",
  ],
});

const steps = [
  {
    title: "1. Prendre le repas en photo",
    description: "La capture du repas réduit la friction et facilite la régularité du suivi.",
  },
  {
    title: "2. Recevoir des repères clairs",
    description: "BeFood transforme l'image en lecture compréhensible des grands équilibres du repas.",
  },
  {
    title: "3. Interpréter et ajuster",
    description: "Le feedback aide à décider un ajustement concret au repas suivant, sans logique punitive.",
  },
  {
    title: "4. Progresser dans la durée",
    description: "Les habitudes se construisent avec des micro-ajustements répétés, pas avec des objectifs irréalistes.",
  },
];

const differentiation = [
  "BeFood part du repas réel (photo + contexte), pas d'une saisie exhaustive ingrédient par ingrédient.",
  "L'objectif est de guider des décisions concrètes, pas d'optimiser un score quotidien.",
  "La progression se construit avec un coach plus cohérent et des repères actionnables dans la durée.",
];

export default function HowBeFoodWorksPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Parcours utilisateur</p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">Comment ça marche concrètement ?</h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              BeFood aide à comprendre ce qu&apos;on mange avec une approche pédagogique: photo, repères, guidance et suivi dans le temps.
            </p>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            {steps.map((step) => (
              <Card key={step.title} className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">{step.title}</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">{step.description}</p>
              </Card>
            ))}
          </div>

          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 sm:p-6">
            <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
              Ce qui différencie BeFood d&apos;une app nutrition standard
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              {differentiation.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#0a1a2e,#173553)] p-6 text-white sm:p-8">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">Prêt à passer à l&apos;action ?</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">
              Démarrez avec BeFood pour appliquer ces repères sur vos repas réels dès aujourd&apos;hui.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StartFreeModalTrigger
                trackingId="start_free"
                trackingLocation="comment_ca_marche_cta"
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                Démarrer gratuitement
              </StartFreeModalTrigger>
              <Link
                href="/app"
                className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Voir l&apos;application iOS
              </Link>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/methodologie" className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
              Voir la méthodologie détaillée
            </Link>
            <span className="text-[var(--color-muted)]">·</span>
            <Link href="/guides" className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
              Explorer les guides
            </Link>
            <span className="text-[var(--color-muted)]">·</span>
            <Link
              href="/guide/comprendre-l-equilibre-d-un-repas"
              className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline"
            >
              Lire le guide équilibre d&apos;un repas
            </Link>
          </div>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Comment ça marche", path: "/comment-ca-marche" },
        ])}
      />
    </>
  );
}
