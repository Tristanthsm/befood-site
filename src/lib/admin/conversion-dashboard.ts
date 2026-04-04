import "server-only";

import { listConversionEvents, listEventsByDateRange, runRealtimeReport } from "@/lib/analytics/ga4-api";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const TRACKED_GA4_EVENTS = [
  "page_view",
  "bf_marketing_page_view",
  "bf_cta_click",
  "bf_join_flow_started",
  "bf_app_store_cta_click",
] as const;

const TRACKED_POSTHOG_SIGNUP_EVENTS = ["signup_completed"] as const;
const TRACKED_POSTHOG_ONBOARDING_EVENTS = ["onboarding_completed"] as const;
const TRACKED_POSTHOG_ACTIVATION_EVENTS = ["activation_completed", "activation_complete"] as const;
const TRACKED_POSTHOG_WEB_EVENTS = [
  "page_view",
  "$pageview",
  "bf_marketing_page_view",
  "bf_join_flow_started",
  "bf_app_store_cta_click",
] as const;
const TRACKED_POSTHOG_DIAGNOSTIC_EVENTS = [
  "deep_link_processed",
  "acquisition_sync_triggered",
  "acquisition_sync_result",
] as const;
const TRACKED_POSTHOG_PRODUCT_EVENTS = [
  ...TRACKED_POSTHOG_SIGNUP_EVENTS,
  ...TRACKED_POSTHOG_ONBOARDING_EVENTS,
  ...TRACKED_POSTHOG_ACTIVATION_EVENTS,
] as const;
const TRACKED_POSTHOG_EVENTS = Array.from(
  new Set([
    ...TRACKED_POSTHOG_PRODUCT_EVENTS,
    ...TRACKED_POSTHOG_WEB_EVENTS,
    ...TRACKED_POSTHOG_DIAGNOSTIC_EVENTS,
  ]),
);

type SupportedPeriod = 7 | 14 | 30 | 90;
type ActorProfileType = "coach" | "createur";
export type QualityStatus = "aligne" | "surveiller" | "investiguer" | "indisponible";

export interface AdminConversionActor {
  userId: string;
  businessName: string;
  inviteCode: string | null;
  email: string | null;
  profileType: ActorProfileType;
  joinSessions: number;
  appStoreClicks: number;
  attributedSessions: number;
  acquisitionsBackend: number;
  joinToStoreRate: number | null;
  storeToAcquisitionRate: number | null;
}

export interface AdminConversionDashboardData {
  range: {
    from: string;
    to: string;
    days: SupportedPeriod;
  };
  bf: {
    source: "rpc" | "fallback";
    totals: {
      joinSessions: number;
      appStoreClicks: number;
      attributedSessions: number;
      sessionsWithCoachCode: number;
      sessionsWithoutActorMatch: number;
      acquisitionsBackend: number;
    };
    rates: {
      joinToStore: number | null;
      storeToAcquisition: number | null;
      attributedShare: number | null;
    };
    actors: AdminConversionActor[];
  };
  ga4: {
    available: boolean;
    realtimeActiveUsers: number | null;
    trackedEvents: Array<{
      eventName: string;
      eventCount: number;
      isKeyEvent: boolean;
    }>;
    error: string | null;
  };
  posthog: {
    available: boolean;
    source: "api" | "unavailable";
    totals: {
      signupCompleted: number;
      onboardingCompleted: number;
      activationCompleted: number;
    };
    webTotals: {
      pageView: number;
      marketingPageView: number;
      joinFlowStarted: number;
      appStoreCtaClick: number;
    };
    diagnostics: {
      deepLinkProcessed: number;
      acquisitionSyncTriggered: number;
      acquisitionSyncResult: number;
    };
    error: string | null;
  };
  postInstall: {
    totals: {
      signupCompleted: number;
      onboardingCompleted: number;
      activationCompleted: number;
    };
    rates: {
      storeToSignup: number | null;
      signupToOnboarding: number | null;
      onboardingToActivation: number | null;
    };
  };
  timeline: {
    days: Array<{
      day: string;
      joinStarted: number;
      storeClicks: number;
      signupCompleted: number;
      activationCompleted: number;
    }>;
  };
  comparison: {
    appStoreClicksDelta: number | null;
    joinStartsDelta: number | null;
  };
  quality: {
    joinDeltaStatus: QualityStatus;
    storeDeltaStatus: QualityStatus;
    posthogStatus: QualityStatus;
    posthogWebStatus: QualityStatus;
    attributionCoverage: number | null;
  };
  notes: string[];
}

