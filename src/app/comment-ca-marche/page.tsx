import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Comment BeFood transforme une photo en plan d'action nutrition",
  description:
    "Des recommandations créées par de vrais coachs, adaptées par l'IA. Photo, analyse utile, recommandation claire et passage à l'action.",
  path: "/comment-ca-marche",
  keywords: [
    "comment marche BeFood",
    "photo analyse repas",
    "recommandations nutrition personnalisées",
    "coach nutrition IA",
    "liste de courses nutrition",
    "recettes coach nutrition",
  ],
});

const FLOW_STEPS = [
  {
    step: "01",
    title: "Photo du repas",
    description: "Vous capturez votre repas réel en quelques secondes, sans tracking lourd.",
    result: "Point de départ simple et régulier.",
    image: {
      src: "/images/app/showcase/camera-scan.png",
      alt: "Capture BeFood lors de la prise de photo du repas",
      width: 1419,
      height: 2796,
    },
  },
  {
    step: "02",
    title: "Analyse nutritionnelle utile",
    description: "BeFood lit ce qui compte et transforme l'image en repères compréhensibles.",
    result: "Vous savez ce qui est solide et ce qui doit évoluer.",
    image: {
      src: "/images/app/showcase/analysis-result.png",
      alt: "Résultat d'analyse BeFood avec repères nutritionnels",
      width: 1419,
      height: 2796,
    },
  },
  {
    step: "03",
    title: "Recommandation du coach",
    description: "Les recommandations sont créées par de vrais coachs puis adaptées par l'IA à votre contexte.",
    result: "Vous recevez une guidance personnalisée et exploitable.",
    image: {
      src: "/images/app/showcase/coach-chat.png",
      alt: "Conversation BeFood avec recommandations personnalisées",
      width: 1419,
      height: 2796,
    },
  },
  {
    step: "04",
    title: "Action concrète",
    description: "Vous passez immédiatement à l'exécution avec des actions simples pour votre semaine.",
    result: "Recos appliquées, progression visible.",
    image: {
      src: "/images/app/showcase/progress-dashboard.png",
      alt: "Tableau de bord BeFood montrant la progression",
      width: 1419,
      height: 2796,
    },
  },
] as const;

const DIFFERENTIATION_ROWS = [
  {
    classic: "Suivi orienté score ou compteur",
    befood: "Plan d'action clair après chaque analyse",
  },
  {
    classic: "Conseils génériques identiques pour tous",
    befood: "Recommandations créées par des coachs, adaptées par l'IA",
  },
  {
    classic: "Pas de suite concrète après le repas",
    befood: "Recette, planning et liste de courses pour agir",
  },
  {
    classic: "Motivation courte puis abandon",
    befood: "Continuité semaine après semaine",
  },
] as const;

const CONCRETE_BENEFITS = [
  {
    title: "Analyse utile",
    detail: "Vous comprenez rapidement le repas et ce qui est prioritaire.",
  },
  {
    title: "Recommandations personnalisées",
    detail: "Vous savez quoi faire au prochain repas, sans ambiguïté.",
  },
  {
    title: "Recettes du coach",
    detail: "Des idées activables alignées avec votre profil.",
  },
  {
    title: "Liste de courses",
    detail: "Vous passez de l'analyse à l'exécution en quelques clics.",
  },
  {
    title: "Continuité",
    detail: "Vous ajoutez directement la recommandation à votre semaine.",
  },
] as const;

const PRODUCT_PROOFS = [
  {
    title: "Reco du jour",
    description: "Une recommandation claire à appliquer immédiatement.",
    image: "/images/app/showcase/coach-chat.png",
  },
  {
    title: "Recette du coach",
    description: "Une proposition concrète adaptée à vos objectifs.",
    image: "/images/app/showcase/social-feed.png",
  },
  {
    title: "Ajout au planning",
    description: "La recommandation devient une action dans votre semaine.",
    image: "/images/app/showcase/progress-dashboard.png",
  },
  {
    title: "Liste de courses générée",
    description: "Vous préparez les prochains repas sans repartir de zéro.",
    image: "/images/app/showcase/analysis-result.png",
  },
] as const;

interface PrimaryCtaProps {
  trackingLocation: string;
  fullWidth?: boolean;
}

function PrimaryCta({ trackingLocation, fullWidth = false }: PrimaryCtaProps) {
  const className = [
    "group relative inline-flex min-h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1ad8ab,#0ea678)] px-8 py-3.5 text-base font-bold text-white ring-1 ring-white/30 shadow-[0_20px_44px_-18px_rgba(16,185,129,0.98)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_56px_-18px_rgba(16,185,129,1)] active:translate-y-0",
    fullWidth ? "w-full" : "",
  ].join(" ").trim();

  const ctaLabel = (
    <>
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_18%,rgba(255,255,255,0.24)_50%,transparent_82%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <span className="relative">Tester BeFood sur un vrai repas</span>
      <span aria-hidden className="relative text-lg leading-none transition-transform duration-200 group-hover:translate-x-0.5">→</span>
    </>
  );

  return (
    <Link href="/app" data-cta-track="start_free" data-cta-location={trackingLocation} className={className}>
      {ctaLabel}
    </Link>
  );
}

