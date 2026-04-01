import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/seo";
import { getCoachAcquisitionDashboard } from "@/lib/supabase/coach-acquisition-dashboard";
import { getCoachAccountSummary } from "@/lib/supabase/coach-account";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Non disponible";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Date inconnue";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDayLabel(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function sumDaily(points: { joinSessions: number; appStoreClicks: number }[]) {
  return points.reduce(
    (acc, point) => {
      acc.joinSessions += point.joinSessions;
      acc.appStoreClicks += point.appStoreClicks;
      return acc;
    },
    { joinSessions: 0, appStoreClicks: 0 },
  );
}

export const metadata: Metadata = createPageMetadata({
  title: "Mon espace coach",
  description: "Dashboard acquisition coach BeFood avec funnel web-to-app et métriques fiables.",
  path: "/espace-coach",
  noIndex: true,
});

export default async function CoachDashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const [coach, acquisition] = await Promise.all([
    getCoachAccountSummary(user.id),
    getCoachAcquisitionDashboard(30),
  ]);

  if (!coach) {
    return (
      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
            <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Profil coach introuvable</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Ton compte est connecté, mais aucun profil coach n&apos;est associé pour le moment.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/candidature-coachs"
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)]"
              >
                Faire une demande coach
              </Link>
              <Link
                href="/profil"
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
              >
                Retour au profil
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const recentEvents = acquisition.recentEvents.slice(0, 8);
  const dailySeries = acquisition.daily;
  const last7Days = dailySeries.slice(-7);
  const totals7 = sumDaily(last7Days);

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 top-6 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0.06)_52%,rgba(16,185,129,0)_74%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16)_0%,rgba(56,189,248,0.06)_52%,rgba(56,189,248,0)_74%)]"
      />

      <Container className="relative max-w-6xl">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/96 p-6 shadow-[0_38px_90px_-52px_rgba(10,24,39,0.55)] sm:p-8">
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(236,250,245,0.8))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
              <h1 className="mt-1 font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">Cockpit acquisition</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                Vue opérationnelle de votre tunnel web-to-app: trafic coach, passage /join, clics App Store et signaux
                d&apos;acquisition déjà confirmés côté backend.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  Coach: {coach.businessName}
                </span>
                <span className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  Code: {coach.inviteCode ?? "Non défini"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Période observée</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                {formatDate(acquisition.rangeFrom)} au {formatDate(acquisition.rangeTo)}
              </p>
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                Données affichées: trafic web et acquisitions connues backend. Attribution finale post-install et revenus
                restent hors scope de cette phase.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">KPI principaux</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Sessions /join</p>
                <p className="mt-1 text-3xl font-bold leading-none text-[var(--color-ink)]">{acquisition.kpi.joinSessions}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Clics App Store</p>
                <p className="mt-1 text-3xl font-bold leading-none text-[var(--color-ink)]">{acquisition.kpi.appStoreClicks}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Acquisitions connues</p>
                <p className="mt-1 text-3xl font-bold leading-none text-[var(--color-ink)]">{acquisition.kpi.acquisitionsCoach}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Liens coach actifs</p>
                <p className="mt-1 text-3xl font-bold leading-none text-[var(--color-ink)]">{acquisition.kpi.activeLinkedUsers}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Funnel coach</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-5">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Trafic coach</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.funnel.trafficCoach}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Sessions /join</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.funnel.joinSessions}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Store clicks</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.funnel.storeClicks}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Acquisitions backend</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.funnel.acquisitionsKnownBackend}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Liens actifs</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.funnel.activeCoachLinks}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 xl:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Vue temporelle (7 jours)</p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">
                {totals7.joinSessions} sessions /join et {totals7.appStoreClicks} clics App Store
              </p>
              <div className="mt-3 space-y-2">
                {last7Days.length > 0 ? (
                  last7Days.map((point) => (
                    <div key={point.day} className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--color-ink)]">{formatDayLabel(point.day)}</span>
                        <span className="text-[var(--color-muted)]">{point.joinSessions} /join</span>
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--color-muted)]">{point.appStoreClicks} clics App Store</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">Aucune donnée quotidienne disponible.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Derniers événements /join</p>
              <div className="mt-2 space-y-2">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <div key={`${event.occurredAt}-${event.sessionStatus ?? "na"}`} className="rounded-xl border border-[var(--color-border)] bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--color-ink)]">{formatDateTime(event.occurredAt)}</p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            event.storeClicked
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {event.storeClicked ? "Store cliqué" : "Store non cliqué"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {event.utmSource ? `utm_source=${event.utmSource}` : "utm_source non renseigné"}
                        {event.utmMedium ? ` · utm_medium=${event.utmMedium}` : ""}
                        {event.ref ? ` · ref=${event.ref}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Session: {event.sessionStatus ?? "n/a"} · Reconciliation: {event.reconciliationStatus ?? "n/a"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">Aucun événement récent sur la période.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