interface BfRpcActorRaw {
  user_id?: unknown;
  business_name?: unknown;
  invite_code?: unknown;
  email?: unknown;
  profile_type?: unknown;
  join_sessions?: unknown;
  app_store_clicks?: unknown;
  attributed_sessions?: unknown;
  acquisitions_backend?: unknown;
}

interface BfRpcPayload {
  authorized?: unknown;
  range?: {
    from?: unknown;
    to?: unknown;
  };
  totals?: {
    join_sessions?: unknown;
    app_store_clicks?: unknown;
    attributed_sessions?: unknown;
    sessions_with_coach_code?: unknown;
    sessions_without_actor_match?: unknown;
    acquisitions_backend?: unknown;
  };
  actors?: BfRpcActorRaw[];
}

interface PosthogQueryResponse {
  results?: unknown[];
  columns?: unknown[];
}

function normalizePeriod(value: string | null | undefined): SupportedPeriod {
  const parsed = Number.parseInt(value ?? "", 10);
  if (parsed === 7 || parsed === 14 || parsed === 30 || parsed === 90) {
    return parsed;
  }
  return 30;
}

export function normalizeAdminConversionPeriod(input: string | null | undefined) {
  return normalizePeriod(input);
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toInteger(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }
  return 0;
}

function computeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 1000) / 10));
}

function computeDeltaStatus(delta: number | null, reference: number): QualityStatus {
  if (delta === null) {
    return "indisponible";
  }

  const base = Math.max(1, reference);
  const ratio = Math.abs(delta) / base;

  if (ratio <= 0.15) {
    return "aligne";
  }
  if (ratio <= 0.35) {
    return "surveiller";
  }
  return "investiguer";
}

function computeCoverageStatus(posthogCount: number, referenceCount: number, available: boolean): QualityStatus {
  if (!available) {
    return "indisponible";
  }
  if (referenceCount <= 0) {
    return posthogCount > 0 ? "aligne" : "surveiller";
  }
  if (posthogCount <= 0) {
    return "investiguer";
  }

  const ratio = posthogCount / referenceCount;
  if (ratio >= 0.35) {
    return "aligne";
  }
  if (ratio >= 0.15) {
    return "surveiller";
  }
  return "investiguer";
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function buildDayKeys(fromIso: string, toIso: string): string[] {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return [];
  }

  const days: string[] = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));

  while (cursor < end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function isRpcFunctionMissing(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }
  const message = String((error as { message?: unknown }).message ?? "");
  const code = String((error as { code?: unknown }).code ?? "");
  return message.includes("get_admin_conversion_dashboard") || code === "PGRST202" || code === "42883";
}

function parseRpcActor(raw: BfRpcActorRaw): AdminConversionActor {
  const joinSessions = toInteger(raw.join_sessions);
  const appStoreClicks = toInteger(raw.app_store_clicks);
  const acquisitionsBackend = toInteger(raw.acquisitions_backend);
  const attributedSessions = toInteger(raw.attributed_sessions);

  return {
    userId: toNullableString(raw.user_id) ?? "",
    businessName: toNullableString(raw.business_name) ?? "Profil BeFood",
    inviteCode: toNullableString(raw.invite_code),
    email: toNullableString(raw.email),
    profileType: toNullableString(raw.profile_type) === "createur" ? "createur" : "coach",
    joinSessions,
    appStoreClicks,
    attributedSessions,
    acquisitionsBackend,
    joinToStoreRate: computeRate(appStoreClicks, joinSessions),
    storeToAcquisitionRate: computeRate(acquisitionsBackend, appStoreClicks),
  };
}

