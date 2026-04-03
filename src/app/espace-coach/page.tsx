import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DossierCoachPanel } from "@/components/coach/dossier-coach-panel";
import { Container } from "@/components/ui/container";
import { getInitialContractStatusFromCoachRequestStatus, getMissingRequiredContractFields } from "@/lib/contract/internal-contract";
import {
  buildCoachOnboardingSteps,
  getCoachVisibleStatus,
  getStatusBadgeClass,
  normalizeCoachTab,
  type CoachSpaceTab,
} from "@/lib/coach/onboarding";
import { createPageMetadata } from "@/lib/seo";
import { getCoachAcquisitionDashboard } from "@/lib/supabase/coach-acquisition-dashboard";
import { getCoachAccountSummary } from "@/lib/supabase/coach-account";
import { getCoachRequestSummary } from "@/lib/supabase/coach-requests";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
const FRANCE_TIME_ZONE = "Europe/Paris";

const CHART_PERIOD_OPTIONS = [7, 14, 31, 90] as const;

function normalizeChartPeriod(input: string | null | undefined): 7 | 14 | 31 | 90 {
  const value = Number.parseInt(input ?? "", 10);
  if (value === 7 || value === 14 || value === 31 || value === 90) {
    return value;
  }
  return 31;
}

function normalizeChartType(input: string | null | undefined): "bar" | "line" {
  return input === "line" ? "line" : "bar";
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Non disponible";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FRANCE_TIME_ZONE,
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
    timeZone: FRANCE_TIME_ZONE,
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
    timeZone: FRANCE_TIME_ZONE,
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

function computeRate(numerator: number, denominator: number, minBase = 20): number | null {
  if (denominator < minBase) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}

export const metadata: Metadata = createPageMetadata({
  title: "Mon espace coach",
  description: "Dashboard acquisition coach BeFood avec funnel web-to-app et métriques fiables.",
  path: "/espace-coach",
  noIndex: true,
});

export default async function CoachDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ chartPeriod?: string; chartType?: string; tab?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const chartPeriod = normalizeChartPeriod(resolvedSearchParams.chartPeriod);
  const chartType = normalizeChartType(resolvedSearchParams.chartType);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const [coach, coachRequest, acquisitionSummary, acquisitionChart] = await Promise.all([
    getCoachAccountSummary(user.id),
    getCoachRequestSummary(user.id),
    getCoachAcquisitionDashboard(31),
    getCoachAcquisitionDashboard(chartPeriod),
  ]);
  const hasCoachSpace = Boolean(coach || coachRequest);

  if (!hasCoachSpace) {
    return (
      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
            <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Accès onboarding non initialisé</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Votre espace coach sera disponible dès l&apos;envoi de votre candidature.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/candidature-coachs"
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)]"
              >
                Envoyer une candidature
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

  const coachStatus = getCoachVisibleStatus(coach, coachRequest);
  const contractStatus = coachRequest?.contractStatus
    ?? (coachRequest ? getInitialContractStatusFromCoachRequestStatus(coachRequest.status) : "none");
  const contractMissingFields = coachRequest
    ? getMissingRequiredContractFields({
      coachFullName: coachRequest.contractCoachFullName ?? coachRequest.fullName,
      coachEmail: coachRequest.contractCoachEmail ?? user.email ?? null,
      coachStatus: coachRequest.contractCoachStatus,
      coachAddress: coachRequest.contractCoachAddress,
      coachRegistration: coachRequest.contractCoachRegistration,
      coachRegistrationStatus: coachRequest.contractRegistrationStatus,
    })
    : [];
  const shouldShowContractInfoCompletionCard = coachStatus.key === "contract_pending" && contractMissingFields.length > 0;
  const requestedTab = normalizeCoachTab(resolvedSearchParams.tab, coachStatus.key);
  const canAccessDashboard = coachStatus.key === "active";
  const activeTab = canAccessDashboard ? requestedTab : "dossier";
  const onboardingTabLabel = canAccessDashboard ? "Dossier coach" : "Mon espace";
  const onboardingSteps = buildCoachOnboardingSteps(coachStatus.key);

  const recentEvents = acquisitionSummary.recentEvents.slice(0, 5);
  const dailySeries = acquisitionChart.daily;
  const visibleDailySeries = dailySeries.slice(-chartPeriod);
  const totalsPeriod = sumDaily(visibleDailySeries);
  const periodDays = Math.max(1, visibleDailySeries.length);

  const funnelStages = [
    { label: "Sessions /join", value: acquisitionSummary.funnel.joinSessions },
    { label: "Clics App Store", value: acquisitionSummary.funnel.storeClicks },
    { label: "Acquisitions connues", value: acquisitionSummary.funnel.acquisitionsKnownBackend },
  ];

  const maxStageValue = Math.max(1, ...funnelStages.map((stage) => stage.value));
  const maxJoin = Math.max(1, ...dailySeries.map((point) => point.joinSessions));
  const maxStore = Math.max(1, ...dailySeries.map((point) => point.appStoreClicks));
  const chartMax = Math.max(1, maxJoin, maxStore);
  const chartWidth = 720;
  const chartHeight = 260;
  const chartPadding = { top: 16, right: 12, bottom: 40, left: 44 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const slotWidth = visibleDailySeries.length > 0 ? plotWidth / visibleDailySeries.length : plotWidth;
  const barWidth = Math.max(4, Math.min(10, slotWidth * 0.28));
  const labelEvery = visibleDailySeries.length <= 7 ? 1 : visibleDailySeries.length <= 14 ? 3 : 4;
  const yTicks = [0, 1, 2, 3, 4].map((tick) => Math.round((chartMax * tick) / 4)).reverse();
  const chartPoints = visibleDailySeries.map((point, index) => {
    const xCenter = chartPadding.left + index * slotWidth + slotWidth / 2;
    const joinY = chartPadding.top + plotHeight - (point.joinSessions / chartMax) * plotHeight;
    const storeY = chartPadding.top + plotHeight - (point.appStoreClicks / chartMax) * plotHeight;
    return { xCenter, joinY, storeY, point, index };
  });
  const joinPolyline = chartPoints.map((p) => `${p.xCenter},${p.joinY}`).join(" ");
  const storePolyline = chartPoints.map((p) => `${p.xCenter},${p.storeY}`).join(" ");

  const joinToStoreRate = computeRate(acquisitionSummary.funnel.storeClicks, acquisitionSummary.funnel.joinSessions);

  const dropJoinToStore = Math.max(0, acquisitionSummary.funnel.joinSessions - acquisitionSummary.funnel.storeClicks);
  const dropStoreToAcquisition = Math.max(
    0,
    acquisitionSummary.funnel.storeClicks - acquisitionSummary.funnel.acquisitionsKnownBackend,
  );
  const primaryDropStageLabel =
    dropJoinToStore >= dropStoreToAcquisition ? "Clics App Store" : "Acquisitions connues";

  const coachInitial = coach?.businessName.slice(0, 1).toUpperCase() ?? "C";
  const specialties = (coach?.specialties ?? []).filter((item): item is string => typeof item === "string").slice(0, 3);
  const latestObservedAt = recentEvents[0]?.occurredAt ?? acquisitionSummary.rangeTo ?? null;
  const coachEvents = recentEvents.filter(
    (event) => event.storeClicked || event.sessionStatus !== null || event.reconciliationStatus !== null,
  );
  const displayedEvents = (coachEvents.length > 0 ? coachEvents : recentEvents).slice(0, 4);
  const chartBasePath = "/espace-coach";
  const chartHref = (period: 7 | 14 | 31 | 90, type: "bar" | "line") => {
    const params = new URLSearchParams();
    params.set("tab", "dashboard");
    if (period !== 31) {
      params.set("chartPeriod", String(period));
    }
    if (type !== "bar") {
      params.set("chartType", type);
    }
    const query = params.toString();
    return query ? `${chartBasePath}?${query}` : chartBasePath;
  };
  const tabHref = (tab: CoachSpaceTab) => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (tab === "dashboard") {
      if (chartPeriod !== 31) {
        params.set("chartPeriod", String(chartPeriod));
      }
      if (chartType !== "bar") {
        params.set("chartType", chartType);
      }
    }
    return `${chartBasePath}?${params.toString()}`;
  };

  return (
    <section className="relative isolate overflow-hidden pb-9 pt-4 sm:pb-11 sm:pt-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.2)_0%,rgba(16,185,129,0.07)_55%,rgba(16,185,129,0)_78%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.1)_0%,rgba(14,165,233,0.03)_54%,rgba(14,165,233,0)_78%)]"
      />

      <Container className="relative max-w-6xl space-y-3.5">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-4 shadow-[0_30px_80px_-48px_rgba(10,24,39,0.5)] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Mon espace coach</p>
              <h1 className="mt-1 font-display text-2xl text-[var(--color-ink)] sm:text-3xl">Pilotage et parcours coach</h1>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Suivez votre avancement onboarding et vos performances au même endroit.
              </p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(coachStatus.tone)}`}>
              Statut: {coachStatus.label}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={tabHref("dossier")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === "dossier"
                  ? "bg-[var(--color-ink)] text-white"
                  : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
              }`}
            >
              {onboardingTabLabel}
            </Link>
            {canAccessDashboard ? (
              <Link
                href={tabHref("dashboard")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeTab === "dashboard"
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                }`}
              >
                Dashboard
              </Link>
            ) : null}
          </div>
        </div>

        {activeTab === "dashboard" ? (
          !coach ? (
            <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Dashboard coach</p>
              <h2 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Activation en cours</h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Le dashboard complet sera disponible une fois votre profil coach finalisé et activé.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={tabHref("dossier")}
                  className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)]"
                >
                  Voir mon dossier coach
                </Link>
                <Link
                  href="/candidature-coachs"
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                >
                  Candidater
                </Link>
              </div>
            </div>
          ) : (
            <>
        <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white/96 shadow-[0_44px_110px_-56px_rgba(10,24,39,0.6)]">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="border-b border-[var(--color-border)] p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">Espace coach</p>
              <h1 className="mt-2 text-balance font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
                Cockpit acquisition
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">Vue claire des volumes, du funnel et de la friction principale.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  {coach.businessName}
                </span>
                {coach.isVerified ? (
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Coach vérifié
                  </span>
                ) : null}
                {coach.inviteCode ? (
                  <span className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                    Code: {coach.inviteCode}
                  </span>
                ) : null}
              </div>

            </div>

            <aside className="bg-[linear-gradient(180deg,rgba(244,250,247,0.95),rgba(233,244,239,0.9))] p-4 sm:p-6">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-base font-bold text-white"
                    style={
                      coach.imageUrl
                        ? {
                            backgroundImage: `linear-gradient(rgba(15,23,42,0.1), rgba(15,23,42,0.1)), url(${coach.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {coach.imageUrl ? "" : coachInitial}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Période observée</p>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {formatDate(acquisitionSummary.rangeFrom)} au {formatDate(acquisitionSummary.rangeTo)}
                    </p>
                  </div>
                </div>

                {specialties.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink)]"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">
                  Dernière activité observée: {formatDateTime(latestObservedAt)}.
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--color-muted)]">
                  Résumé global recentré sur les 31 derniers jours.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,1),rgba(237,249,244,0.9))] p-4 shadow-[0_20px_46px_-34px_rgba(10,24,39,0.62)]">
            <p className="text-xs text-[var(--color-muted)]">Clics App Store</p>
            <p className="mt-1 text-4xl font-bold leading-none text-[var(--color-ink)]">{acquisitionSummary.kpi.appStoreClicks}</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs text-[var(--color-muted)]">Sessions /join</p>
            <p className="mt-1 text-3xl font-bold leading-none text-[var(--color-ink)]">{acquisitionSummary.kpi.joinSessions}</p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs text-[var(--color-muted)]">Acquisitions connues</p>
            <p className="mt-1 text-3xl font-bold leading-none text-[var(--color-ink)]">{acquisitionSummary.kpi.acquisitionsCoach}</p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Funnel séquentiel coach</p>
              <p className="text-xs text-[var(--color-muted)]">Étapes strictement séquentielles</p>
            </div>
            <div className="mt-4 space-y-3">
              {funnelStages.map((stage, index) => {
                const prevValue = index > 0 ? funnelStages[index - 1]?.value ?? 0 : 0;
                const progression = index > 0 ? computeRate(stage.value, prevValue, 1) : null;
                const drop = index > 0 ? Math.max(0, prevValue - stage.value) : null;
                const overflow = index > 0 ? Math.max(0, stage.value - prevValue) : null;
                const isPrimaryDropStage = index > 0 && stage.label === primaryDropStageLabel;

                return (
                  <div
                    key={stage.label}
                    className={`rounded-2xl border p-3 ${
                      isPrimaryDropStage
                        ? "border-[var(--color-accent)] bg-[linear-gradient(150deg,rgba(255,255,255,0.98),rgba(236,250,245,0.88))]"
                        : "border-[var(--color-border)] bg-[var(--color-panel)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{stage.label}</p>
                      <p className="text-lg font-bold text-[var(--color-ink)]">{stage.value}</p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),#22d3ee)]"
                        style={{ width: `${Math.max(6, Math.round((stage.value / maxStageValue) * 100))}%` }}
                      />
                    </div>
                    {index > 0 ? (
                      <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                        {progression !== null ? `${progression}%` : "n/a"} de l&apos;étape précédente
                        {drop && drop > 0 ? ` · perte: ${drop}` : ""}
                        {overflow && overflow > 0 ? ` · écart d'attribution: +${overflow}` : ""}
                        {isPrimaryDropStage ? " · friction dominante" : ""}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Vue business</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <p className="text-xs text-[var(--color-muted)]">/join vers App Store</p>
                  <p className="mt-1 text-xl font-bold text-[var(--color-ink)]">
                    {joinToStoreRate === null ? "Volume insuffisant" : `${joinToStoreRate}%`}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                  <p className="text-xs text-[var(--color-muted)]">Acquisitions connues</p>
                  <p className="mt-1 text-xl font-bold text-[var(--color-ink)]">{acquisitionSummary.kpi.acquisitionsCoach}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 sm:col-span-2">
                  <p className="text-xs text-[var(--color-muted)]">Patients actifs</p>
                  <p className="mt-1 text-xl font-bold text-[var(--color-ink)]">{acquisitionSummary.kpi.activeLinkedUsers}</p>
                  <p className="mt-1 text-[11px] text-[var(--color-muted)]">Patients actuellement rattachés à votre suivi coach.</p>
                </div>
              </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Exploration temporelle</p>
              <div className="flex flex-wrap gap-1.5">
                {CHART_PERIOD_OPTIONS.map((option) => (
                  <Link
                    key={option}
                    href={chartHref(option, chartType)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      chartPeriod === option
                        ? "bg-[var(--color-accent)] text-white"
                        : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                    }`}
                  >
                    {option}j
                  </Link>
                ))}
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-full border border-dashed border-[var(--color-border)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted)]"
                  title="Personnalisé nécessite une plage de dates dédiée côté data."
                >
                  Personnalisé
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link
                href={chartHref(chartPeriod, "bar")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  chartType === "bar"
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                }`}
              >
                Barres
              </Link>
              <Link
                href={chartHref(chartPeriod, "line")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  chartType === "line"
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
                }`}
              >
                Courbe
              </Link>
            </div>
            <p className="mt-1 text-sm text-[var(--color-ink)]">
              Sur {periodDays} jours: {totalsPeriod.joinSessions} sessions /join et {totalsPeriod.appStoreClicks} clics App Store.
            </p>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                Sessions /join
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Clics App Store
              </span>
            </div>
            <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
              {visibleDailySeries.length > 0 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[18.5rem] w-full" role="img" aria-label="Évolution des sessions /join et des clics App Store">
                  {yTicks.map((tick) => {
                    const y = chartPadding.top + ((chartMax - tick) / chartMax) * plotHeight;
                    return (
                      <g key={tick}>
                        <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke="rgba(15,23,42,0.12)" strokeWidth="1" />
                        <text x={chartPadding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(71,85,105,0.95)">
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={chartPadding.left}
                    x2={chartWidth - chartPadding.right}
                    y1={chartPadding.top + plotHeight}
                    y2={chartPadding.top + plotHeight}
                    stroke="rgba(15,23,42,0.2)"
                    strokeWidth="1.2"
                  />

                  {chartType === "line" ? (
                    <>
                      <polyline fill="none" stroke="var(--color-accent)" strokeWidth="2.25" points={joinPolyline} />
                      <polyline fill="none" stroke="rgb(56 189 248)" strokeWidth="2.25" points={storePolyline} />
                      {chartPoints.map(({ xCenter, joinY, storeY, point, index }) => {
                        const showLabel =
                          index === 0 || index === chartPoints.length - 1 || index % labelEvery === 0;
                        return (
                          <g key={point.day}>
                            <circle cx={xCenter} cy={joinY} r="2.6" fill="var(--color-accent)">
                              <title>{`${formatDayLabel(point.day)}: ${point.joinSessions} sessions /join`}</title>
                            </circle>
                            <circle cx={xCenter} cy={storeY} r="2.6" fill="rgb(56 189 248)">
                              <title>{`${formatDayLabel(point.day)}: ${point.appStoreClicks} clics App Store`}</title>
                            </circle>
                            {showLabel ? (
                              <text
                                x={xCenter}
                                y={chartPadding.top + plotHeight + 14}
                                textAnchor="middle"
                                fontSize="10"
                                fill="rgba(100,116,139,0.95)"
                              >
                                {formatDayLabel(point.day)}
                              </text>
                            ) : null}
                          </g>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {chartPoints.map(({ xCenter, point, index }) => {
                        const joinHeight = Math.max(2, (point.joinSessions / chartMax) * plotHeight);
                        const storeHeight = Math.max(2, (point.appStoreClicks / chartMax) * plotHeight);
                        const joinY = chartPadding.top + plotHeight - joinHeight;
                        const storeY = chartPadding.top + plotHeight - storeHeight;
                        const showLabel =
                          index === 0 || index === chartPoints.length - 1 || index % labelEvery === 0;

                        return (
                          <g key={point.day}>
                            <rect
                              x={xCenter - barWidth - 1}
                              y={joinY}
                              width={barWidth}
                              height={joinHeight}
                              rx="2"
                              fill="var(--color-accent)"
                            >
                              <title>{`${formatDayLabel(point.day)}: ${point.joinSessions} sessions /join`}</title>
                            </rect>
                            <rect
                              x={xCenter + 1}
                              y={storeY}
                              width={barWidth}
                              height={storeHeight}
                              rx="2"
                              fill="rgb(56 189 248)"
                            >
                              <title>{`${formatDayLabel(point.day)}: ${point.appStoreClicks} clics App Store`}</title>
                            </rect>
                            {showLabel ? (
                              <text
                                x={xCenter}
                                y={chartPadding.top + plotHeight + 14}
                                textAnchor="middle"
                                fontSize="10"
                                fill="rgba(100,116,139,0.95)"
                              >
                                {formatDayLabel(point.day)}
                              </text>
                            ) : null}
                          </g>
                        );
                      })}
                    </>
                  )}
                </svg>
              ) : (
                <p className="text-xs text-[var(--color-muted)]">Aucune donnée quotidienne disponible.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-border)] bg-white/96 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Signaux récents coach</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">Ce qui s&apos;est passé, quand et d&apos;où. Le détail technique reste secondaire.</p>
            <div className="mt-3 max-h-[17rem] space-y-1.5 overflow-y-auto pr-1">
              {displayedEvents.length > 0 ? (
                displayedEvents.map((event) => {
                  const source = [event.utmSource, event.utmMedium].filter(Boolean).join(" / ");
                  const showSource = source.length > 0 && !/test|local/i.test(source);
                  const reconciliation = event.reconciliationStatus?.toLowerCase() ?? "";
                  const isConfirmed = reconciliation.includes("matched") || reconciliation.includes("confirm");
                  const eventLabel = isConfirmed
                    ? "Acquisition confirmée"
                    : event.storeClicked
                      ? "Passage vers App Store détecté"
                      : "Session /join sans clic App Store";

                  return (
                    <div
                      key={`${event.occurredAt}-${event.sessionStatus ?? "na"}`}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold leading-none text-[var(--color-ink)]">{eventLabel}</p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-800"
                              : event.storeClicked
                                ? "bg-sky-100 text-sky-800"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isConfirmed ? "Confirmé" : event.storeClicked ? "Action détectée" : "À optimiser"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-[var(--color-ink)]">{formatDateTime(event.occurredAt)}</p>
                      {showSource ? <p className="text-[11px] leading-5 text-[var(--color-muted)]">Source: {source}</p> : null}

                      <details className="mt-1">
                        <summary className="cursor-pointer text-[11px] font-semibold text-[var(--color-muted)]">Détails techniques</summary>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--color-muted)]">
                          session={event.sessionStatus ?? "n/a"} · reconciliation={event.reconciliationStatus ?? "n/a"}
                          {event.ref ? ` · ref=${event.ref}` : ""}
                        </p>
                      </details>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[var(--color-muted)]">Aucun événement récent sur la période.</p>
              )}
            </div>
          </div>
        </div>
            </>
          )
        ) : (
            <DossierCoachPanel
              onboardingSteps={onboardingSteps}
              coachStatus={coachStatus}
              coachMessage={coachRequest?.coachMessage ?? null}
              contractStatus={contractStatus}
              showContractInfoCompletionCard={shouldShowContractInfoCompletionCard}
            />
        )}
      </Container>
    </section>
  );
}
