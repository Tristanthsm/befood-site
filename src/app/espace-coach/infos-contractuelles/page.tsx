import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { getMissingRequiredContractFields, type ContractRegistrationStatus } from "@/lib/contract/internal-contract";
import { createPageMetadata } from "@/lib/seo";
import { getCoachRequestSummary } from "@/lib/supabase/coach-requests";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

export const metadata: Metadata = createPageMetadata({
  title: "Informations contractuelles",
  description: "Mise à jour des informations contractuelles coach pour préparation du contrat BeFood.",
  path: "/espace-coach/infos-contractuelles",
  noIndex: true,
});

function resolveErrorMessage(code: string | null | undefined): string | null {
  const normalized = String(code ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized === "missing_contract_fields") {
    return "Merci de compléter les champs contractuels obligatoires.";
  }
  if (normalized === "missing_contract_registration") {
    return "Merci de renseigner votre SIREN / SIRET pour finaliser les informations contractuelles.";
  }
  if (normalized === "invalid_registration_status") {
    return "Merci de préciser votre situation SIREN / SIRET.";
  }
  if (normalized === "invalid_email") {
    return "Adresse email contractuelle invalide.";
  }
  if (normalized === "invalid_transition") {
    return "Mise à jour non autorisée à cette étape du dossier.";
  }
  if (normalized === "not_found") {
    return "Dossier coach introuvable.";
  }
  if (normalized === "update_failed") {
    return "Impossible d'enregistrer vos informations pour le moment.";
  }
  if (normalized === "invalid_form") {
    return "Formulaire invalide. Réessayez.";
  }
  return "Impossible de traiter votre demande pour le moment.";
}

export default async function CoachContractDetailsPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; error?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
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

  const canAccessContractInfo =
    coachRequest.status === "approved"
    || coachRequest.status === "to_prepare"
    || coachRequest.status === "changes_requested";

  if (!canAccessContractInfo) {
    redirect("/espace-coach?tab=dossier");
  }

  const contractCoachEmail = coachRequest.contractCoachEmail ?? user.email ?? "";
  const contractCoachStatus = coachRequest.contractCoachStatus ?? "";
  const contractCoachAddress = coachRequest.contractCoachAddress ?? "";
  const contractCoachRegistration = coachRequest.contractCoachRegistration ?? "";
  const contractRegistrationStatus: ContractRegistrationStatus = coachRequest.contractRegistrationStatus;

  const missingRequiredFields = getMissingRequiredContractFields({
    coachFullName: coachRequest.contractCoachFullName ?? coachRequest.fullName,
    coachEmail: contractCoachEmail,
    coachStatus: contractCoachStatus,
    coachAddress: contractCoachAddress,
    coachRegistration: contractCoachRegistration,
    coachRegistrationStatus: contractRegistrationStatus,
  });

  const isUpdated = resolvedSearchParams.updated === "1";
  const errorMessage = resolveErrorMessage(resolvedSearchParams.error);

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl space-y-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
              <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Compléter mes informations contractuelles</h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Votre dossier a été accepté. Merci de compléter ces informations pour recevoir votre contrat.
              </p>
            </div>
            <Link
              href="/espace-coach?tab=dossier"
              className="inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
            >
              Retour au dossier
            </Link>
          </div>

          {missingRequiredFields.length > 0 ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              Informations manquantes: {missingRequiredFields.join(", ")}.
            </p>
          ) : (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              Informations contractuelles complètes. Votre dossier est prêt pour la préparation du contrat.
            </p>
          )}
        </div>

        {isUpdated ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Informations contractuelles mises à jour.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <form
          method="post"
          action="/api/coach-contract/details"
          className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8"
        >
          <input type="hidden" name="redirectTo" value="/espace-coach/infos-contractuelles" />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
              Email contractuel
              <input
                type="email"
                name="contract_coach_email"
                required
                defaultValue={contractCoachEmail}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
              Statut juridique
              <input
                type="text"
                name="contract_coach_status"
                required
                defaultValue={contractCoachStatus}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)]"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm font-medium text-[var(--color-ink)]">
            Adresse contractuelle
            <textarea
              name="contract_coach_address"
              required
              rows={3}
              defaultValue={contractCoachAddress}
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
            />
          </label>

          <fieldset className="mt-4 space-y-2 text-sm font-medium text-[var(--color-ink)]">
            <legend>Avez-vous déjà un SIREN / SIRET ?</legend>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)]">
                <input
                  type="radio"
                  name="contract_registration_status"
                  value="provided"
                  defaultChecked={contractRegistrationStatus === "provided"}
                />
                Oui
              </label>
              <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)]">
                <input
                  type="radio"
                  name="contract_registration_status"
                  value="pending_creation"
                  defaultChecked={contractRegistrationStatus === "pending_creation"}
                />
                Non, en cours de création
              </label>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Si votre SIREN / SIRET est en cours de création, revenez ici dès réception pour débloquer l&apos;envoi du contrat.
            </p>
          </fieldset>

          <label className="mt-4 block space-y-2 text-sm font-medium text-[var(--color-ink)]">
            SIREN / SIRET
            <input
              type="text"
              name="contract_coach_registration"
              defaultValue={contractCoachRegistration}
              placeholder="Ex: 123456789 / 12345678900011"
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)]"
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold text-white hover:opacity-90"
            >
              Enregistrer mes informations contractuelles
            </button>
          </div>
        </form>
      </Container>
    </section>
  );
}
