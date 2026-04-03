import "server-only";

import { normalizeContractRegistrationStatus, type ContractRegistrationStatus } from "@/lib/contract/internal-contract";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  normalizeCoachContractStatus,
  normalizeCoachRequestStatus,
  type CoachContractStatus,
  type CoachRequestStatus,
} from "@/lib/supabase/coach-requests";

export type AdminCoachRequestFilter = CoachRequestStatus | "all";
export type AdminCoachDecisionStatus = "approved" | "rejected" | "changes_requested";

export interface AdminCoachContractEventRecord {
  id: string;
  eventType: "prepared" | "sent" | "opened" | "signed" | "verified";
  eventSource: "admin" | "coach" | "system";
  occurredAt: string;
  actorUserId: string | null;
  actorLabel: string | null;
  payload: Record<string, unknown>;
}

export interface AdminCoachRequestRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string | null;
  profileType: string | null;
  activity: string | null;
  expertise: string | null;
  audience: string | null;
  motivation: string | null;
  certification: string;
  socialLink: string | null;
  status: CoachRequestStatus;
  createdAt: string;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
  adminNote: string | null;
  coachMessage: string | null;
  contractStatus: CoachContractStatus;
  contractVersion: string | null;
  contractContentHash: string | null;
  contractPreparedContent: string | null;
  contractTemplateText: string | null;
  contractCoachFullName: string | null;
  contractCoachEmail: string | null;
  contractCoachStatus: string | null;
  contractCoachAddress: string | null;
  contractCoachRegistration: string | null;
  contractRegistrationStatus: ContractRegistrationStatus;
  contractSignedAt: string | null;
  contractSignedIp: string | null;
  contractSignedUserAgent: string | null;
  contractSignedEmail: string | null;
  contractSignatureType: "typed" | "drawn" | null;
  contractSignaturePayload: Record<string, unknown> | null;
  contractVerifiedAt: string | null;
  contractVerifiedBy: string | null;
  contractPreparedAt: string | null;
  contractSentAt: string | null;
  contractEvents: AdminCoachContractEventRecord[];
}

interface CoachRequestRow {
  id: unknown;
  user_id: unknown;
  full_name: unknown;
  certification: unknown;
  social_link: unknown;
  status: unknown;
  created_at: unknown;
  profile_type?: unknown;
  activity?: unknown;
  expertise?: unknown;
  audience?: unknown;
  motivation?: unknown;
  updated_by?: unknown;
  updated_at?: unknown;
  admin_note?: unknown;
  admin_message?: unknown;
  contract_status?: unknown;
  contract_version?: unknown;
  contract_content_hash?: unknown;
  contract_prepared_content?: unknown;
  contract_template_text?: unknown;
  contract_coach_full_name?: unknown;
  contract_coach_email?: unknown;
  contract_coach_status?: unknown;
  contract_coach_address?: unknown;
  contract_coach_registration?: unknown;
  contract_registration_status?: unknown;
  contract_signed_at?: unknown;
  contract_signed_ip?: unknown;
  contract_signed_user_agent?: unknown;
  contract_signed_email?: unknown;
  contract_signature_type?: unknown;
  contract_signature_payload?: unknown;
  contract_verified_at?: unknown;
  contract_verified_by?: unknown;
  contract_prepared_at?: unknown;
  contract_sent_at?: unknown;
}

interface ContractEventRow {
  id: unknown;
  coach_request_id: unknown;
  event_type: unknown;
  event_source: unknown;
  actor_user_id: unknown;
  occurred_at: unknown;
  payload: unknown;
}

interface ProfileRow {
  id: unknown;
  email: unknown;
  display_name?: unknown;
}

function cleanText(value: unknown, maxLength = 2000): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function uniqueStrings(values: Array<string | null>): string[] {
  return Array.from(
    new Set(values.filter((value): value is string => typeof value === "string" && value.trim().length > 0)),
  );
}

function isMissingColumnError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("could not find") || normalized.includes("schema cache");
}

function parseProfileTypeFromCertification(certification: string): string | null {
  const match = certification.match(/^profil:\s*(.+)$/i);
  return match?.[1]?.trim() ? match[1].trim().slice(0, 250) : null;
}

function mapStatusFilter(input: string | null | undefined): AdminCoachRequestFilter {
  const normalized = String(input ?? "").toLowerCase().trim();
  if (
    normalized === "pending"
    || normalized === "approved"
    || normalized === "rejected"
    || normalized === "changes_requested"
    || normalized === "to_prepare"
    || normalized === "sent"
    || normalized === "signed_pending_verification"
    || normalized === "verified"
  ) {
    return normalized;
  }
  return "all";
}

export function parseAdminCoachRequestFilter(input: string | null | undefined): AdminCoachRequestFilter {
  return mapStatusFilter(input);
}

export function isAdminCoachRequestStatus(input: string | null | undefined): input is AdminCoachDecisionStatus {
  const normalized = String(input ?? "").toLowerCase().trim();
  return normalized === "approved" || normalized === "rejected" || normalized === "changes_requested";
}