async function fetchBfDashboardFromRpc(fromIso: string, toIso: string, limit = 20) {
  const serviceRole = getSupabaseServiceRoleClient();
  const { data, error } = await serviceRole.rpc("get_admin_conversion_dashboard", {
    p_from: fromIso,
    p_to: toIso,
    p_limit: limit,
  });

  if (error) {
    throw error;
  }

  const payload = (data ?? {}) as BfRpcPayload;
  const totals = payload.totals ?? {};
  const actors = Array.isArray(payload.actors) ? payload.actors.map(parseRpcActor) : [];
  const from = toNullableString(payload.range?.from) ?? fromIso;
  const to = toNullableString(payload.range?.to) ?? toIso;

  return {
    source: "rpc" as const,
    range: { from, to },
    totals: {
      joinSessions: toInteger(totals.join_sessions),
      appStoreClicks: toInteger(totals.app_store_clicks),
      attributedSessions: toInteger(totals.attributed_sessions),
      sessionsWithCoachCode: toInteger(totals.sessions_with_coach_code),
      sessionsWithoutActorMatch: toInteger(totals.sessions_without_actor_match),
      acquisitionsBackend: toInteger(totals.acquisitions_backend),
    },
    actors,
  };
}

async function fetchBfDashboardFallback(fromIso: string, toIso: string) {
  const serviceRole = getSupabaseServiceRoleClient();
  const [
    joinSessionsResult,
    storeClicksResult,
    attributedSessionsResult,
    sessionsWithCoachCodeResult,
    sessionsWithoutActorMatchResult,
    acquisitionsResult,
  ] = await Promise.all([
    serviceRole
      .from("web_join_sessions")
      .select("id", { count: "exact", head: true })
      .gte("arrived_at", fromIso)
      .lt("arrived_at", toIso),
    serviceRole
      .from("web_join_sessions")
      .select("id", { count: "exact", head: true })
      .not("app_store_clicked_at", "is", null)
      .gte("arrived_at", fromIso)
      .lt("arrived_at", toIso),
    serviceRole
      .from("web_join_sessions")
      .select("id", { count: "exact", head: true })
      .eq("reconciliation_status", "attributed")
      .gte("arrived_at", fromIso)
      .lt("arrived_at", toIso),
    serviceRole
      .from("web_join_sessions")
      .select("id", { count: "exact", head: true })
      .not("coach_code", "is", null)
      .gte("arrived_at", fromIso)
      .lt("arrived_at", toIso),
    serviceRole
      .from("web_join_sessions")
      .select("id", { count: "exact", head: true })
      .is("coach_profile_user_id", null)
      .not("coach_code", "is", null)
      .gte("arrived_at", fromIso)
      .lt("arrived_at", toIso),
    serviceRole
      .from("user_acquisitions")
      .select("id", { count: "exact", head: true })
      .eq("acquisition_type", "coach")
      .gte("created_at", fromIso)
      .lt("created_at", toIso),
  ]);

  return {
    source: "fallback" as const,
    range: { from: fromIso, to: toIso },
    totals: {
      joinSessions: joinSessionsResult.count ?? 0,
      appStoreClicks: storeClicksResult.count ?? 0,
      attributedSessions: attributedSessionsResult.count ?? 0,
      sessionsWithCoachCode: sessionsWithCoachCodeResult.count ?? 0,
      sessionsWithoutActorMatch: sessionsWithoutActorMatchResult.count ?? 0,
      acquisitionsBackend: acquisitionsResult.count ?? 0,
    },
    actors: [] as AdminConversionActor[],
  };
}

function normalizePosthogPrivateHost(rawHost: string): string {
  const trimmed = rawHost.trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  const normalized = withProtocol
    .replace("://us.i.posthog.com", "://us.posthog.com")
    .replace("://eu.i.posthog.com", "://eu.posthog.com")
    .replace("://i.posthog.com", "://us.posthog.com")
    .replace(/\/+$/, "");

  return normalized;
}

