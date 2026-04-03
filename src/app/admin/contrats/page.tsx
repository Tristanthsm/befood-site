import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Container } from "@/components/ui/container";
import { getAdminAccessContext } from "@/lib/admin/auth";
import {
  getAdminActionErrorMessage,
  getContractRecommendedActionWithContext,
  resolveContractWorkflowStatus,
} from "@/lib/contract/admin-contract-workflow";
import { getMissingRequiredContractFields } from "@/lib/contract/internal-contract";
import { createPageMetadata } from "@/lib/seo";
import {
  listAdminCoachRequests,
  type AdminCoachRequestRecord,
} from "@/lib/supabase/admin-coach-requests";

export const runtime = "edge";
const FRANCE_TIME_ZONE = "Europe/Paris";

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

function truncate(value: string | null | undefined, maxLength = 90): string {
  if (!value) {
    return "—";
  }
  const normalized = value.trim();
  if (!normalized) {
    return "—";
  }
  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1)}…`;
}

function statusLabel(status: AdminCoachRequestRecord["status"]): string {
  if (status === "to_prepare") {
    return "À préparer";
  }
  if (status === "sent") {
    return "Envoyé";
  }
  if (status === "signed_pending_verification") {
    return "Signé à vérifier";
  }
  if (status === "verified") {
    return "Vérifié";
  }
  return status;
}

function ContractQueueTable({
  title,
  subtitle,
  rows,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  rows: AdminCoachRequestRecord[];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white/96 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>
      </div>

      {rows.length === 0 ? (
        <div className="p-4 text-sm text-[var(--color-muted)]">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
	              <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)] text-left text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
	                <th className="px-4 py-3 font-semibold">Nom</th>
	                <th className="px-4 py-3 font-semibold">Email</th>
	                <th className="px-4 py-3 font-semibold">Statut</th>
	                <th className="px-4 py-3 font-semibold">Action recommandée</th>
	                <th className="px-4 py-3 font-semibold">Dernière action</th>
	                <th className="px-4 py-3 font-semibold">Action</th>
	              </tr>
	            </thead>
	            <tbody>
	              {rows.map((request) => {
	                const contractStepStatus = resolveContractWorkflowStatus({
	                  contractStatus: request.contractStatus,
	                  requestStatus: request.status,
	                });
	                const missingRequiredFields = getMissingRequiredContractFields({
	                  coachFullName: request.contractCoachFullName ?? request.fullName,
	                  coachEmail: request.contractCoachEmail ?? request.email,
	                  coachStatus: request.contractCoachStatus,
	                  coachAddress: request.contractCoachAddress,
	                  coachRegistration: request.contractCoachRegistration,
	                  coachRegistrationStatus: request.contractRegistrationStatus,
	                });
	                const isContractMaterialReady = Boolean(
	                  request.contractVersion
	                  && request.contractContentHash
	                  && request.contractPreparedAt
	                  && request.contractPreparedContent,
	                );
	                const activityDate = request.contractSignedAt
	                  ?? request.contractSentAt
	                  ?? request.contractPreparedAt
	                  ?? request.updatedAt
	                  ?? request.createdAt;

                return (
                  <tr key={request.id} className="border-b border-[var(--color-border)] text-sm text-[var(--color-ink)]">
	                    <td className="px-4 py-3 font-semibold">{truncate(request.fullName, 42)}</td>
	                    <td className="px-4 py-3">{truncate(request.email, 48)}</td>
	                    <td className="px-4 py-3">{statusLabel(request.status)}</td>
	                    <td className="px-4 py-3">
	                      {missingRequiredFields.length > 0
	                        ? "Attendre complétion coach"
	                        : getContractRecommendedActionWithContext(contractStepStatus, { isContractMaterialReady })}
	                      {missingRequiredFields.length > 0 ? (
	                        <p className="mt-1 text-[11px] text-amber-800">
	                          Incomplet: {missingRequiredFields.join(", ")}
	                        </p>
	                      ) : null}
	                    </td>
	                    <td className="px-4 py-3">{formatDate(activityDate)}</td>
	                    <td className="px-4 py-3">
	                      <Link
	                        href={`/admin/coachs/${request.id}?from=contracts`}
                        className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                      >
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const metadata: Metadata = createPageMetadata({
  title: "Admin contrats coach",
  description: "Pilotage de l'étape contrat coach BeFood.",
  path: "/admin/contrats",
  noIndex: true,
});

export default async function AdminCoachContractsPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; error?: string }>;
}) {
  const access = await getAdminAccessContext();
  if (!access.isAuthenticated) {
    redirect("/connexion");
  }
  if (!access.isAdmin) {
    redirect("/profil");
  }

  const resolved = (await searchParams) ?? {};
  const isUpdated = resolved.updated === "1";
  const hasError = typeof resolved.error === "string" && resolved.error.length > 0;
  const errorMessage = getAdminActionErrorMessage(resolved.error) ?? "Impossible de traiter l'action contrat. Réessayez.";

  let toPrepareRequests: AdminCoachRequestRecord[] = [];
  let sentRequests: AdminCoachRequestRecord[] = [];
  let signedPendingVerificationRequests: AdminCoachRequestRecord[] = [];
  let loadError: string | null = null;

  try {
    [toPrepareRequests, sentRequests, signedPendingVerificationRequests] = await Promise.all([
      listAdminCoachRequests("to_prepare"),
      listAdminCoachRequests("sent"),
      listAdminCoachRequests("signed_pending_verification"),
    ]);
  } catch (error) {
    console.error("[admin-contracts] unable to load contract queues", error);
    loadError = "Impossible de charger les files contrat pour le moment.";
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-6xl space-y-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Admin</p>
          <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">Contrats coachs</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Étape 3 onboarding: contrats à envoyer, envoyés en attente de signature, et signatures reçues à vérifier.
          </p>
          <div className="mt-4">
            <AdminNavigation active="contracts" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]">
              À envoyer: {toPrepareRequests.length}
            </span>
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]">
              Envoyés: {sentRequests.length}
            </span>
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]">
              Signés à vérifier: {signedPendingVerificationRequests.length}
            </span>
          </div>
        </div>

        {isUpdated ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Action contrat enregistrée.
          </div>
        ) : null}

        {hasError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {loadError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        <ContractQueueTable
          title="Contrats à préparer / envoyer"
          subtitle="Dossiers acceptés. Compléter les informations manquantes puis préparer et marquer envoyé."
          rows={toPrepareRequests}
          emptyMessage="Aucun contrat à préparer pour le moment."
        />

        <ContractQueueTable
          title="Contrats envoyés"
          subtitle="Contrats disponibles côté coach, en attente de signature."
          rows={sentRequests}
          emptyMessage="Aucun contrat en attente de signature côté coach."
        />

        <ContractQueueTable
          title="Signatures reçues à vérifier"
          subtitle="Action attendue: Vérifier signature pour finaliser l'étape contrat."
          rows={signedPendingVerificationRequests}
          emptyMessage="Aucune signature à vérifier actuellement."
        />
      </Container>
    </section>
  );
}