async function fetchProfileMap(userIds: string[]): Promise<Map<string, { email: string | null; displayName: string | null }>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const serviceRole = getSupabaseServiceRoleClient();
  const { data, error } = await serviceRole
    .from("profiles")
    .select("id,email,display_name")
    .in("id", userIds);

  if (error || !data) {
    return new Map();
  }

  const rows = data as ProfileRow[];
  const profileMap = new Map<string, { email: string | null; displayName: string | null }>();
  rows.forEach((row) => {
    const id = String(row.id ?? "");
    if (!id) {
      return;
    }
    profileMap.set(id, {
      email: cleanText(row.email, 320),
      displayName: cleanText(row.display_name, 250),
    });
  });

  return profileMap;
}

async function fetchCoachRequestRows(filter: AdminCoachRequestFilter, requestId?: string): Promise<CoachRequestRow[]> {
  const serviceRole = getSupabaseServiceRoleClient();
  const baseSelect = "id,user_id,full_name,certification,social_link,status,created_at";
  const extendedSelectWithoutCoachMessage = `${baseSelect},profile_type,activity,expertise,audience,motivation,updated_by,updated_at,admin_note`;
  const contractSelect = "contract_status,contract_version,contract_content_hash,contract_prepared_content,contract_template_text,contract_coach_full_name,contract_coach_email,contract_coach_status,contract_coach_address,contract_coach_registration,contract_registration_status,contract_signed_at,contract_signed_ip,contract_signed_user_agent,contract_signed_email,contract_signature_type,contract_signature_payload,contract_verified_at,contract_verified_by,contract_prepared_at,contract_sent_at";
  const extendedSelect = `${extendedSelectWithoutCoachMessage},admin_message,${contractSelect}`;

  const buildQuery = (selectClause: string) => {
    let query = serviceRole
      .from("coach_requests")
      .select(selectClause)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    if (requestId) {
      query = query.eq("id", requestId);
    }

    return query;
  };

  let { data, error } = await buildQuery(extendedSelect);
  if (error && isMissingColumnError(error.message)) {
    const withoutContract = await buildQuery(`${extendedSelectWithoutCoachMessage},admin_message`);
    data = withoutContract.data;
    error = withoutContract.error;
  }
  if (error && isMissingColumnError(error.message)) {
    const withoutCoachMessage = await buildQuery(extendedSelectWithoutCoachMessage);
    data = withoutCoachMessage.data;
    error = withoutCoachMessage.error;
  }
  if (error && isMissingColumnError(error.message)) {
    const legacyResult = await buildQuery(baseSelect);
    data = legacyResult.data;
    error = legacyResult.error;
  }

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to load coach requests.");
  }

  return data as unknown as CoachRequestRow[];
}

function parseJsonObject(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }
  return input as Record<string, unknown>;
}

async function listContractEventsByRequestId(
  requestId: string,
): Promise<AdminCoachContractEventRecord[]> {
  const serviceRole = getSupabaseServiceRoleClient();
  const { data, error } = await serviceRole
    .from("coach_request_contract_events")
    .select("id,coach_request_id,event_type,event_source,actor_user_id,occurred_at,payload")
    .eq("coach_request_id", requestId)
    .order("occurred_at", { ascending: false });

  const eventError = error as { message?: string } | null;
  if (eventError) {
    const message = String(eventError.message ?? "");
    if (isMissingColumnError(message)) {
      return [];
    }
    throw new Error(message || "Unable to load contract events.");
  }

  if (!data) {
    return [];
  }

  const rows = data as ContractEventRow[];
  const actorIds = uniqueStrings(rows.map((row) => cleanText(row.actor_user_id, 64)));
  const actorProfiles = await fetchProfileMap(actorIds);

  return rows
    .map((row) => {
      const actorUserId = cleanText(row.actor_user_id, 64);
      const actorProfile = actorUserId ? actorProfiles.get(actorUserId) : null;
      const actorLabel = actorProfile?.displayName ?? actorProfile?.email ?? actorUserId;
      const eventType = cleanText(row.event_type, 64);
      const eventSource = cleanText(row.event_source, 64);
      const occurredAt = cleanText(row.occurred_at, 64);

      if (!eventType || !eventSource || !occurredAt) {
        return null;
      }
      if (
        eventType !== "prepared"
        && eventType !== "sent"
        && eventType !== "opened"
        && eventType !== "signed"
        && eventType !== "verified"
      ) {
        return null;
      }
      if (eventSource !== "admin" && eventSource !== "coach" && eventSource !== "system") {
        return null;
      }

      return {
        id: String(row.id ?? ""),
        eventType,
        eventSource,
        occurredAt,
        actorUserId,
        actorLabel: actorLabel ?? null,
        payload: parseJsonObject(row.payload) ?? {},
      } satisfies AdminCoachContractEventRecord;
    })
    .filter((event): event is AdminCoachContractEventRecord => Boolean(event));
}

