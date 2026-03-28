import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig, storeLinks } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Connexion",
  description:
    "Accédez au bon parcours BeFood: ouverture de l'app iOS pour les utilisateurs et accès professionnel pour les coachs validés.",
  path: "/connexion",
  noIndex: true,
});

export default function ConnexionPage() {
  const requestAccessHref = siteConfig.coachRequestAccessUrl ?? "/support";
  const coachPrimaryHref = siteConfig.coachSignInUrl ?? requestAccessHref;
  const coachPrimaryLabel = siteConfig.coachSignInUrl ? "Se connecter" : "Demander un accès";

  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-3xl space-y-4">
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
              {content.connexionPageIntro.title}
            </h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              {content.connexionPageIntro.description}
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-4 bg-white/95">
              <h2 className="text-2xl font-semibold text-[var(--color-ink)]">{content.connexionCards[0].title}</h2>
              <p className="text-sm leading-6 text-[var(--color-muted)]">{content.connexionCards[0].description}</p>
              <ButtonLink
                href={storeLinks.appStore.status === "live" ? storeLinks.appStore.url : null}
                disabled={storeLinks.appStore.status !== "live"}
                size="md"
              >
                {content.connexionCards[0].ctaLabel}
              </ButtonLink>
              <p className="text-xs leading-5 text-[var(--color-muted)]">
                Expérience principale disponible sur iPhone.
              </p>
            </Card>

            <Card className="space-y-4 bg-white/95">
              <h2 className="text-2xl font-semibold text-[var(--color-ink)]">{content.connexionCards[1].title}</h2>
              <p className="text-sm leading-6 text-[var(--color-muted)]">{content.connexionCards[1].description}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={coachPrimaryHref} size="md">
                  {coachPrimaryLabel}
                </ButtonLink>
                <ButtonLink href="/pour-les-coachs" variant="secondary" size="md">
                  Voir la page pros
                </ButtonLink>
              </div>
              <p className="text-xs leading-5 text-[var(--color-muted)]">
                L&apos;accès professionnel est réservé aux profils validés par l&apos;équipe BeFood.
              </p>
            </Card>
          </div>

          <p className="text-sm text-[var(--color-muted)]">
            Besoin d&apos;aide ?
            {" "}
            <Link
              href="/support"
              className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Ouvrir le support
            </Link>
            .
          </p>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Connexion", path: "/connexion" },
        ])}
      />
    </>
  );
}
