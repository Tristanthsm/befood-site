import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { LiquidMetalButtonLink } from "@/components/ui/liquid-metal-button-link";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Profils pros dans l'écosystème BeFood",
  description:
    "Découvrez comment coachs, experts, créateurs et profils affinitaires renforcent l'expérience BeFood avec des repères concrets et une progression durable.",
  path: "/pour-les-coachs",
  keywords: [
    "candidature coach nutrition",
    "coachs experts créateurs BeFood",
    "profils affinitaires nutrition",
    "rejoindre ecosysteme BeFood",
    "accompagnement nutritionnel quotidien",
  ],
});

export default function CoachsPage() {
  const requestAccessHref = siteConfig.coachRequestAccessUrl ?? "/candidature-coachs";

  return (
    <>
      <section className="pb-10 pt-16 sm:pb-12 sm:pt-20">
        <Container className="space-y-12">
          <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#081122,#132b45)] p-7 text-white sm:p-10">
            <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="space-y-5">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-accent-soft)]">
                  {content.coachPageContent.heroBadge}
                </p>
                <h1 className="max-w-3xl text-balance font-display text-4xl leading-tight sm:text-5xl">
                  {content.coachPageContent.heroTitle}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white/80 sm:text-lg">
                  {content.coachPageContent.heroDescription}
                </p>
              </div>

              <div className="space-y-3">
                <article className="rounded-2xl border border-white/15 bg-white/7 p-5 backdrop-blur-sm">
                  <h2 className="text-base font-semibold text-white">{content.coachPageContent.heroUserLensTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/82">{content.coachPageContent.heroUserLensDescription}</p>
                </article>
                <article className="rounded-2xl border border-white/15 bg-white/7 p-5 backdrop-blur-sm">
                  <h2 className="text-base font-semibold text-white">{content.coachPageContent.heroProfileLensTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/82">{content.coachPageContent.heroProfileLensDescription}</p>
                </article>
              </div>
            </div>
          </div>

          <section
            id="pourquoi-experience"
            aria-labelledby="coach-ecosystem-title"
            className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-5 sm:p-6"
          >
            <div className="max-w-4xl space-y-3">
              <h2 id="coach-ecosystem-title" className="font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
                {content.coachPageContent.ecosystemTitle}
              </h2>
              <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                {content.coachPageContent.ecosystemDescription}
              </p>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {content.coachPageContent.ecosystemItems.map((item, index) => (
                <article key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                  <p className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-ink)] text-xs font-semibold text-white">
                    {index + 1}
                  </p>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="coach-eligibility-title" className="space-y-5">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">
                Profils recherchés
              </p>
              <h2 id="coach-eligibility-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
                <span className="inline-flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-accent)]/45 bg-[color:rgb(16_185_129_/12%)]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-strong)]" />
                  </span>
                  {content.coachPageContent.eligibilityTitle}
                </span>
                <span
                  aria-hidden
                  className="mt-2 block h-[2px] w-24 rounded-full bg-[linear-gradient(90deg,var(--color-accent),transparent)]"
                />
              </h2>
            </div>
            <p className="max-w-4xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              {content.coachPageContent.eligibilityDescription}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {content.coachPageContent.eligibilityItems.map((item, index) => (
                <article key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-white/92 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">
                    Profil {index + 1}
                  </p>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#0a1a2e,#173553)] p-6 text-white sm:p-8">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">{content.coachPageContent.finalCta.title}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/78 sm:text-lg">
              {content.coachPageContent.finalCta.description}
            </p>
            <div className="mt-6">
              <LiquidMetalButtonLink
                href={requestAccessHref}
                label="Présenter ma candidature"
                trackingId="coach_application_primary"
                trackingLocation="pour_les_coachs_final_cta"
              />
            </div>
            <div className="mt-6 border-t border-white/15 pt-4">
              <p className="text-sm text-white/75">
                BeFood n&apos;est pas réservé aux coachs : créateurs, experts et profils affinitaires peuvent aussi candidater.
              </p>
              <p className="mt-2 text-sm">
                <Link
                  href="/pour-les-coachs#coach-eligibility-title"
                  className="font-semibold text-[var(--color-accent-soft)] underline-offset-4 hover:underline"
                >
                  Voir les autres profils recherchés
                </Link>
              </p>
            </div>
          </section>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Coachs & experts", path: "/pour-les-coachs" },
        ])}
      />
    </>
  );
}
