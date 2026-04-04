import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Container } from "@/components/ui/container";
import { getAdminAccessContext } from "@/lib/admin/auth";
import type { QualityStatus } from "@/lib/admin/conversion-dashboard";
import { getAdminConversionDashboard, normalizeAdminConversionPeriod } from "@/lib/admin/conversion-dashboard";
import { createPageMetadata } from "@/lib/seo";

export const runtime = "nodejs";
const FRANCE_TIME_ZONE = "Europe/Paris";
const PERIOD_OPTIONS = [7, 14, 30, 90] as const;
const TIMELINE_PREVIEW_DAYS = 14;

function formatDateTime(value: string) {
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

function formatDateShort(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FRANCE_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatRate(value: number | null) {
  if (value === null) {
    return "n/a";
  }
  return `${value.toFixed(1)}%`;
}

function formatDelta(value: number | null) {
  if (value === null) {
    return "n/a";
  }
  if (value === 0) {
    return "0";
  }
  return value > 0 ? `+${value}` : String(value);
}

function computeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 1000) / 10));
}

function qualityLabel(status: QualityStatus) {
  if (status === "aligne") {
    return "Aligné";
  }
  if (status === "surveiller") {
    return "À surveiller";
  }
  if (status === "investiguer") {
    return "À investiguer";
  }
  return "Indisponible";
}