function validatePosthogServerConfig(host: string, projectId: string): string | null {
  if (!host || !projectId) {
    return "PostHog API non configurée (POSTHOG_HOST, POSTHOG_PROJECT_ID, POSTHOG_PERSONAL_API_KEY).";
  }
  if (!/^https:\/\//i.test(host)) {
    return "POSTHOG_HOST invalide: utiliser une URL HTTPS complète.";
  }
  if (!/^\d+$/.test(projectId)) {
    return "POSTHOG_PROJECT_ID invalide: valeur numérique attendue.";
  }
  return null;
}

function queryRows(response: PosthogQueryResponse): Array<Record<string, unknown>> {
  if (!Array.isArray(response.results)) {
    return [];
  }

  const columns = Array.isArray(response.columns)
    ? response.columns.map((column) => toNullableString(column) ?? "")
    : [];

  return response.results.map((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      return row as Record<string, unknown>;
    }

    if (Array.isArray(row) && columns.length > 0) {
      return columns.reduce<Record<string, unknown>>((acc, columnName, index) => {
        if (columnName) {
          acc[columnName] = row[index];
        }
        return acc;
      }, {});
    }

    return {};
  });
}

async function runPosthogQuery(host: string, projectId: string, apiKey: string, sql: string, name: string) {
  const response = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query: sql,
      },
      name,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PostHog query failed (${response.status}): ${body.slice(0, 280)}`);
  }

  return (await response.json()) as PosthogQueryResponse;
}

async function fetchPosthogSummary(fromIso: string, toIso: string, dayKeys: string[]) {
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim() ?? "";
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim() ?? "";
  const host = normalizePosthogPrivateHost(
    process.env.POSTHOG_HOST?.trim() ?? process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? "",
  );

  const configError = validatePosthogServerConfig(host, projectId);
  if (!personalApiKey || configError) {
    return {
      available: false,
      source: "unavailable" as const,
      totals: {
        signupCompleted: 0,
        onboardingCompleted: 0,
        activationCompleted: 0,
      },
      webTotals: {
        pageView: 0,
        marketingPageView: 0,
        joinFlowStarted: 0,
        appStoreCtaClick: 0,
      },
      diagnostics: {
        deepLinkProcessed: 0,
        acquisitionSyncTriggered: 0,
        acquisitionSyncResult: 0,
      },
      daily: new Map<string, { signupCompleted: number; onboardingCompleted: number; activationCompleted: number }>(),
      error: configError ?? "PostHog API non configurée (POSTHOG_PERSONAL_API_KEY manquante).",
    };
  }

  const fromEscaped = escapeSqlLiteral(fromIso);
  const toEscaped = escapeSqlLiteral(toIso);
  const eventsFilter = TRACKED_POSTHOG_EVENTS.map((eventName) => `'${eventName}'`).join(", ");
  const dailyEventsFilter = TRACKED_POSTHOG_PRODUCT_EVENTS.map((eventName) => `'${eventName}'`).join(", ");
  const signupEvents = new Set<string>(TRACKED_POSTHOG_SIGNUP_EVENTS);
  const onboardingEvents = new Set<string>(TRACKED_POSTHOG_ONBOARDING_EVENTS);
  const activationEvents = new Set<string>(TRACKED_POSTHOG_ACTIVATION_EVENTS);

  const totalsSql = `
    SELECT event, count() AS event_count
    FROM events
    WHERE timestamp >= toDateTime('${fromEscaped}')
      AND timestamp < toDateTime('${toEscaped}')
      AND event IN (${eventsFilter})
    GROUP BY event
    ORDER BY event ASC
  `;

  const dailySql = `
    SELECT toString(toDate(timestamp)) AS day, event, count() AS event_count
    FROM events
    WHERE timestamp >= toDateTime('${fromEscaped}')
      AND timestamp < toDateTime('${toEscaped}')
      AND event IN (${dailyEventsFilter})
    GROUP BY day, event
    ORDER BY day ASC, event ASC
    LIMIT 5000
  `;

  try {
    const [totalsRaw, dailyRaw] = await Promise.all([
      runPosthogQuery(host, projectId, personalApiKey, totalsSql, "admin_conversion_posthog_totals"),
      runPosthogQuery(host, projectId, personalApiKey, dailySql, "admin_conversion_posthog_daily"),
    ]);

    const totalsRows = queryRows(totalsRaw);
    const dailyRows = queryRows(dailyRaw);

    const totals = {
      signupCompleted: 0,
      onboardingCompleted: 0,
      activationCompleted: 0,
    };
    const webTotals = {
      pageView: 0,
      marketingPageView: 0,
      joinFlowStarted: 0,
      appStoreCtaClick: 0,
    };
    const diagnostics = {
      deepLinkProcessed: 0,
      acquisitionSyncTriggered: 0,
      acquisitionSyncResult: 0,
    };

    for (const row of totalsRows) {
      const eventName = toNullableString(row.event);
      const count = toInteger(row.event_count);
      if (!eventName) {
        continue;
      }
      if (signupEvents.has(eventName)) {
        totals.signupCompleted += count;
      } else if (onboardingEvents.has(eventName)) {
        totals.onboardingCompleted += count;
      } else if (activationEvents.has(eventName)) {
        totals.activationCompleted += count;
      } else if (eventName === "page_view" || eventName === "$pageview") {
        webTotals.pageView += count;
      } else if (eventName === "bf_marketing_page_view") {
        webTotals.marketingPageView += count;
      } else if (eventName === "bf_join_flow_started") {
        webTotals.joinFlowStarted += count;
      } else if (eventName === "bf_app_store_cta_click") {
        webTotals.appStoreCtaClick += count;
      } else if (eventName === "deep_link_processed") {
        diagnostics.deepLinkProcessed += count;
      } else if (eventName === "acquisition_sync_triggered") {
        diagnostics.acquisitionSyncTriggered += count;
      } else if (eventName === "acquisition_sync_result") {
        diagnostics.acquisitionSyncResult += count;
      }
    }

    const daily = new Map<string, { signupCompleted: number; onboardingCompleted: number; activationCompleted: number }>();
    for (const day of dayKeys) {
      daily.set(day, { signupCompleted: 0, onboardingCompleted: 0, activationCompleted: 0 });
    }

    for (const row of dailyRows) {
      const day = toNullableString(row.day);
      const eventName = toNullableString(row.event);
      if (!day || !eventName || !daily.has(day)) {
        continue;
      }

      const current = daily.get(day);
      if (!current) {
        continue;
      }

      const count = toInteger(row.event_count);
      if (signupEvents.has(eventName)) {
        current.signupCompleted += count;
      } else if (onboardingEvents.has(eventName)) {
        current.onboardingCompleted += count;
      } else if (activationEvents.has(eventName)) {
        current.activationCompleted += count;
      }
    }

    return {
      available: true,
      source: "api" as const,
      totals,
      webTotals,
      diagnostics,
      daily,
      error: null,
    };
  } catch (error) {
    return {
      available: false,
      source: "unavailable" as const,
      totals: {
        signupCompleted: 0,
        onboardingCompleted: 0,
        activationCompleted: 0,
      },
      webTotals: {
        pageView: 0,
        marketingPageView: 0,
        joinFlowStarted: 0,
        appStoreCtaClick: 0,
      },
      diagnostics: {
        deepLinkProcessed: 0,
        acquisitionSyncTriggered: 0,
        acquisitionSyncResult: 0,
      },
      daily: new Map<string, { signupCompleted: number; onboardingCompleted: number; activationCompleted: number }>(),
      error: error instanceof Error ? error.message : "PostHog unavailable.",
    };
  }
}

async function fetchBfDailySeries(fromIso: string, toIso: string, dayKeys: string[]) {
  const serviceRole = getSupabaseServiceRoleClient();
  const [joinRows, storeRows, activationRows] = await Promise.all([
    serviceRole
      .from("web_join_sessions")
      .select("arrived_at")
      .gte("arrived_at", fromIso)
      .lt("arrived_at", toIso),
    serviceRole
      .from("web_join_sessions")
      .select("app_store_clicked_at")
      .not("app_store_clicked_at", "is", null)
      .gte("app_store_clicked_at", fromIso)
      .lt("app_store_clicked_at", toIso),
    serviceRole
      .from("user_acquisitions")
      .select("created_at")
      .eq("acquisition_type", "coach")
      .gte("created_at", fromIso)
      .lt("created_at", toIso),
  ]);

  if (joinRows.error) {
    throw joinRows.error;
  }
  if (storeRows.error) {
    throw storeRows.error;
  }
  if (activationRows.error) {
    throw activationRows.error;
  }

  const byDay = new Map<string, { joinStarted: number; storeClicks: number; activations: number }>();
  for (const day of dayKeys) {
    byDay.set(day, { joinStarted: 0, storeClicks: 0, activations: 0 });
  }

  for (const row of joinRows.data ?? []) {
    const day = toNullableString((row as { arrived_at?: unknown }).arrived_at)?.slice(0, 10);
    if (!day) {
      continue;
    }
    const current = byDay.get(day);
    if (current) {
      current.joinStarted += 1;
    }
  }

  for (const row of storeRows.data ?? []) {
    const day = toNullableString((row as { app_store_clicked_at?: unknown }).app_store_clicked_at)?.slice(0, 10);
    if (!day) {
      continue;
    }
    const current = byDay.get(day);
    if (current) {
      current.storeClicks += 1;
    }
  }

  for (const row of activationRows.data ?? []) {
    const day = toNullableString((row as { created_at?: unknown }).created_at)?.slice(0, 10);
    if (!day) {
      continue;
    }
    const current = byDay.get(day);
    if (current) {
      current.activations += 1;
    }
  }

  return byDay;
}

async function fetchGa4Summary(fromIso: string, toIso: string) {
  try {
    const [eventsReport, conversionEvents, realtimeReport] = await Promise.all([
      listEventsByDateRange(fromIso.slice(0, 10), toIso.slice(0, 10)),
      listConversionEvents(),
      runRealtimeReport(),
    ]);

    const eventMap = new Map<string, number>();
    for (const row of eventsReport.rows ?? []) {
      const eventName = toNullableString(row.dimensionValues?.[0]?.value);
      if (!eventName) {
        continue;
      }
      eventMap.set(eventName, toInteger(row.metricValues?.[0]?.value));
    }

    const keyEventSet = new Set(
      conversionEvents
        .map((event) => toNullableString(event.eventName))
        .filter((eventName): eventName is string => Boolean(eventName)),
    );

    const trackedEvents = TRACKED_GA4_EVENTS.map((eventName) => ({
      eventName,
      eventCount: eventMap.get(eventName) ?? 0,
      isKeyEvent: keyEventSet.has(eventName),
    }));

    const realtimeRows = (realtimeReport.rows ?? []).map((row) => toInteger(row.metricValues?.[0]?.value));
    const realtimeActiveUsers = realtimeRows.reduce((sum, value) => sum + value, 0);

    return {
      available: true,
      realtimeActiveUsers,
      trackedEvents,
      error: null,
    };
  } catch (error) {
    return {
      available: false,
      realtimeActiveUsers: null,
      trackedEvents: TRACKED_GA4_EVENTS.map((eventName) => ({
        eventName,
        eventCount: 0,
        isKeyEvent: false,
      })),
      error: error instanceof Error ? error.message : "GA4 unavailable.",
    };
  }
}

export async function getAdminConversionDashboard(daysInput: string | null | undefined): Promise<AdminConversionDashboardData> {
  const days = normalizePeriod(daysInput);
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days);

  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const dayKeys = buildDayKeys(fromIso, toIso);

  const notes: string[] = [];

  let bfData:
    | Awaited<ReturnType<typeof fetchBfDashboardFromRpc>>
    | Awaited<ReturnType<typeof fetchBfDashboardFallback>>;

  try {
    bfData = await fetchBfDashboardFromRpc(fromIso, toIso);
  } catch (error) {
    if (isRpcFunctionMissing(error)) {
      notes.push("Mode fallback BF actif: migration SQL get_admin_conversion_dashboard non appliquée.");
      bfData = await fetchBfDashboardFallback(fromIso, toIso);
    } else {
      throw error;
    }
  }

  const [ga4, posthog, bfDaily] = await Promise.all([
    fetchGa4Summary(fromIso, toIso),
    fetchPosthogSummary(fromIso, toIso, dayKeys),
    fetchBfDailySeries(fromIso, toIso, dayKeys).catch((error) => {
      notes.push(`Série temporelle BF indisponible: ${error instanceof Error ? error.message : "erreur inconnue"}.`);
      return new Map<string, { joinStarted: number; storeClicks: number; activations: number }>();
    }),
  ]);

  const ga4PageViews = ga4.trackedEvents.find((event) => event.eventName === "page_view")?.eventCount ?? 0;
  const ga4MarketingPageViews = ga4.trackedEvents.find((event) => event.eventName === "bf_marketing_page_view")?.eventCount ?? 0;
  const ga4JoinStarted = ga4.trackedEvents.find((event) => event.eventName === "bf_join_flow_started")?.eventCount ?? 0;
  const ga4StoreClicks = ga4.trackedEvents.find((event) => event.eventName === "bf_app_store_cta_click")?.eventCount ?? 0;

  const bfTotals = bfData.totals;
  if (bfData.source === "fallback") {
    notes.push("Attribution par acteur indisponible en fallback (appliquer la migration Supabase pour l’activer).");
  }
  if (!ga4.available) {
    notes.push("GA4 indisponible sur cette requête. Vérifier credentials et accès Admin/Data API.");
  }
  if (!posthog.available && posthog.error) {
    notes.push(`PostHog indisponible: ${posthog.error}`);
  }

  const timelineDays = dayKeys.map((day) => {
    const bfEntry = bfDaily.get(day) ?? { joinStarted: 0, storeClicks: 0, activations: 0 };
    const posthogEntry = posthog.daily.get(day) ?? {
      signupCompleted: 0,
      onboardingCompleted: 0,
      activationCompleted: 0,
    };

    return {
      day,
      joinStarted: bfEntry.joinStarted,
      storeClicks: bfEntry.storeClicks,
      signupCompleted: posthogEntry.signupCompleted,
      activationCompleted: Math.max(bfEntry.activations, posthogEntry.activationCompleted),
    };
  });

  const postInstallTotals = {
    signupCompleted: posthog.totals.signupCompleted,
    onboardingCompleted: posthog.totals.onboardingCompleted,
    activationCompleted: posthog.totals.activationCompleted,
  };
  const posthogWebTotals = {
    pageView: posthog.webTotals.pageView,
    marketingPageView: posthog.webTotals.marketingPageView,
    joinFlowStarted: posthog.webTotals.joinFlowStarted,
    appStoreCtaClick: posthog.webTotals.appStoreCtaClick,
  };

  const attributionCoverage = computeRate(bfTotals.attributedSessions, bfTotals.joinSessions);
  if (attributionCoverage !== null && attributionCoverage < 5 && bfTotals.joinSessions > 0) {
    notes.push("Couverture attribution BF très faible (<5%). Vérifier la mise à jour de reconciliation_status et la jointure click/session côté app.");
  }

  const posthogActivationDelta = posthog.available
    ? bfTotals.acquisitionsBackend - postInstallTotals.activationCompleted
    : null;
  const posthogActivationReference = Math.max(
    bfTotals.acquisitionsBackend,
    postInstallTotals.activationCompleted,
  );
  const posthogStatus = posthog.available
    ? computeDeltaStatus(posthogActivationDelta, posthogActivationReference)
    : "indisponible";
  if (posthog.available && posthogActivationDelta !== null && posthogStatus === "investiguer") {
    notes.push(
      "Écart important entre activation_completed (PostHog) et acquisitions backend BF. Vérifier l’instrumentation app (activation_completed) et la logique de déduplication.",
    );
  }
  if (posthog.available && bfTotals.joinSessions > 0 && postInstallTotals.signupCompleted > 0 && bfTotals.attributedSessions === 0) {
    notes.push("Signups détectés mais attribution BF nulle. Vérifier la propagation click_id/session_id entre web join, app et backend.");
  }
  if (posthog.available && ga4PageViews > 0 && posthogWebTotals.pageView === 0) {
    notes.push("GA4 reçoit page_view mais PostHog page_view/$pageview est à 0. Vérifier CSP connect-src et NEXT_PUBLIC_POSTHOG_HOST en production.");
  }
  if (posthog.available && ga4MarketingPageViews > 0 && posthogWebTotals.marketingPageView === 0) {
    notes.push("bf_marketing_page_view remonte en GA4 mais pas en PostHog. Vérifier le loader PostHog et le consentement analytics.");
  }
  if (posthog.available && ga4JoinStarted > 0 && posthogWebTotals.joinFlowStarted === 0) {
    notes.push("bf_join_flow_started absent dans PostHog alors qu’il existe en GA4. Vérifier le bridge d’événements marketing vers PostHog.");
  }
  if (posthog.available && ga4StoreClicks > 0 && posthogWebTotals.appStoreCtaClick === 0) {
    notes.push("bf_app_store_cta_click absent dans PostHog alors qu’il existe en GA4. Vérifier la capture PostHog sur le CTA /join.");
  }
  if (posthog.available && postInstallTotals.onboardingCompleted > 0 && postInstallTotals.activationCompleted === 0) {
    if (posthog.diagnostics.deepLinkProcessed === 0 && posthog.diagnostics.acquisitionSyncTriggered === 0) {
      notes.push("onboarding_completed présent mais aucun deep_link_processed/acquisition_sync_triggered. Cause probable: flux deep link non reçu côté app avant activation.");
    } else if (posthog.diagnostics.acquisitionSyncTriggered > 0 && posthog.diagnostics.acquisitionSyncResult > 0) {
      notes.push("acquisition_sync_result présent mais activation_completed absent. Vérifier un éventuel alias de nommage (activation_complete) ou un skip capture côté app.");
    }
  }

  const appStoreClicksDelta = ga4.available ? bfTotals.appStoreClicks - ga4StoreClicks : null;
  const joinStartsDelta = ga4.available ? bfTotals.joinSessions - ga4JoinStarted : null;
  const posthogWebReference = ga4PageViews + ga4MarketingPageViews + ga4JoinStarted + ga4StoreClicks;
  const posthogWebObserved =
    posthogWebTotals.pageView
    + posthogWebTotals.marketingPageView
    + posthogWebTotals.joinFlowStarted
    + posthogWebTotals.appStoreCtaClick;
  const posthogWebStatus = computeCoverageStatus(posthogWebObserved, posthogWebReference, posthog.available);

  return {
    range: {
      from: bfData.range.from,
      to: bfData.range.to,
      days,
    },
    bf: {
      source: bfData.source,
      totals: bfTotals,
      rates: {
        joinToStore: computeRate(bfTotals.appStoreClicks, bfTotals.joinSessions),
        storeToAcquisition: computeRate(bfTotals.acquisitionsBackend, bfTotals.appStoreClicks),
        attributedShare: computeRate(bfTotals.attributedSessions, bfTotals.joinSessions),
      },
      actors: bfData.actors,
    },
    ga4,
    posthog: {
      available: posthog.available,
      source: posthog.source,
      totals: postInstallTotals,
      webTotals: posthogWebTotals,
      diagnostics: posthog.diagnostics,
      error: posthog.error,
    },
    postInstall: {
      totals: postInstallTotals,
      rates: {
        storeToSignup: computeRate(postInstallTotals.signupCompleted, bfTotals.appStoreClicks),
        signupToOnboarding: computeRate(postInstallTotals.onboardingCompleted, postInstallTotals.signupCompleted),
        onboardingToActivation: computeRate(postInstallTotals.activationCompleted, postInstallTotals.onboardingCompleted),
      },
    },
    timeline: {
      days: timelineDays,
    },
    comparison: {
      appStoreClicksDelta,
      joinStartsDelta,
    },
    quality: {
      joinDeltaStatus: computeDeltaStatus(joinStartsDelta, bfTotals.joinSessions),
      storeDeltaStatus: computeDeltaStatus(appStoreClicksDelta, bfTotals.appStoreClicks),
      posthogStatus,
      posthogWebStatus,
      attributionCoverage,
    },
    notes,
  };
}
