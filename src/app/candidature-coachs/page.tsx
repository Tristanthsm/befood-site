import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CoachApplicationForm } from "@/components/sections/coach-application-form";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getCoachRequestSummary } from "@/lib/supabase/coach-requests";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

export const metadata: Metadata = createPageMetadata({
  title: "Candidature coachs et experts",
  description: "Formulaire de candidature BeFood pour coachs, experts et créateurs.",
  path: "/candidature-coachs",
  noIndex: true,
});

type CandidateProfile = "coach" | "createur";

interface CoachApplicationPageProps {
  searchParams?: Promise<{ profil?: string | string[] }>;
}

function resolveInitialProfileType(rawValue: string | string[] | undefined): CandidateProfile {
  const normalized = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return normalized === "createur" ? "createur" : "coach";
}

export default async function CoachApplicationPage({ searchParams }: CoachApplicationPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialProfileType = resolveInitialProfileType(resolvedSearchParams.profil);
  const destinationEmail = process.env.COACH_APPLICATION_TO_EMAIL ?? siteConfig.contactEmail;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    const coachRequest = await getCoachRequestSummary(user.id);
    if (
      coachRequest
      && (
        coachRequest.status === "pending"
        || coachRequest.status === "approved"
        || coachRequest.status === "to_prepare"
        || coachRequest.status === "sent"
        || coachRequest.status === "signed_pending_verification"
        || coachRequest.status === "verified"
      )
    ) {
      redirect("/espace-coach/candidature");
    }
  }

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
                Présentez votre profil et vos informations contractuelles. Ces informations serviront à préparer automatiquement votre contrat BeFood.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Choix du parcours</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/candidature-coachs?profil=coach"
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    initialProfileType === "coach"
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      : "border-[var(--color-border)] bg-white hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--color-ink)]">Je candidate comme coach</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">Diplôme ou certification cohérente attendus.</p>
                </Link>
                <Link
                  href="/candidature-coachs?profil=createur"
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    initialProfileType === "createur"
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      : "border-[var(--color-border)] bg-white hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--color-ink)]">Je candidate comme créateur</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">Profil contenu, audience et valeur éditoriale.</p>
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <CoachApplicationForm destinationEmail={destinationEmail} initialProfileType={initialProfileType} />
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