export default function HowBeFoodWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden py-14 sm:py-18">
        <div className="pointer-events-none absolute left-1/2 top-7 h-[25rem] w-[56rem] -translate-x-[64%] rounded-[3rem] bg-[radial-gradient(circle_at_32%_35%,rgba(16,185,129,0.18),rgba(16,185,129,0.05)_58%,transparent_76%)]" />
        <div className="pointer-events-none absolute right-[-12rem] top-0 h-[22rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_40%_50%,rgba(15,23,42,0.1),transparent_70%)]" />
        <Container className="relative space-y-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:items-center">
            <header className="space-y-5">
              <p className="inline-flex items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
                Comment ça marche
              </p>
              <h1 className="max-w-3xl font-display text-4xl leading-[1.02] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
                BeFood ne montre pas juste votre repas, BeFood vous dit quoi faire ensuite.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                Des recommandations créées par de vrais coachs, adaptées par l&apos;IA au quotidien: photo, analyse utile, recommandation claire, passage à l&apos;action.
              </p>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4 text-sm text-[var(--color-ink)]">
                <p className="font-semibold">Rôle de chacun</p>
                <p className="mt-1 text-[var(--color-muted)]">
                  Vrai coach: méthode, recommandations, recettes et contenus. IA: adaptation, explication et accompagnement continu.
                </p>
              </div>
              <div>
                <PrimaryCta trackingLocation="comment_ca_marche_hero" />
              </div>
            </header>

            <div className="rounded-[2rem] border border-[color:rgb(11_34_52_/14%)] bg-[linear-gradient(150deg,#0a1a2e,#153451)] p-4 shadow-[0_30px_70px_-40px_rgba(3,13,27,0.95)] sm:p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-2.5">
                  <Image
                    src="/images/app/showcase/analysis-result.png"
                    alt="Analyse nutritionnelle BeFood"
                    width={1419}
                    height={2796}
                    className="h-auto w-full rounded-xl object-cover"
                    priority
                  />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-2.5">
                  <Image
                    src="/images/app/showcase/coach-chat.png"
                    alt="Recommandations personnalisées BeFood"
                    width={1419}
                    height={2796}
                    className="h-auto w-full rounded-xl object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-16">
        <Container>
          <div className="section-shell p-6 sm:p-8">
            <header className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Flow produit</p>
              <h2 className="font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
                Photo → analyse utile → recommandation → action
              </h2>
            </header>
            <ol className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {FLOW_STEPS.map((item) => (
                <li key={item.step} className="flex h-full flex-col rounded-3xl border border-[color:rgb(15_23_42_/10%)] bg-white p-4 shadow-[0_22px_50px_-36px_rgba(9,26,35,0.72)] sm:p-5">
                  <div className="h-[15.25rem]">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">Étape {item.step}</p>
                    <h3 className="mt-2 text-lg font-semibold leading-tight text-[var(--color-ink)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{item.result}</p>
                  </div>
                  <div className="mt-4 h-[20rem] overflow-hidden rounded-2xl border border-[color:rgb(15_23_42_/10%)] bg-[linear-gradient(170deg,#f3faf7,#e7f2ed)] sm:h-[22rem]">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={item.image.width}
                      height={item.image.height}
                      className="h-full w-full object-contain object-top pt-1"
                      loading="lazy"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-16">
        <Container>
          <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#081122,#122c47)] p-6 text-white shadow-[0_30px_70px_-45px_rgba(5,15,30,1)] sm:p-8">
            <header className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Différence clé</p>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                Pas de tracking vide, une vraie suite concrète après l&apos;analyse.
              </h2>
            </header>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/15">
              <div className="grid grid-cols-2 bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 sm:px-5 sm:py-4">
                <p>Apps classiques</p>
                <p>BeFood</p>
              </div>
              <ul>
                {DIFFERENTIATION_ROWS.map((row, index) => (
                  <li
                    key={row.classic}
                    className={[
                      "grid grid-cols-2 gap-3 px-4 py-4 text-sm leading-6 sm:px-5 sm:text-base",
                      index % 2 === 0 ? "bg-white/4" : "bg-transparent",
                    ].join(" ")}
                  >
                    <p className="text-white/70">{row.classic}</p>
                    <p className="font-medium text-white">{row.befood}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-16">
        <Container>
          <div className="rounded-[2rem] border border-[color:rgb(15_23_42_/11%)] bg-[linear-gradient(170deg,#ffffff,#eef8f3)] p-5 shadow-[0_24px_60px_-42px_rgba(8,29,42,0.62)] sm:p-7">
            <header className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Ce que vous obtenez concrètement</p>
              <h2 className="font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
                Vous passez de l&apos;analyse à l&apos;exécution.
              </h2>
            </header>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {CONCRETE_BENEFITS.map((item) => (
                <article key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--color-muted)]">{item.detail}</p>
                </article>
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {PRODUCT_PROOFS.map((proof) => (
                <article key={proof.title} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
                  <div className="h-[17rem] overflow-hidden bg-[var(--color-panel)] p-2">
                    <Image
                      src={proof.image}
                      alt={proof.title}
                      width={1419}
                      height={2796}
                      className="h-full w-full rounded-xl object-contain object-top"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{proof.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{proof.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container>
          <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,var(--color-dark),#1b324f)] p-7 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-center">
              <div className="space-y-4">
                <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                  Prêt à transformer votre prochain repas en action concrète ?
                </h2>
                <p className="max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                  BeFood vous montre quoi faire ensuite, avec des recommandations coach, des recettes utiles et une progression qui tient.
                </p>
              </div>
              <div className="lg:justify-self-end">
                <PrimaryCta trackingLocation="comment_ca_marche_final" fullWidth />
              </div>
            </div>
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
