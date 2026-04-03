import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContractSignatureForm } from "@/components/coach/contract-signature-form";
import { Container } from "@/components/ui/container";
import {
  DEFAULT_COACH_CONTRACT_TEMPLATE,
  DEFAULT_COACH_LEGAL_ADDRESS,
  DEFAULT_COACH_LEGAL_REGISTRATION,
  DEFAULT_COACH_LEGAL_STATUS,
  INTERNAL_CONTRACT_VERSION,
  appendContractOpenedEventIfNeeded,
  buildContractDocumentAndHash,
  getMissingRequiredContractFields,
  getInitialContractStatusFromCoachRequestStatus,
  hasUnresolvedContractPlaceholders,
  sha256Hex,
} from "@/lib/contract/internal-contract";
import { createPageMetadata } from "@/lib/seo";
import { getCoachRequestSummary } from "@/lib/supabase/coach-requests";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
const FRANCE_TIME_ZONE = "Europe/Paris";

export const metadata: Metadata = createPageMetadata({
  title: "Contrat coach",
  description: "Signature du contrat interne coach BeFood.",
  path: "/espace-coach/contrat",
  noIndex: true,
});

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

export default async function CoachContractPage({
  searchParams,
}: {
  searchParams?: Promise<{ signed?: string; error?: string }>;
}) {
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

  const resolved = (await searchParams) ?? {};

  const contractStatus = coachRequest.contractStatus !== "none"
    ? coachRequest.contractStatus
    : getInitialContractStatusFromCoachRequestStatus(coachRequest.status);

  const isContractFlowActive =
    contractStatus === "to_prepare"
    || contractStatus === "sent"
    || contractStatus === "signed_pending_verification"
    || contractStatus === "verified"
    || coachRequest.status === "approved";

  if (!isContractFlowActive) {
    redirect("/espace-coach?tab=dossier");
  }

  const generatedAtIso = coachRequest.contractPreparedAt ?? coachRequest.updatedAt ?? coachRequest.createdAt;
  const coachContractFullName = coachRequest.contractCoachFullName ?? coachRequest.fullName;
  const coachContractEmail = coachRequest.contractCoachEmail ?? user.email ?? coachRequest.contractSignedEmail ?? "email-non-renseigne";
  const coachContractStatus = coachRequest.contractCoachStatus ?? DEFAULT_COACH_LEGAL_STATUS;
  const coachContractAddress = coachRequest.contractCoachAddress ?? DEFAULT_COACH_LEGAL_ADDRESS;
  const coachContractRegistration = coachRequest.contractCoachRegistration ?? DEFAULT_COACH_LEGAL_REGISTRATION;
  const contractTemplateText = coachRequest.contractTemplateText ?? DEFAULT_COACH_CONTRACT_TEMPLATE;
  const missingRequiredFields = getMissingRequiredContractFields({
    coachFullName: coachContractFullName,
    coachEmail: coachContractEmail,
    coachStatus: coachContractStatus,
    coachAddress: coachContractAddress,
    coachRegistration: coachRequest.contractCoachRegistration,
    coachRegistrationStatus: coachRequest.contractRegistrationStatus,
  });

  if (contractStatus === "to_prepare" && missingRequiredFields.length > 0) {
    redirect("/espace-coach/infos-contractuelles");
  }

  const shouldUseFrozenPreparedContent =
    contractStatus === "sent"
    || contractStatus === "signed_pending_verification"
    || contractStatus === "verified";
  const preparedContractText = coachRequest.contractPreparedContent;

  if (shouldUseFrozenPreparedContent && !preparedContractText) {
    redirect("/espace-coach?tab=dossier");
  }

  const generatedContractFallback = !preparedContractText
    ? await buildContractDocumentAndHash({
      coachFullName: coachContractFullName,
      coachEmail: coachContractEmail,
      coachStatus: coachContractStatus,
      coachAddress: coachContractAddress,
      coachRegistration: coachContractRegistration,
      contractTemplateText,
      generatedAtIso,
    })
    : null;

  const contractText = preparedContractText ?? generatedContractFallback?.contractText ?? "";
  if (hasUnresolvedContractPlaceholders(contractText)) {
    redirect("/espace-coach?tab=dossier");
  }

  const computedContractHash = await sha256Hex(contractText);
  if (preparedContractText && coachRequest.contractContentHash && coachRequest.contractContentHash !== computedContractHash) {
    redirect("/espace-coach?tab=dossier");
  }
  const contractVersion = coachRequest.contractVersion ?? generatedContractFallback?.version ?? INTERNAL_CONTRACT_VERSION;
  const contractContentHash = coachRequest.contractContentHash ?? computedContractHash;

  if (contractStatus === "sent") {
    await appendContractOpenedEventIfNeeded({
      requestId: coachRequest.id,
      actorUserId: user.id,
      dedupeMinutes: 180,
    }).catch((error) => {
      console.error("[coach-contract-page] failed to append opened event", error);
    });
  }

  const signed =
    resolved.signed === "1"
    || contractStatus === "signed_pending_verification"
    || contractStatus === "verified";

  const canSign = contractStatus === "sent" && Boolean(preparedContractText);

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-5xl space-y-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
              <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Contrat interne</h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Document contractuel figé. La signature est tracée et soumise à validation finale BeFood.
              </p>
            </div>
            <Link
              href="/espace-coach?tab=dossier"
              className="inline-flex rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
            >
              Retour au dossier
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Statut contrat</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{contractStatus}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Préparé le</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatDate(coachRequest.contractPreparedAt ?? coachRequest.updatedAt)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Envoyé le</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatDate(coachRequest.contractSentAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-5 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Document signé</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-sm leading-6 text-[var(--color-ink)]">
              {contractText}
            </pre>
          </article>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-5 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Signature</h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Signature électronique simple avec preuve horodatée, hash du contenu et métadonnées techniques.
              </p>
              <div className="mt-4">
                <ContractSignatureForm
                  canSign={canSign}
                  signed={signed}
                  errorCode={typeof resolved.error === "string" ? resolved.error : null}
                  contractVersion={contractVersion}
                  contractContentHash={contractContentHash}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Preuve conservée</h2>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[var(--color-ink)]">
                <li>Version contractuelle figée.</li>
                <li>Hash SHA-256 du contenu signé.</li>
                <li>Horodatage et empreinte de signature.</li>
                <li>Adresse IP et user-agent au moment de signature.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