function qualityClassName(status: QualityStatus) {
  if (status === "aligne") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (status === "surveiller") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  if (status === "investiguer") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function barWidth(value: number, maxValue: number) {
  if (value <= 0 || maxValue <= 0) {
    return "0%";
  }
  return `${Math.max(6, Math.round((value / maxValue) * 100))}%`;
}

export const metadata: Metadata = createPageMetadata({
  title: "Admin conversion",
  description: "Pilotage conversion BeFood: BF interne, GA4, PostHog et attribution par acteur.",
  path: "/admin/conversion",
  noIndex: true,
});

export default async function AdminConversionPage({
  searchParams,
}: {
  searchParams?: Promise<{ days?: string }>;
}) {
  const access = await getAdminAccessContext();
  if (!access.isAuthenticated) {
    redirect("/connexion");
  }
  if (!access.isAdmin) {
    redirect("/profil");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const days = normalizeAdminConversionPeriod(resolvedSearchParams.days);

  const dashboard = await getAdminConversionDashboard(String(days)).catch((error) => {
    console.error("[admin-conversion] unable to load dashboard", error);
    return null;
  });

  if (!dashboard) {
    return (
      <section className="py-10 sm:py-14">
        <Container className="max-w-7xl space-y-4">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            Impossible de charger la vue conversion pour le moment.
          </div>
        </Container>
      </section>
    );
  }

  const ga4PageViews = dashboard.ga4.trackedEvents.find((event) => event.eventName === "page_view")?.eventCount ?? 0;
  const ga4JoinStarts = dashboard.ga4.trackedEvents.find((event) => event.eventName === "bf_join_flow_started")?.eventCount ?? 0;

  const signupCount = dashboard.postInstall.totals.signupCompleted;
  const onboardingCount = dashboard.postInstall.totals.onboardingCompleted;
  const activationCount = Math.max(dashboard.postInstall.totals.activationCompleted, dashboard.bf.totals.acquisitionsBackend);

  const funnelSteps = [
    {
      key: "web_visits",
      label: "Visites web",
      value: ga4PageViews,
      source: "GA4",
      rate: null as number | null,
    },
    {
      key: "join_started",
      label: "Entrées funnel",
      value: ga4JoinStarts > 0 ? ga4JoinStarts : dashboard.bf.totals.joinSessions,
      source: ga4JoinStarts > 0 ? "GA4" : "BF",
      rate: computeRate(ga4JoinStarts > 0 ? ga4JoinStarts : dashboard.bf.totals.joinSessions, ga4PageViews),
    },
    {
      key: "store_clicks",
      label: "Clics store",
      value: dashboard.bf.totals.appStoreClicks,
      source: "BF",
      rate: computeRate(dashboard.bf.totals.appStoreClicks, ga4JoinStarts > 0 ? ga4JoinStarts : dashboard.bf.totals.joinSessions),
    },
    {
      key: "signup",
      label: "Signups",
      value: signupCount,
      source: "PostHog",
      rate: computeRate(signupCount, dashboard.bf.totals.appStoreClicks),
    },
    {
      key: "onboarding",
      label: "Onboarding complété",
      value: onboardingCount,
      source: "PostHog",
      rate: computeRate(onboardingCount, signupCount),
    },
    {
      key: "activation",
      label: "Activations",
      value: activationCount,
      source: dashboard.bf.totals.acquisitionsBackend >= dashboard.postInstall.totals.activationCompleted ? "BF" : "PostHog",
      rate: computeRate(activationCount, onboardingCount),
    },
  ];

  const timelineDays = dashboard.timeline.days.slice(-Math.min(TIMELINE_PREVIEW_DAYS, dashboard.timeline.days.length));
  const maxJoin = Math.max(0, ...timelineDays.map((entry) => entry.joinStarted));
  const maxStore = Math.max(0, ...timelineDays.map((entry) => entry.storeClicks));
  const maxSignup = Math.max(0, ...timelineDays.map((entry) => entry.signupCompleted));
  const maxActivation = Math.max(0, ...timelineDays.map((entry) => entry.activationCompleted));

  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-7xl space-y-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Admin</p>
          <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">Conversion & Analytics</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Cockpit unifié BeFood: acquisition web, post-install app, et vérité business finale.
          </p>
          <div className="mt-4">
            <AdminNavigation active="conversion" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <Link
                key={option}
                href={option === 30 ? "/admin/conversion" : `/admin/conversion?days=${option}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  days === option
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                }`}
              >
                {option} jours
              </Link>
            ))}
          </div>
        </div>

        {dashboard.notes.length > 0 ? (
          <div className="space-y-2 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            {dashboard.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        ) : null}

        <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Funnel unifié Site → App</h2>
            <p className="text-xs text-[var(--color-muted)]">Chaque étape affiche sa source principale (GA4, PostHog ou BF).</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
            {funnelSteps.map((step) => (
              <div key={step.key} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">{step.label}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">{step.value}</p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--color-muted)]">
                  <span>Source: {step.source}</span>
                  <span>{step.rate === null ? "—" : `${step.rate.toFixed(1)}%`}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Post-install (PostHog)</h2>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                dashboard.posthog.available
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
              >
                {dashboard.posthog.available ? "Connecté" : "Indisponible"}
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">signup_completed</p>
                <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.postInstall.totals.signupCompleted}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">onboarding_completed</p>
                <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.postInstall.totals.onboardingCompleted}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">activation_completed</p>
                <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.postInstall.totals.activationCompleted}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Store → Signup</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{formatRate(dashboard.postInstall.rates.storeToSignup)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Signup → Onboarding</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{formatRate(dashboard.postInstall.rates.signupToOnboarding)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Onboarding → Activation</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{formatRate(dashboard.postInstall.rates.onboardingToActivation)}</p>
              </div>
            </div>
            {!dashboard.posthog.available && dashboard.posthog.error ? (
              <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {dashboard.posthog.error}
              </p>
            ) : null}
          </article>

          <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Tendance journalière (14 derniers jours)</h2>
              <span className="text-xs text-[var(--color-muted)]">Join / Store / Signup / Activation</span>
            </div>
            <div className="mt-3 space-y-2">
              {timelineDays.length === 0 ? (
                <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-3 text-sm text-[var(--color-muted)]">
                  Données journalières indisponibles sur la période.
                </p>
              ) : (
                timelineDays.map((entry) => (
                  <div key={entry.day} className="rounded-2xl border border-[var(--color-border)] px-3 py-2">
                    <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
                      <span>{formatDateShort(entry.day)}</span>
                      <span>J:{entry.joinStarted} · S:{entry.storeClicks} · SU:{entry.signupCompleted} · A:{entry.activationCompleted}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-slate-800" style={{ width: barWidth(entry.joinStarted, maxJoin) }} />
                      </div>
                      <div className="h-1.5 rounded-full bg-emerald-100">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: barWidth(entry.storeClicks, maxStore) }} />
                      </div>
                      <div className="h-1.5 rounded-full bg-violet-100">
                        <div className="h-1.5 rounded-full bg-violet-500" style={{ width: barWidth(entry.signupCompleted, maxSignup) }} />
                      </div>
                      <div className="h-1.5 rounded-full bg-amber-100">
                        <div className="h-1.5 rounded-full bg-amber-500" style={{ width: barWidth(entry.activationCompleted, maxActivation) }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Qualité des données</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
              <p className="text-xs text-[var(--color-muted)]">Delta join BF vs GA4</p>
              <p className="text-lg font-semibold text-[var(--color-ink)]">{formatDelta(dashboard.comparison.joinStartsDelta)}</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${qualityClassName(dashboard.quality.joinDeltaStatus)}`}>
                {qualityLabel(dashboard.quality.joinDeltaStatus)}
              </span>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
              <p className="text-xs text-[var(--color-muted)]">Delta store BF vs GA4</p>
              <p className="text-lg font-semibold text-[var(--color-ink)]">{formatDelta(dashboard.comparison.appStoreClicksDelta)}</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${qualityClassName(dashboard.quality.storeDeltaStatus)}`}>
                {qualityLabel(dashboard.quality.storeDeltaStatus)}
              </span>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
              <p className="text-xs text-[var(--color-muted)]">Couverture attribution BF</p>
              <p className="text-lg font-semibold text-[var(--color-ink)]">{formatRate(dashboard.quality.attributionCoverage)}</p>
              <p className="text-xs text-[var(--color-muted)]">Sessions attribuées / sessions join</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
              <p className="text-xs text-[var(--color-muted)]">Santé PostHog</p>
              <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.posthog.available ? "OK" : "N/A"}</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${qualityClassName(dashboard.quality.posthogStatus)}`}>
                {qualityLabel(dashboard.quality.posthogStatus)}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Période observée: {formatDateTime(dashboard.range.from)} → {formatDateTime(dashboard.range.to)}.
          </p>
        </article>

        <div className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Source BF interne
              </h2>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                {dashboard.bf.source === "rpc" ? "Mode SQL agrégé" : "Mode fallback"}
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Sessions /join</p>
                <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.bf.totals.joinSessions}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Clics App Store</p>
                <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.bf.totals.appStoreClicks}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Acquisitions backend</p>
                <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.bf.totals.acquisitionsBackend}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Sessions attribuées</p>
                <p className="text-lg font-semibold text-[var(--color-ink)]">{dashboard.bf.totals.attributedSessions}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Taux /join → store</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{formatRate(dashboard.bf.rates.joinToStore)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Taux store → acquisition</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{formatRate(dashboard.bf.rates.storeToAcquisition)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] px-3 py-2">
                <p className="text-xs text-[var(--color-muted)]">Part attribuée</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{formatRate(dashboard.bf.rates.attributedShare)}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Source GA4 API
              </h2>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                dashboard.ga4.available
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
              >
                {dashboard.ga4.available ? "Connecté" : "Indisponible"}
              </span>
            </div>
            <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
              <p className="text-xs text-[var(--color-muted)]">Utilisateurs actifs realtime</p>
              <p className="text-lg font-semibold text-[var(--color-ink)]">
                {dashboard.ga4.realtimeActiveUsers ?? "n/a"}
              </p>
            </div>
            {!dashboard.ga4.available && dashboard.ga4.error ? (
              <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {dashboard.ga4.error}
              </p>
            ) : null}
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    <th className="px-2 py-2 font-semibold">Event</th>
                    <th className="px-2 py-2 font-semibold">Volume période</th>
                    <th className="px-2 py-2 font-semibold">Key event</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.ga4.trackedEvents.map((event) => (
                    <tr key={event.eventName} className="border-b border-[var(--color-border)] text-sm text-[var(--color-ink)]">
                      <td className="px-2 py-2 font-medium">{event.eventName}</td>
                      <td className="px-2 py-2">{event.eventCount}</td>
                      <td className="px-2 py-2">{event.isKeyEvent ? "Oui" : "Non"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Attribution acteurs (coach / créateur)</h2>
            <span className="text-xs text-[var(--color-muted)]">Top activité sur la période</span>
          </div>
          {dashboard.bf.actors.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-3 text-sm text-[var(--color-muted)]">
              Aucun acteur actif sur la période ou mode fallback sans agrégation par acteur.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)] text-left text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    <th className="px-2 py-2 font-semibold">Acteur</th>
                    <th className="px-2 py-2 font-semibold">Type</th>
                    <th className="px-2 py-2 font-semibold">Sessions</th>
                    <th className="px-2 py-2 font-semibold">Store clicks</th>
                    <th className="px-2 py-2 font-semibold">Acq backend</th>
                    <th className="px-2 py-2 font-semibold">Taux J→S</th>
                    <th className="px-2 py-2 font-semibold">Taux S→A</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.bf.actors.map((actor) => (
                    <tr key={actor.userId} className="border-b border-[var(--color-border)] text-sm text-[var(--color-ink)]">
                      <td className="px-2 py-2">
                        <p className="font-semibold">{actor.businessName}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {actor.inviteCode ? `Code: ${actor.inviteCode}` : "Code indisponible"}
                        </p>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          actor.profileType === "createur"
                            ? "border-violet-200 bg-violet-50 text-violet-800"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}
                        >
                          {actor.profileType === "createur" ? "Créateur" : "Coach"}
                        </span>
                      </td>
                      <td className="px-2 py-2">{actor.joinSessions}</td>
                      <td className="px-2 py-2">{actor.appStoreClicks}</td>
                      <td className="px-2 py-2">{actor.acquisitionsBackend}</td>
                      <td className="px-2 py-2">{formatRate(actor.joinToStoreRate)}</td>
                      <td className="px-2 py-2">{formatRate(actor.storeToAcquisitionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </Container>
    </section>
  );
}
