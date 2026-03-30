import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { CoachApplicationForm } from "@/components/sections/coach-application-form";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Candidature coachs et experts",
  description: "Formulaire de candidature BeFood pour coachs, experts et créateurs.",
  path: "/candidature-coachs",
  noIndex: true,
});

export default function CoachApplicationPage() {
  const destinationEmail = process.env.COACH_APPLICATION_TO_EMAIL ?? siteConfig.contactEmail;

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(16,185,129,0.12),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(15,23,42,0.10),transparent_35%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-[color:rgb(11_34_52_/14%)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.65)] sm:p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
                Candidature BeFood
              </p>
              <h1 className="font-display text-4xl text-[var(--color-ink)]">Rejoindre l&apos;écosystème BeFood</h1>
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                Présentez votre profil en quelques informations générales. Chaque candidature est étudiée avant validation.
              </p>
            </div>

            <div className="mt-6">
              <CoachApplicationForm destinationEmail={destinationEmail} />
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-[var(--color-muted)]">
              Déjà invité ?{" "}
              <Link
                href="/connexion"
                className="font-semibold text-[var(--color-accent-strong)] underline-offset-3 hover:underline"
              >
                Se connecter
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Candidature coachs", path: "/candidature-coachs" },
        ])}
      />
    </>
  );
}
