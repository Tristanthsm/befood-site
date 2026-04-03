import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Container } from "@/components/ui/container";
import { getAdminAccessContext } from "@/lib/admin/auth";
import {
  getAdminActionErrorMessage,
  getContractRecommendedActionHintWithContext,
  resolveContractWorkflowStatus,
} from "@/lib/contract/admin-contract-workflow";
import {
  DEFAULT_COACH_CONTRACT_TEMPLATE,
  DEFAULT_COACH_LEGAL_STATUS,
  buildContractDocumentAndHash,
  getMissingRequiredContractFields,
  hasUnresolvedContractPlaceholders,
} from "@/lib/contract/internal-contract";
import { createPageMetadata } from "@/lib/seo";
import { getAdminCoachRequestById } from "@/lib/supabase/admin-coach-requests";

export const runtime = "edge";
const FRANCE_TIME_ZONE = "Europe/Paris";

const STATUS_LABELS = {
  pending: "En attente",
  changes_requested: "Complément demandé",
  approved: "Acceptée",
  rejected: "Refusée",
  to_prepare: "Contrat à préparer",
  sent: "Contrat envoyé",
  signed_pending_verification: "Signature à vérifier",
  verified: "Contrat vérifié",
} as const;

const STATUS_BADGES = {
  pending: "border-slate-200 bg-slate-50 text-slate-700",
  changes_requested: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
  to_prepare: "border-indigo-200 bg-indigo-50 text-indigo-800",
  sent: "border-sky-200 bg-sky-50 text-sky-800",
  signed_pending_verification: "border-orange-200 bg-orange-50 text-orange-800",
  verified: "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const;

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

function formatLongText(value: string | null | undefined): string {
  if (!value) {
    return "Non renseigné";
  }
  const normalized = value.trim();
  return normalized || "Non renseigné";
}

export const metadata: Metadata = createPageMetadata({
  title: "Détail demande coach",
  description: "Traitement admin d'une demande coach.",
  path: "/admin/coachs",
  noIndex: true,
});

export default async function AdminCoachRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>;
  searchParams?: Promise<{ updated?: string; error?: string; from?: string }>;
}) {
  const access = await getAdminAccessContext();
  if (!access.isAuthenticated) {
    redirect("/connexion");
  }
  if (!access.isAdmin) {
    redirect("/profil");
  }

  const { requestId } = await params;
  const resolved = (await searchParams) ?? {};

  const request = await getAdminCoachRequestById(requestId).catch((error) => {
    console.error("[admin-coachs] unable to load request details", error);
    return null;
  });

  if (!request) {
    notFound();
  }

  const isContractStageStatus =
    request.status === "to_prepare"
    || request.status === "sent"
    || request.status === "signed_pending_verification"
    || request.status === "verified";
  const isFromContracts = resolved.from === "contracts" || (resolved.from !== "requests" && isContractStageStatus);
  const showContractSection = isFromContracts || isContractStageStatus;
  const showDecisionSection = !showContractSection;

  const backHref = showContractSection ? "/admin/contrats" : "/admin/coachs";
  const redirectPath = backHref;
  const navigationKey = showContractSection ? "contracts" : "requests";
  const isUpdated = resolved.updated === "1";
  const hasError = typeof resolved.error === "string" && resolved.error.length > 0;
  const errorMessage = getAdminActionErrorMessage(resolved.error) ?? "Impossible de mettre à jour la demande. Réessayez.";
  const contractStepStatus = resolveContractWorkflowStatus({
    contractStatus: request.contractStatus,
    requestStatus: request.status,
  });
  const isContractMaterialReady = Boolean(
    request.contractVersion
    && request.contractContentHash
    && request.contractPreparedAt
    && request.contractPreparedContent,
  );
  const contractCoachFullName = request.contractCoachFullName ?? request.fullName;
  const contractCoachEmail = request.contractCoachEmail ?? request.email ?? request.contractSignedEmail ?? "email-non-renseigne";
  const contractCoachStatus = request.contractCoachStatus ?? DEFAULT_COACH_LEGAL_STATUS;
  const contractCoachAddress = request.contractCoachAddress ?? "";
  const contractCoachRegistration = request.contractCoachRegistration ?? "";
  const contractTemplateDraft = request.contractTemplateText ?? DEFAULT_COACH_CONTRACT_TEMPLATE;
  const contractRegistrationStatusLabel = request.contractRegistrationStatus === "provided"
    ? "SIREN / SIRET renseigné"
    : "SIREN / SIRET en cours de création";
  const missingRequiredFields = getMissingRequiredContractFields({
    coachFullName: contractCoachFullName,
    coachEmail: contractCoachEmail,
    coachStatus: contractCoachStatus,
    coachAddress: contractCoachAddress,
    coachRegistration: contractCoachRegistration,
    coachRegistrationStatus: request.contractRegistrationStatus,
  });
  const hasPreparedPlaceholders = hasUnresolvedContractPlaceholders(request.contractPreparedContent);
  const contractGeneratedAtIso = request.contractPreparedAt ?? request.updatedAt ?? request.createdAt;
  const contractPreview = await buildContractDocumentAndHash({
    coachFullName: contractCoachFullName,
    coachEmail: contractCoachEmail,
    coachStatus: contractCoachStatus,
    coachAddress: contractCoachAddress,
    coachRegistration: contractCoachRegistration,
    contractTemplateText: contractTemplateDraft,
    generatedAtIso: contractGeneratedAtIso,
  });
  const contractPreviewText = request.contractPreparedContent ?? contractPreview.contractText;
  const contractDisplayedVersion = request.contractVersion ?? contractPreview.version;
  const contractDisplayedContentHash = request.contractContentHash ?? contractPreview.contentHash;
  const nextContractAction = (() => {
    if (contractStepStatus === "verified") {
      return null;
    }
    if (contractStepStatus === "signed_pending_verification") {
      return {
        value: "verify" as const,
        label: "Vérifier signature",
        className: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
      };
    }
    if (contractStepStatus === "sent") {
      return null;
    }
    if (contractStepStatus === "to_prepare" && isContractMaterialReady && missingRequiredFields.length === 0 && !hasPreparedPlaceholders) {
      return {
        value: "mark_sent" as const,
        label: "Marquer envoyé",
        className: "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
      };
    }
    return {
      value: "prepare" as const,
      label: "Préparer le contrat",
      className: "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
    };
  })();
  const actionContextMessage = contractStepStatus === "verified"
    ? "Contrat finalisé."
    : contractStepStatus === "sent"
      ? "Contrat envoyé. En attente signature coach."
      : null;

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-5xl space-y-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-6">
          <Link
            href={backHref}
            className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
          >
            {showContractSection ? "Retour aux contrats" : "Retour à la file"}
          </Link>
          <div className="mt-3">
            <AdminNavigation active={navigationKey} />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Admin / Demande coach</p>
          <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">{formatLongText(request.fullName)}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGES[request.status]}`}>
              {STATUS_LABELS[request.status]}
            </span>
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
              Créée: {formatDate(request.createdAt)}
            </span>
            {request.updatedAt ? (
              <span className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                Mise à jour: {formatDate(request.updatedAt)}
              </span>
            ) : null}
          </div>
        </div>

        {isUpdated ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Demande mise à jour.
          </div>
        ) : null}

        {hasError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className={showContractSection ? "grid gap-4" : "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"}>
          {!showContractSection ? (
            <div className="space-y-4">
            <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Identité</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Nom</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatLongText(request.fullName)}</dd>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Email</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatLongText(request.email)}</dd>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Type profil</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatLongText(request.profileType)}</dd>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Social / audience</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatLongText(request.socialLink ?? request.audience)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Contenu du dossier</h2>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Activité</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{formatLongText(request.activity)}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Expertise</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{formatLongText(request.expertise ?? request.certification)}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Motivation</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{formatLongText(request.motivation)}</p>
                </div>
              </div>
            </div>
            </div>
          ) : null}

          <div className="space-y-4">
            {showDecisionSection ? (
              <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Décision admin</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Choisissez un statut métier. Le statut “Accepter” passe directement le dossier en “Contrat à préparer”.
                </p>
                <form
                  method="post"
                  action={`/api/admin/coach-requests/${request.id}/status`}
                  className="mt-4 space-y-3"
                >
                  <input type="hidden" name="redirectTo" value={redirectPath} />
                  <label className="block space-y-2 text-sm font-medium text-[var(--color-ink)]">
                    Note interne admin (non visible côté coach)
                    <textarea
                      name="admin_note"
                      rows={5}
                      maxLength={2000}
                      defaultValue={request.adminNote ?? ""}
                      placeholder="Notes internes pour l'équipe BeFood."
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium text-[var(--color-ink)]">
                    Message coach (visible dans Mon espace coach)
                    <textarea
                      name="coach_message"
                      rows={5}
                      maxLength={2000}
                      defaultValue={request.coachMessage ?? ""}
                      placeholder="Message envoyé au coach avec le résultat de la décision."
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      name="status"
                      value="approved"
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Accepter et préparer
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="changes_requested"
                      className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                      Demander un complément
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="rejected"
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      Refuser
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {showContractSection ? (
              <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Contrat interne</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Mini back-office contrat: préparation, envoi, vérification de signature.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                    Statut contrat: {contractStepStatus}
                  </span>
                </div>
                <p className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)]">
                  {getContractRecommendedActionHintWithContext(contractStepStatus, { isContractMaterialReady })}
                </p>
                {missingRequiredFields.length > 0 ? (
                  <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                    Champs obligatoires manquants: {missingRequiredFields.join(", ")}.
                  </p>
                ) : null}
                {request.status === "to_prepare" && missingRequiredFields.length > 0 ? (
                  <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                    Dossier accepté mais incomplet pour contractualisation.
                  </p>
                ) : null}
                {hasPreparedPlaceholders ? (
                  <p className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    Placeholders détectés dans le contrat préparé. Corrige le modèle avant envoi.
                  </p>
                ) : null}
                <dl className="mt-3 space-y-1 text-xs text-[var(--color-muted)]">
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">Version:</dt>{" "}
                    <dd className="inline">{formatLongText(contractDisplayedVersion)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">Hash contenu:</dt>{" "}
                    <dd className="inline font-mono">{formatLongText(contractDisplayedContentHash)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">Préparé le:</dt>{" "}
                    <dd className="inline">{formatDate(request.contractPreparedAt)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">Signé le:</dt>{" "}
                    <dd className="inline">{formatDate(request.contractSignedAt)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">Signé par:</dt>{" "}
                    <dd className="inline">{formatLongText(request.contractSignedEmail)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">Type signature:</dt>{" "}
                    <dd className="inline">{formatLongText(request.contractSignatureType)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">Vérifié le:</dt>{" "}
                    <dd className="inline">{formatDate(request.contractVerifiedAt)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-ink)]">État SIREN / SIRET:</dt>{" "}
                    <dd className="inline">{contractRegistrationStatusLabel}</dd>
                  </div>
                </dl>

                <form
                  method="post"
                  action={`/api/admin/coach-requests/${request.id}/contract`}
                  className="mt-4 space-y-3"
                >
                  <input type="hidden" name="redirectTo" value={redirectPath} />
                  <details className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                    <summary className="cursor-pointer text-xs font-semibold text-[var(--color-ink)]">Modifier le contrat</summary>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-ink)]">
                        Nom / prénom coach
                        <input
                          name="contract_coach_full_name"
                          defaultValue={contractCoachFullName}
                          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-ink)]"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-ink)]">
                        Email contrat coach
                        <input
                          name="contract_coach_email"
                          defaultValue={contractCoachEmail}
                          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-ink)]"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-ink)]">
                        Statut coach
                        <input
                          name="contract_coach_status"
                          defaultValue={contractCoachStatus}
                          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-ink)]"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-ink)]">
                        Adresse coach
                        <input
                          name="contract_coach_address"
                          defaultValue={contractCoachAddress}
                          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-ink)]"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-ink)] sm:col-span-2">
                        SIREN / SIRET coach
                        <input
                          name="contract_coach_registration"
                          defaultValue={contractCoachRegistration}
                          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-ink)]"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-ink)] sm:col-span-2">
                        Modèle de contrat (placeholders: [Nom Prénom], [statut], [adresse], [SIREN / SIRET], [email])
                        <textarea
                          name="contract_template_text"
                          rows={16}
                          defaultValue={contractTemplateDraft}
                          className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 font-mono text-[11px] font-medium leading-5 text-[var(--color-ink)]"
                        />
                      </label>
                    </div>
                    {contractStepStatus !== "verified" ? (
                      <div className="mt-3">
                        <button
                          type="submit"
                          name="action"
                          value="prepare"
                          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
                        >
                          Enregistrer les modifications et préparer
                        </button>
                      </div>
                    ) : null}
                  </details>
                  <div className="flex flex-wrap items-center gap-2">
                  {nextContractAction ? (
                    <button
                      type="submit"
                      name="action"
                      value={nextContractAction.value}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${nextContractAction.className}`}
                    >
                      {nextContractAction.label}
                    </button>
                  ) : null}
                  {actionContextMessage ? (
                    <span className="text-xs font-semibold text-[var(--color-muted)]">{actionContextMessage}</span>
                  ) : null}
                  </div>
                </form>

                <details className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-[var(--color-ink)]">Aperçu document contrat</summary>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--color-muted)]">
                    {contractPreviewText}
                  </pre>
                </details>

                {request.contractSignaturePayload ? (
                  <details className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                    <summary className="cursor-pointer text-xs font-semibold text-[var(--color-ink)]">Preuve signature (snapshot)</summary>
                    <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--color-muted)]">
                      {JSON.stringify(request.contractSignaturePayload, null, 2)}
                    </pre>
                  </details>
                ) : null}

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Journal audit contrat</p>
                  {request.contractEvents.length === 0 ? (
                    <p className="mt-2 text-xs text-[var(--color-muted)]">Aucun événement contrat pour le moment.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {request.contractEvents.map((event) => (
                        <li
                          key={event.id}
                          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-2 text-xs text-[var(--color-ink)]"
                        >
                          <p className="font-semibold">
                            {event.eventType} · {formatDate(event.occurredAt)}
                          </p>
                          <p className="text-[11px] text-[var(--color-muted)]">
                            Source: {event.eventSource} · Acteur: {event.actorLabel ?? "—"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Traçabilité</h2>
              <p className="mt-2 text-sm text-[var(--color-ink)]">
                Dernière action: {request.updatedByName ?? "—"}.
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">
                Dernière mise à jour: {formatDate(request.updatedAt)}.
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">
                Note interne: {formatLongText(request.adminNote)}.
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">
                Message coach: {formatLongText(request.coachMessage)}.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
