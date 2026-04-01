import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface CoachAcquisitionKpi {
  joinSessions: number;
  appStoreClicks: number;
  acquisitionsCoach: number;
  activeLinkedUsers: number;
}

export interface CoachAcquisitionFunnel {
  trafficCoach: number;
  joinSessions: number;
  storeClicks: number;
  acquisitionsKnownBackend: number;
  activeCoachLinks: number;
}

export interface CoachAcquisitionDailyPoint {
  day: string;
  joinSessions: number;
  appStoreClicks: number;
}

export interface CoachAcquisitionEvent {
  occurredAt: string;
  coachCode: string | null;
  ref: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  storeClicked: boolean;
  sessionStatus: string | null;
  reconciliationStatus: string | null;
}

export interface CoachAcquisitionDashboard {
  isCoach: boolean;
  rangeFrom: string | null;
  rangeTo: string | null;
  kpi: CoachAcquisitionKpi;
  funnel: CoachAcquisitionFunnel;
  daily: CoachAcquisitionDailyPoint[];
  recentEvents: CoachAcquisitionEvent[];
}

const EMPTY_DASHBOARD: CoachAcquisitionDashboard = {
  isCoach: false,
  rangeFrom: null,
  rangeTo: null,
  kpi: {
    joinSessions: 0,
    appStoreClicks: 0,
    acquisitionsCoach: 0,
    activeLinkedUsers: 0,
  },
  funnel: {
    trafficCoach: 0,
    joinSessions: 0,
    storeClicks: 0,
    acquisitionsKnownBackend: 0,
    activeCoachLinks: 0,
  },
  daily: [],
  recentEvents: [],
};

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

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeDashboardPayload(payload: unknown): CoachAcquisitionDashboard {
  if (!payload || typeof payload !== "object") {
    return EMPTY_DASHBOARD;
  }

  const source = payload as Record<string, unknown>;
  const range = (source.range ?? {}) as Record<string, unknown>;
  const kpi = (source.kpi ?? {}) as Record<string, unknown>;
  const funnel = (source.funnel ?? {}) as Record<string, unknown>;
  const dailyRaw = Array.isArray(source.daily) ? source.daily : [];
  const eventsRaw = Array.isArray(source.recent_events) ? source.recent_events : [];

  return {
    isCoach: source.is_coach === true,
    rangeFrom: toNullableString(range.from),
    rangeTo: toNullableString(range.to),
    kpi: {
      joinSessions: toInteger(kpi.join_sessions),
      appStoreClicks: toInteger(kpi.app_store_clicks),
      acquisitionsCoach: toInteger(kpi.acquisitions_coach),
      activeLinkedUsers: toInteger(kpi.active_linked_users),
    },
    funnel: {
      trafficCoach: toInteger(funnel.traffic_coach),
      joinSessions: toInteger(funnel.join_sessions),
      storeClicks: toInteger(funnel.store_clicks),
      acquisitionsKnownBackend: toInteger(funnel.acquisitions_known_backend),
      activeCoachLinks: toInteger(funnel.active_coach_links),
    },
    daily: dailyRaw.map((point) => {
      const entry = point as Record<string, unknown>;
      return {
        day: toNullableString(entry.day) ?? "",
        joinSessions: toInteger(entry.join_sessions),
        appStoreClicks: toInteger(entry.app_store_clicks),
      };
    }).filter((point) => point.day.length > 0),
    recentEvents: eventsRaw.map((item) => {
      const event = item as Record<string, unknown>;
      return {
        occurredAt: toNullableString(event.occurred_at) ?? "",
        coachCode: toNullableString(event.coach_code),
        ref: toNullableString(event.ref),
        utmSource: toNullableString(event.utm_source),
        utmMedium: toNullableString(event.utm_medium),
        utmCampaign: toNullableString(event.utm_campaign),
        storeClicked: toBoolean(event.store_clicked),
        sessionStatus: toNullableString(event.session_status),
        reconciliationStatus: toNullableString(event.reconciliation_status),
      };
    }).filter((event) => event.occurredAt.length > 0),
  };
}

export async function getCoachAcquisitionDashboard(days = 30): Promise<CoachAcquisitionDashboard> {
  if (!hasSupabaseEnv()) {
    return EMPTY_DASHBOARD;
  }

  const safeDays = days === 7 ? 7 : 30;
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - safeDays);

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_my_coach_acquisition_dashboard", {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });

  if (error) {
    console.error("[coach-dashboard] unable to load acquisition dashboard", error.message);
    return EMPTY_DASHBOARD;
  }

  return normalizeDashboardPayload(data);
}
