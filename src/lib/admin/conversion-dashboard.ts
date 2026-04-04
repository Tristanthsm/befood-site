import "server-only";

import { listConversionEvents, listEventsLast30Days, runRealtimeReport } from "@/lib/analytics/ga4-api";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const TRACKED_GA4_EVENTS = [
  "page_view",
  "bf_marketing_page_view",
  "bf_cta_click",
  "bf_join_flow_started",
  "bf_app_store_cta_click",
] as const;

type SupportedPeriod = 7 | 14 | 30 | 90;
type ActorProfileType = "coach" | "createur";

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
  comparison: {
    appStoreClicksDelta: number | null;
    joinStartsDelta: number | null;
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

async function fetchGa4Summary() {
  try {
    const [eventsReport, conversionEvents, realtimeReport] = await Promise.all([
      listEventsLast30Days(),
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

  const ga4 = await fetchGa4Summary();
  const ga4JoinStarted = ga4.trackedEvents.find((event) => event.eventName === "bf_join_flow_started")?.eventCount ?? 0;
  const ga4StoreClicks = ga4.trackedEvents.find((event) => event.eventName === "bf_app_store_cta_click")?.eventCount ?? 0;

  const bfTotals = bfData.totals;
  if (bfData.source === "fallback") {
    notes.push("Attribution par acteur indisponible en fallback (appliquer la migration Supabase pour l’activer).");
  }
  if (!ga4.available) {
    notes.push("GA4 indisponible sur cette requête. Vérifier credentials et accès Admin/Data API.");
  }

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
    comparison: {
      appStoreClicksDelta: ga4.available ? bfTotals.appStoreClicks - ga4StoreClicks : null,
      joinStartsDelta: ga4.available ? bfTotals.joinSessions - ga4JoinStarted : null,
    },
    notes,
  };
}
