import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Application nutrition pour les coachs",
  description:
    "Découvrez BeFood pour les coachs et professionnels de la nutrition: analyses repas par photo, guidance claire et parcours d'accès professionnel.",
  path: "/pour-les-coachs",
  keywords: [
    "application nutrition pour coachs",
    "analyse photo repas coach nutrition",
    "accompagnement nutritionnel intelligent",
    "outil suivi alimentaire coach",
  ],
});

export default function CoachsPage() {
  const requestAccessHref = siteConfig.coachRequestAccessUrl ?? "/aide";
  const signInHref = siteConfig.coachSignInUrl ?? "/connexion";

  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#081122,#132b45)] p-7 text-white sm:p-10">
            <div className="max-w-3xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-accent-soft)]">
                {content.coachPageContent.heroBadge}
              </p>
              <h1 className="text-balance font-display text-4xl leading-tight sm:text-5xl">
                {content.coachPageContent.heroTitle}
              </h1>
              <p className="text-base leading-7 text-white/78 sm:text-lg">{content.coachPageContent.heroDescription}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink
                  href={requestAccessHref}
                  variant="secondary"
                  className="ring-0"
                >
                  Demander un accès
                </ButtonLink>
                <ButtonLink
                  href={signInHref}
                  variant="ghost"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Déjà invité ? Se connecter
                </ButtonLink>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <article className="rounded-2xl border border-white/15 bg-white/7 p-5 backdrop-blur-sm">
                <h2 className="text-base font-semibold text-white">{content.coachPageContent.heroCoachImpactTitle}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/82">
                  {content.coachPageContent.heroCoachImpactPoints.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-white/15 bg-white/7 p-5 backdrop-blur-sm">
                <h2 className="text-base font-semibold text-white">{content.coachPageContent.heroClientImpactTitle}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/82">
                  {content.coachPageContent.heroClientImpactPoints.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>

          <section aria-labelledby="coach-value-title" className="space-y-4">
            <h2 id="coach-value-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {content.coachPageContent.valueTitle}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {content.coachPageContent.valueItems.map((item) => (
                <Card key={item.title} className="space-y-3 bg-white/94">
                  <h3 className="text-xl font-semibold text-[var(--color-ink)]">{item.title}</h3>
                  <p className="text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section aria-labelledby="coach-usecases-title" className="space-y-4">
            <h2 id="coach-usecases-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {content.coachPageContent.useCasesTitle}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {content.coachPageContent.useCases.map((item) => (
                <article key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5">
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="coach-process-title" className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-5 sm:p-6">
            <h2 id="coach-process-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {content.coachPageContent.processTitle}
            </h2>
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {content.coachPageContent.processSteps.map((step) => {
                const cleanTitle = step.title.replace(/^\d+\.\s*/, "");
                return (
                  <li key={step.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">{cleanTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="coach-faq-title" className="space-y-4">
            <h2 id="coach-faq-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {content.coachPageContent.faqTitle}
            </h2>
            <div className="grid gap-3">
              {content.coachPageContent.faqItems.map((faq) => (
                <Card key={faq.question} className="p-0">
                  <details className="rounded-[var(--radius-card)] p-5">
                    <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-[var(--color-ink)] marker:hidden">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{faq.answer}</p>
                  </details>
                </Card>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#0a1a2e,#173553)] p-6 text-white sm:p-8">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">{content.coachPageContent.finalCta.title}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/78 sm:text-lg">
              {content.coachPageContent.finalCta.description}
            </p>
            <p className="mt-3 text-sm text-white/70">{content.coachPageContent.finalCta.note}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={requestAccessHref} variant="secondary" className="ring-0">
                Demander un accès professionnel
              </ButtonLink>
              <ButtonLink
                href="/connexion"
                variant="ghost"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Ouvrir la page connexion
              </ButtonLink>
            </div>
          </section>
        </Container>
      </section>
      <JsonLd data={getFaqJsonLd(content.coachPageContent.faqItems)} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Pour les coachs", path: "/pour-les-coachs" },
        ])}
      />
    </>
  );
}
