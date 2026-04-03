import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Container } from "@/components/ui/container";
import { getAdminAccessContext } from "@/lib/admin/auth";
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

export const metadata: Metadata = createPageMetadata({
  title: "Admin coachs",
  description: "Validation des demandes coach BeFood.",
  path: "/admin/coachs",
  noIndex: true,
});

export default async function AdminCoachRequestsPage({
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

  let pendingRequests: AdminCoachRequestRecord[] = [];
  let loadError: string | null = null;

  try {
    pendingRequests = await listAdminCoachRequests("pending");
  } catch (error) {
    console.error("[admin-coachs] unable to load pending coach requests", error);
    loadError = "Impossible de charger les demandes coach pour le moment.";
  }

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-6xl space-y-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Admin</p>
          <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">Validation coachs</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            File des candidatures initiales (pending uniquement). Les dossiers contractuels passent dans l&apos;onglet Contrats coachs.
          </p>
          <div className="mt-4">
            <AdminNavigation active="requests" />
          </div>
          <div className="mt-3">
            <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]">
              Demandes à traiter: {pendingRequests.length}
            </span>
          </div>
        </div>

        {isUpdated ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Demande traitée et retirée de la file.
          </div>
        ) : null}

        {hasError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Impossible de traiter la demande. Réessayez.
          </div>
        ) : null}

        {loadError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white/96 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)]">
          {pendingRequests.length === 0 ? (
            <div className="p-6 text-sm text-[var(--color-muted)]">
              Aucune demande en attente de traitement.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)] text-left text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    <th className="px-4 py-3 font-semibold">Nom</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Type profil</th>
                    <th className="px-4 py-3 font-semibold">Activité</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b border-[var(--color-border)] text-sm text-[var(--color-ink)]">
                      <td className="px-4 py-3 font-semibold">{truncate(request.fullName, 42)}</td>
                      <td className="px-4 py-3">{truncate(request.email, 48)}</td>
                      <td className="px-4 py-3">{formatDate(request.createdAt)}</td>
                      <td className="px-4 py-3">{truncate(request.profileType, 32)}</td>
                      <td className="px-4 py-3">{truncate(request.activity, 60)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/coachs/${request.id}?from=requests`}
                          className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                        >
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
