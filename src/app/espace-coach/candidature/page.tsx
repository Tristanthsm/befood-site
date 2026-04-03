import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { getMissingRequiredContractFields } from "@/lib/contract/internal-contract";
import { createPageMetadata } from "@/lib/seo";
import { getCoachRequestSummary } from "@/lib/supabase/coach-requests";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
const FRANCE_TIME_ZONE = "Europe/Paris";

export const metadata: Metadata = createPageMetadata({
  title: "Ma candidature coach",
  description: "Lecture seule de la candidature coach envoyée à BeFood.",
  path: "/espace-coach/candidature",
  noIndex: true,
});

function readOnlyValue(value: string | null | undefined): string {
  if (!value) {
    return "Non renseigné";
  }
  const normalized = value.trim();
  return normalized || "Non renseigné";
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Date inconnue";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FRANCE_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function CoachApplicationReadonlyPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/connexion");
  }

  const coachRequest = await getCoachRequestSummary(user.id);
  if (!coachRequest) {
    redirect("/espace-coach?tab=dossier");
  }
  const contractCoachFullName = coachRequest.contractCoachFullName ?? coachRequest.fullName;
  const contractCoachEmail = coachRequest.contractCoachEmail ?? user.email ?? null;
  const contractCoachStatus = coachRequest.contractCoachStatus;
  const contractCoachAddress = coachRequest.contractCoachAddress;
  const contractCoachRegistration = coachRequest.contractCoachRegistration;
  const contractRegistrationStatusLabel = coachRequest.contractRegistrationStatus === "provided"
    ? "Renseigné"
    : "En cours de création";
  const missingContractFields = getMissingRequiredContractFields({
    coachFullName: contractCoachFullName,
    coachEmail: contractCoachEmail,
    coachStatus: contractCoachStatus,
    coachAddress: contractCoachAddress,
    coachRegistration: contractCoachRegistration,
    coachRegistrationStatus: coachRequest.contractRegistrationStatus,
  });
  const canEditContractInfo =
    (coachRequest.status === "approved" || coachRequest.status === "to_prepare")
    && missingContractFields.length > 0;

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
              <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Candidature envoyée</h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Cette vue est en lecture seule. Le dossier transmis ne peut pas être modifié ici.
              </p>
            </div>
            <Link
              href="/espace-coach?tab=dossier"
              className="inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
            >
              Retour au dossier
            </Link>
          </div>

          {canEditContractInfo ? (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">Informations contractuelles à compléter</p>
              <p className="mt-2 text-sm text-amber-900">
                Votre dossier a été accepté. Merci de compléter ces informations pour recevoir votre contrat.
              </p>
              <div className="mt-3">
                <Link
                  href="/espace-coach/infos-contractuelles"
                  className="inline-flex rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  Compléter mes informations contractuelles
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Nom complet</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{readOnlyValue(contractCoachFullName)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Email</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{readOnlyValue(contractCoachEmail)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Profil principal</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{readOnlyValue(coachRequest.profileType)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Audience / communauté</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{readOnlyValue(coachRequest.audience)}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Statut juridique (contrat)</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{readOnlyValue(contractCoachStatus)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">SIREN / SIRET (contrat)</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{readOnlyValue(contractCoachRegistration)}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Statut: {contractRegistrationStatusLabel}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Adresse contractuelle</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-[var(--color-ink)]">{readOnlyValue(contractCoachAddress)}</p>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Activité actuelle</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{readOnlyValue(coachRequest.activity)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Diplôme / expertise</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{readOnlyValue(coachRequest.expertise)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Pourquoi rejoindre BeFood ?</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{readOnlyValue(coachRequest.motivation)}</p>
            </div>
          </div>

          <p className="mt-5 text-xs text-[var(--color-muted)]">
            Envoyée le {formatDate(coachRequest.createdAt)}. Dernière mise à jour: {formatDate(coachRequest.updatedAt)}.
          </p>
        </div>
      </Container>
    </section>
  );
}
