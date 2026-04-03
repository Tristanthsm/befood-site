import Link from "next/link";

import {
  type CoachOnboardingStep,
  type CoachVisibleStatus,
  getStatusBadgeClass,
} from "@/lib/coach/onboarding";

interface DossierCoachPanelProps {
  onboardingSteps: CoachOnboardingStep[];
  coachStatus: CoachVisibleStatus;
  coachMessage: string | null;
  contractStatus: "none" | "to_prepare" | "sent" | "signed_pending_verification" | "verified";
  showContractInfoCompletionCard?: boolean;
}

export function DossierCoachPanel({
  onboardingSteps,
  coachStatus,
  coachMessage,
  contractStatus,
  showContractInfoCompletionCard = false,
}: DossierCoachPanelProps) {
  const isApplicationInProgress = coachStatus.key === "submitted" || coachStatus.key === "reviewing";
  const canSubmitNewApplication = coachStatus.key === "rejected" || coachStatus.key === "changes_requested";
  const hasVisibleCoachMessage = Boolean(coachMessage?.trim()) && canSubmitNewApplication;
  const canSignContract = coachStatus.key === "contract_pending" && contractStatus === "sent";
  const contractStatusLabel = (() => {
    if (contractStatus === "to_prepare") {
      return "Contrat en préparation";
    }
    if (contractStatus === "sent") {
      return "Action requise: signer le contrat";
    }
    if (contractStatus === "signed_pending_verification") {
      return "Signature reçue, vérification en cours";
    }
    if (contractStatus === "verified") {
      return "Contrat vérifié";
    }
    return coachStatus.key === "contract_pending" ? "Contrat à finaliser" : "Étape pilotée avec BeFood";
  })();

  return (
    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Parcours onboarding</p>
        <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">Dossier coach</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Cet espace centralise votre progression et les étapes restantes avant activation complète.
        </p>

        <div className="mt-4 space-y-3">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-2xl border p-3 ${
                step.done
                  ? "border-emerald-200 bg-emerald-50/70"
                  : step.current
                    ? "border-[var(--color-accent)] bg-[linear-gradient(150deg,rgba(255,255,255,0.98),rgba(236,250,245,0.88))]"
                    : "border-[var(--color-border)] bg-[var(--color-panel)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {index + 1}. {step.title}
                </p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    step.done
                      ? "bg-emerald-100 text-emerald-800"
                      : step.current
                        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent-strong)]"
                        : "bg-white text-[var(--color-muted)]"
                  }`}
                >
                  {step.done ? "Terminé" : step.current ? "En cours" : "À venir"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {hasVisibleCoachMessage ? (
          <div className={`rounded-3xl border p-5 ${coachStatus.key === "rejected" ? "border-rose-300 bg-rose-50" : "border-amber-300 bg-amber-50"}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Message BeFood</p>
            <p className={`mt-2 text-sm font-semibold ${coachStatus.key === "rejected" ? "text-rose-800" : "text-amber-900"}`}>
              {coachMessage?.trim()}
            </p>
          </div>
        ) : null}

        <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Contrat</p>
          <p className="mt-2 text-sm text-[var(--color-ink)]">
            Le contrat intervient après approbation de candidature et avant activation finale.
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
            Tant que cette étape n&apos;est pas validée, l&apos;activation coach reste bloquée.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(coachStatus.tone)}`}>
              {contractStatusLabel}
            </span>
            {canSignContract ? (
              <Link
                href="/espace-coach/contrat"
                className="inline-flex rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-strong)]"
              >
                Signer le contrat
              </Link>
            ) : null}
          </div>
        </div>

        {showContractInfoCompletionCard ? (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5">
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

        {isApplicationInProgress || canSubmitNewApplication ? (
          <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Candidature</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isApplicationInProgress ? (
                <Link
                  href="/espace-coach/candidature"
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                >
                  Revoir la candidature
                </Link>
              ) : null}
              {canSubmitNewApplication ? (
                <Link
                  href="/candidature-coachs"
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                >
                  Nouvelle candidature
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