function mapAdminCoachRequestRow(
  row: CoachRequestRow,
  profileMap: Map<string, { email: string | null; displayName: string | null }>,
  adminMap: Map<string, { email: string | null; displayName: string | null }>,
  contractEvents: AdminCoachContractEventRecord[],
): AdminCoachRequestRecord {
  const id = String(row.id ?? "");
  const userId = String(row.user_id ?? "");
  const certification = cleanText(row.certification, 2000) ?? "";
  const profileType = cleanText(row.profile_type, 250) ?? parseProfileTypeFromCertification(certification);
  const activity = cleanText(row.activity, 2000) ?? (!profileType ? cleanText(certification, 2000) : null);
  const currentProfile = profileMap.get(userId);
  const updatedBy = cleanText(row.updated_by, 64);
  const updatedByProfile = updatedBy ? adminMap.get(updatedBy) : null;

  const updatedByName = updatedByProfile?.displayName
    ?? updatedByProfile?.email
    ?? updatedBy;

  return {
    id,
    userId,
    fullName: cleanText(row.full_name, 250) ?? currentProfile?.displayName ?? "Candidat coach",
    email: currentProfile?.email ?? null,
    profileType,
    activity,
    expertise: cleanText(row.expertise, 2000),
    audience: cleanText(row.audience, 2000),
    motivation: cleanText(row.motivation, 2000),
    certification,
    socialLink: cleanText(row.social_link, 500),
    status: normalizeCoachRequestStatus(row.status),
    createdAt: String(row.created_at ?? ""),
    updatedAt: cleanText(row.updated_at, 64),
    updatedBy,
    updatedByName,
    adminNote: cleanText(row.admin_note, 2000),
    coachMessage: cleanText(row.admin_message, 2000),
    contractStatus: normalizeCoachContractStatus(row.contract_status),
    contractVersion: cleanText(row.contract_version, 120),
    contractContentHash: cleanText(row.contract_content_hash, 128),
    contractPreparedContent: cleanText(row.contract_prepared_content, 80_000),
    contractTemplateText: cleanText(row.contract_template_text, 80_000),
    contractCoachFullName: cleanText(row.contract_coach_full_name, 250),
    contractCoachEmail: cleanText(row.contract_coach_email, 320),
    contractCoachStatus: cleanText(row.contract_coach_status, 250),
    contractCoachAddress: cleanText(row.contract_coach_address, 500),
    contractCoachRegistration: cleanText(row.contract_coach_registration, 250),
    contractRegistrationStatus: normalizeContractRegistrationStatus(
      row.contract_registration_status,
      cleanText(row.contract_coach_registration, 250),
    ),
    contractSignedAt: cleanText(row.contract_signed_at, 64),
    contractSignedIp: cleanText(row.contract_signed_ip, 100),
    contractSignedUserAgent: cleanText(row.contract_signed_user_agent, 500),
    contractSignedEmail: cleanText(row.contract_signed_email, 320),
    contractSignatureType: row.contract_signature_type === "typed" || row.contract_signature_type === "drawn"
      ? row.contract_signature_type
      : null,
    contractSignaturePayload: parseJsonObject(row.contract_signature_payload),
    contractVerifiedAt: cleanText(row.contract_verified_at, 64),
    contractVerifiedBy: cleanText(row.contract_verified_by, 64),
    contractPreparedAt: cleanText(row.contract_prepared_at, 64),
    contractSentAt: cleanText(row.contract_sent_at, 64),
    contractEvents,
  };
}

export async function listAdminCoachRequests(filter: AdminCoachRequestFilter = "all"): Promise<AdminCoachRequestRecord[]> {
  const rows = await fetchCoachRequestRows(filter);
  const userIds = uniqueStrings(rows.map((row) => cleanText(row.user_id, 64)));
  const adminIds = uniqueStrings(rows.map((row) => cleanText(row.updated_by, 64)));

  const [profileMap, adminMap] = await Promise.all([
    fetchProfileMap(userIds),
    fetchProfileMap(adminIds),
  ]);

  return rows.map((row) => mapAdminCoachRequestRow(row, profileMap, adminMap, []));
}

export async function getAdminCoachRequestById(requestId: string): Promise<AdminCoachRequestRecord | null> {
  const rows = await fetchCoachRequestRows("all", requestId);
  const target = rows[0] ?? null;
  if (!target) {
    return null;
  }

  const userId = cleanText(target.user_id, 64);
  const updatedBy = cleanText(target.updated_by, 64);
  const [profileMap, adminMap] = await Promise.all([
    fetchProfileMap(uniqueStrings([userId])),
    fetchProfileMap(uniqueStrings([updatedBy])),
  ]);

  const contractEvents = await listContractEventsByRequestId(requestId).catch(() => []);
  return mapAdminCoachRequestRow(target, profileMap, adminMap, contractEvents);
}
