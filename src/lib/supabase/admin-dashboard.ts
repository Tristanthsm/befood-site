import "server-only";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type CoachRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "to_prepare"
  | "sent"
  | "signed_pending_verification"
  | "verified";
type CoachLifecycleBucket = "active" | "pending" | "paused" | "other";

export interface AdminCoachListItem {
  userId: string;
  businessName: string;
  status: string;
  lifecycle: CoachLifecycleBucket;
  isVerified: boolean;
  inviteCode: string | null;
  updatedAt: string;
  email: string | null;
}

export interface AdminDashboardOverview {
  usersTotal: number;
  adminsTotal: number;
  coachProfilesTotal: number;
  coachProfilesByLifecycle: Record<CoachLifecycleBucket, number>;
  coachRequestsByStatus: Record<CoachRequestStatus, number>;
  coachRequestsLast7Days: number;
  appSignalsLast7Days: {
    joinSessions: number;
    appStoreClicks: number;
    acquisitions: number;
  };
  coaches: AdminCoachListItem[];
}

interface CoachProfileRow {
  user_id: unknown;
  business_name: unknown;
  status: unknown;
  is_verified: unknown;
  invite_code: unknown;
  updated_at: unknown;
}

interface ProfileRow {
  id: unknown;
  email: unknown;
}

function normalizeCoachRequestStatus(raw: unknown): CoachRequestStatus {
  const value = String(raw ?? "").toLowerCase();
  if (
    value === "approved"
    || value === "rejected"
    || value === "changes_requested"
    || value === "to_prepare"
    || value === "sent"
    || value === "signed_pending_verification"
    || value === "verified"
  ) {
    return value;
  }
  return "pending";
}

function normalizeCoachLifecycle(raw: unknown): CoachLifecycleBucket {
  const status = String(raw ?? "").toLowerCase();
  if (!status) {
    return "pending";
  }
  if (["active", "enabled", "live"].some((token) => status.includes(token))) {
    return "active";
  }
  if (["paused", "inactive", "disabled", "ended"].some((token) => status.includes(token))) {
    return "paused";
  }
  if (["pending", "onboarding", "profile", "contract", "submitted", "applied", "new"].some((token) => status.includes(token))) {
    return "pending";
  }
  return "other";
}

function toSafeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  return normalized || fallback;
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized || null;
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const serviceRole = getSupabaseServiceRoleClient();

  const [
    usersTotalResult,
    adminsTotalResult,
    coachProfilesResult,
    coachRequestsResult,
    coachRequestsLast7DaysResult,
    joinSessionsLast7DaysResult,
    storeClicksLast7DaysResult,
    acquisitionsLast7DaysResult,
  ] = await Promise.all([
    serviceRole.from("profiles").select("id", { count: "exact", head: true }),
    serviceRole.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", true),
    serviceRole.from("coach_profiles").select("user_id,business_name,status,is_verified,invite_code,updated_at"),
    serviceRole.from("coach_requests").select("status"),
    serviceRole
      .from("coach_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    serviceRole
      .from("web_join_sessions")
      .select("id", { count: "exact", head: true })
      .gte("arrived_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    serviceRole
      .from("web_join_sessions")
      .select("id", { count: "exact", head: true })
      .not("app_store_clicked_at", "is", null)
      .gte("app_store_clicked_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    serviceRole
      .from("user_acquisitions")
      .select("id", { count: "exact", head: true })
      .eq("acquisition_type", "coach")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const coachProfiles = (coachProfilesResult.data ?? []) as CoachProfileRow[];
  const coachRequests = (coachRequestsResult.data ?? []) as Array<{ status?: unknown }>;

  const profileUserIds = coachProfiles
    .map((item) => toNullableString(item.user_id))
    .filter((value): value is string => Boolean(value));

  let profileMap = new Map<string, string | null>();
  if (profileUserIds.length > 0) {
    const profileResult = await serviceRole
      .from("profiles")
      .select("id,email")
      .in("id", profileUserIds);

    const rows = (profileResult.data ?? []) as ProfileRow[];
    profileMap = new Map(
      rows.map((row) => [String(row.id ?? ""), toNullableString(row.email)]),
    );
  }

  const coachProfilesByLifecycle: Record<CoachLifecycleBucket, number> = {
    active: 0,
    pending: 0,
    paused: 0,
    other: 0,
  };
  for (const coach of coachProfiles) {
    coachProfilesByLifecycle[normalizeCoachLifecycle(coach.status)] += 1;
  }

  const coachRequestsByStatus: Record<CoachRequestStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    changes_requested: 0,
    to_prepare: 0,
    sent: 0,
    signed_pending_verification: 0,
    verified: 0,
  };
  for (const request of coachRequests) {
    coachRequestsByStatus[normalizeCoachRequestStatus(request.status)] += 1;
  }

  const coaches: AdminCoachListItem[] = coachProfiles
    .map((coach) => {
      const userId = toSafeString(coach.user_id, "");
      return {
        userId,
        businessName: toSafeString(coach.business_name, "Coach BeFood"),
        status: toSafeString(coach.status, "pending"),
        lifecycle: normalizeCoachLifecycle(coach.status),
        isVerified: Boolean(coach.is_verified),
        inviteCode: toNullableString(coach.invite_code),
        updatedAt: toSafeString(coach.updated_at, ""),
        email: profileMap.get(userId) ?? null,
      };
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return {
    usersTotal: usersTotalResult.count ?? 0,
    adminsTotal: adminsTotalResult.count ?? 0,
    coachProfilesTotal: coachProfiles.length,
    coachProfilesByLifecycle,
    coachRequestsByStatus,
    coachRequestsLast7Days: coachRequestsLast7DaysResult.count ?? 0,
    appSignalsLast7Days: {
      joinSessions: joinSessionsLast7DaysResult.count ?? 0,
      appStoreClicks: storeClicksLast7DaysResult.count ?? 0,
      acquisitions: acquisitionsLast7DaysResult.count ?? 0,
    },
    coaches,
  };
}
