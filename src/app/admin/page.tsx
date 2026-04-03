import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Container } from "@/components/ui/container";
import { getAdminAccessContext } from "@/lib/admin/auth";
import { createPageMetadata } from "@/lib/seo";
import { getAdminDashboardOverview } from "@/lib/supabase/admin-dashboard";

export const runtime = "edge";
const FRANCE_TIME_ZONE = "Europe/Paris";

const LIFECYCLE_LABELS = {
  active: "Actifs",
  pending: "En attente",
  paused: "Pausés",
  other: "Autres",
} as const;

const REQUEST_LABELS = {
  pending: "Demandes en attente",
  changes_requested: "Compléments demandés",
  approved: "Demandes acceptées",
  rejected: "Demandes refusées",
  to_prepare: "Contrats à préparer",
  sent: "Contrats envoyés",
  signed_pending_verification: "Signatures à vérifier",
  verified: "Contrats vérifiés",
} as const;

const LIFECYCLE_BADGE_CLASS = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-slate-200 bg-slate-50 text-slate-700",
  paused: "border-amber-200 bg-amber-50 text-amber-800",
  other: "border-violet-200 bg-violet-50 text-violet-800",
} as const;

function formatDate(value: string): string {
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

export const metadata: Metadata = createPageMetadata({
  title: "Admin dashboard",
  description: "Vue globale de pilotage admin BeFood.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminDashboardPage() {
  const access = await getAdminAccessContext();
  if (!access.isAuthenticated) {
    redirect("/connexion");
  }
  if (!access.isAdmin) {
    redirect("/profil");
  }

  const overview = await getAdminDashboardOverview().catch((error) => {
    console.error("[admin-dashboard] unable to load overview", error);
    return null;
  });

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-6xl space-y-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Admin</p>
          <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">Dashboard global BeFood</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Suivi structuré des demandes coach, des coachs actifs et des signaux clés de l&apos;application.
          </p>
          <div className="mt-4">
            <AdminNavigation active="dashboard" />
          </div>
        </div>

        {!overview ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            Impossible de charger la vue globale admin pour le moment.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Utilisateurs</p>
                <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{overview.usersTotal}</p>
              </article>
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Admins</p>
                <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{overview.adminsTotal}</p>
              </article>
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Profils coach</p>
                <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{overview.coachProfilesTotal}</p>
              </article>
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Demandes 7 jours</p>
                <p className="mt-2 font-display text-3xl text-[var(--color-ink)]">{overview.coachRequestsLast7Days}</p>
              </article>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    Validation coach
                  </h2>
                  <Link
                    href="/admin/coachs"
                    className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                  >
                    Ouvrir la file
                  </Link>
                </div>
                <div className="mt-3 grid gap-2">
                  {(Object.keys(REQUEST_LABELS) as Array<keyof typeof REQUEST_LABELS>).map((key) => (
                    <div key={key} className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                      <p className="text-sm text-[var(--color-ink)]">{REQUEST_LABELS[key]}</p>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{overview.coachRequestsByStatus[key]}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Signaux application (7 jours)
                </h2>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                    <p className="text-sm text-[var(--color-ink)]">Sessions web join</p>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{overview.appSignalsLast7Days.joinSessions}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                    <p className="text-sm text-[var(--color-ink)]">Clics App Store</p>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{overview.appSignalsLast7Days.appStoreClicks}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                    <p className="text-sm text-[var(--color-ink)]">Acquisitions coach</p>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{overview.appSignalsLast7Days.acquisitions}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Liste coachs
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(LIFECYCLE_LABELS) as Array<keyof typeof LIFECYCLE_LABELS>).map((key) => (
                  <span key={key} className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${LIFECYCLE_BADGE_CLASS[key]}`}>
                    {LIFECYCLE_LABELS[key]}: {overview.coachProfilesByLifecycle[key]}
                  </span>
                ))}
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)] text-left text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                      <th className="px-3 py-2 font-semibold">Coach</th>
                      <th className="px-3 py-2 font-semibold">Email</th>
                      <th className="px-3 py-2 font-semibold">Statut</th>
                      <th className="px-3 py-2 font-semibold">Vérifié</th>
                      <th className="px-3 py-2 font-semibold">Maj</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.coaches.length === 0 ? (
                      <tr>
                        <td className="px-3 py-4 text-sm text-[var(--color-muted)]" colSpan={5}>
                          Aucun profil coach pour le moment.
                        </td>
                      </tr>
                    ) : (
                      overview.coaches.slice(0, 40).map((coach) => (
                        <tr key={coach.userId} className="border-b border-[var(--color-border)] text-sm text-[var(--color-ink)]">
                          <td className="px-3 py-2 font-semibold">{coach.businessName}</td>
                          <td className="px-3 py-2">{coach.email ?? "—"}</td>
                          <td className="px-3 py-2">{coach.status}</td>
                          <td className="px-3 py-2">{coach.isVerified ? "Oui" : "Non"}</td>
                          <td className="px-3 py-2">{formatDate(coach.updatedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
