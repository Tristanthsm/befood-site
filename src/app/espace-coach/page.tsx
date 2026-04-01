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
    <section className="py-12 sm:py-16">
      <Container className="max-w-5xl">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
            <h1 className="font-display text-3xl text-[var(--color-ink)]">Dashboard acquisition</h1>
            <p className="text-sm text-[var(--color-muted)]">
              Vue simple de ton funnel web-to-app avec les données fiables disponibles aujourd&apos;hui.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Nom affiché</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{coach.businessName}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Code coach</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{coach.inviteCode ?? "Non défini"}</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Période affichée</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
              {formatDate(acquisition.rangeFrom)} au {formatDate(acquisition.rangeTo)}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">KPI principaux</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Sessions /join</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.kpi.joinSessions}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Clics App Store</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.kpi.appStoreClicks}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Acquisitions connues</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.kpi.acquisitionsCoach}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs text-[var(--color-muted)]">Liens coach actifs</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-ink)]">{acquisition.kpi.activeLinkedUsers}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Funnel coach</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Trafic coach</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-ink)]">{acquisition.funnel.trafficCoach}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Sessions /join</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-ink)]">{acquisition.funnel.joinSessions}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Store clicks</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-ink)]">{acquisition.funnel.storeClicks}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Acquisitions backend</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-ink)]">{acquisition.funnel.acquisitionsKnownBackend}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs text-[var(--color-muted)]">Liens actifs</p>
                <p className="mt-1 text-lg font-bold text-[var(--color-ink)]">{acquisition.funnel.activeCoachLinks}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Vue temporelle (7 jours)</p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">
                {totals7.joinSessions} sessions /join et {totals7.appStoreClicks} clics App Store
              </p>
              <div className="mt-3 space-y-1.5">
                {last7Days.length > 0 ? (
                  last7Days.map((point) => (
                    <div key={point.day} className="flex items-center justify-between text-xs text-[var(--color-ink)]">
                      <span>{formatDayLabel(point.day)}</span>
                      <span>
                        {point.joinSessions} /join · {point.appStoreClicks} store
                      </span>
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
                      <p className="text-xs font-semibold text-[var(--color-ink)]">{formatDateTime(event.occurredAt)}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {event.utmSource ? `utm_source=${event.utmSource}` : "utm_source non renseigné"}
                        {event.utmMedium ? ` · utm_medium=${event.utmMedium}` : ""}
                        {event.ref ? ` · ref=${event.ref}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Store: {event.storeClicked ? "oui" : "non"} · Session: {event.sessionStatus ?? "n/a"} · Reconciliation:{" "}
                        {event.reconciliationStatus ?? "n/a"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">Aucun événement récent sur la période.</p>
                )}
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-[var(--color-muted)]">
            Données affichées: trafic web et acquisitions connues backend. Attribution finale post-install et revenus
            restent hors scope de cette phase.
          </p>
        </div>
      </Container>
    </section>
  );
}
