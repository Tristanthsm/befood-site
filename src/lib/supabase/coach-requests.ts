import "server-only";

import { normalizeContractRegistrationStatus, type ContractRegistrationStatus } from "@/lib/contract/internal-contract";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CoachRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "to_prepare"
  | "sent"
  | "signed_pending_verification"
  | "verified";

export type CoachContractStatus =
  | "none"
  | "to_prepare"
  | "sent"
  | "signed_pending_verification"
  | "verified";

export interface CoachRequestSummary {
  id: string;
  userId: string;
  fullName: string;
  certification: string;
  profileType: string | null;
  activity: string | null;
  expertise: string | null;
  audience: string | null;
  motivation: string | null;
  socialLink: string | null;
  status: CoachRequestStatus;
  createdAt: string;
  updatedAt: string | null;
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
  contractSignedEmail: string | null;
  contractSignatureType: "typed" | "drawn" | null;
  contractVerifiedAt: string | null;
  contractPreparedAt: string | null;
  contractSentAt: string | null;
}

function isMissingColumnError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("could not find") || normalized.includes("schema cache");
}

export function normalizeCoachRequestStatus(value: unknown): CoachRequestStatus {
  const status = String(value ?? "").toLowerCase();
  if (
    status === "approved"
    || status === "rejected"
    || status === "changes_requested"
    || status === "to_prepare"
    || status === "sent"
    || status === "signed_pending_verification"
    || status === "verified"
  ) {
    return status;
  }
  return "pending";
}

export function normalizeCoachContractStatus(value: unknown): CoachContractStatus {
  const status = String(value ?? "").toLowerCase();
  if (status === "to_prepare" || status === "sent" || status === "signed_pending_verification" || status === "verified") {
    return status;
  }
  return "none";
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

function parseProfileTypeFromCertification(certification: string): string | null {
  const match = certification.match(/^profil:\s*(.+)$/i);
  return match?.[1]?.trim() ? match[1].trim().slice(0, 250) : null;
}

export async function getCoachRequestSummary(userId: string): Promise<CoachRequestSummary | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const extendedSelectWithoutCoachMessage = "id,user_id,full_name,certification,profile_type,activity,expertise,audience,motivation,social_link,status,created_at,updated_at,admin_note";
  const contractSelect = "contract_status,contract_version,contract_content_hash,contract_prepared_content,contract_template_text,contract_coach_full_name,contract_coach_email,contract_coach_status,contract_coach_address,contract_coach_registration,contract_registration_status,contract_signed_at,contract_signed_email,contract_signature_type,contract_verified_at,contract_prepared_at,contract_sent_at";
  const primaryResult = await supabase
    .from("coach_requests")
    .select(`${extendedSelectWithoutCoachMessage},admin_message,${contractSelect}`)
    .eq("user_id", userId)
    .maybeSingle();
  let data: unknown = primaryResult.data;
  let error = primaryResult.error;

  if (error && isMissingColumnError(error.message)) {
    const withoutContract = await supabase
      .from("coach_requests")
      .select(`${extendedSelectWithoutCoachMessage},admin_message`)
      .eq("user_id", userId)
      .maybeSingle();
    data = withoutContract.data as unknown;
    error = withoutContract.error;
  }

  if (error && isMissingColumnError(error.message)) {
    const withoutCoachMessage = await supabase
      .from("coach_requests")
      .select(extendedSelectWithoutCoachMessage)
      .eq("user_id", userId)
      .maybeSingle();
    data = withoutCoachMessage.data as unknown;
    error = withoutCoachMessage.error;
  }

  if (error && isMissingColumnError(error.message)) {
    const legacy = await supabase
      .from("coach_requests")
      .select("id,user_id,full_name,certification,social_link,status,created_at")
      .eq("user_id", userId)
      .maybeSingle();
    data = legacy.data as unknown;
    error = legacy.error;
  }

  if (error || !data) {
    return null;
  }

  const row = data as {
    id: unknown;
    user_id: unknown;
    full_name: unknown;
    certification: unknown;
    profile_type?: unknown;
    activity?: unknown;
    expertise?: unknown;
    audience?: unknown;
    motivation?: unknown;
    social_link: unknown;
    status: unknown;
    created_at: unknown;
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
    contract_signed_email?: unknown;
    contract_signature_type?: unknown;
    contract_verified_at?: unknown;
    contract_prepared_at?: unknown;
    contract_sent_at?: unknown;
  };
  const certification = String(row.certification ?? "");

  return {
    id: String(row.id),
    userId: String(row.user_id),
    fullName: String(row.full_name ?? ""),
    certification,
    profileType: cleanText(row.profile_type, 250) ?? parseProfileTypeFromCertification(certification),
    activity: cleanText(row.activity, 2000) ?? cleanText(certification, 2000),
    expertise: cleanText(row.expertise, 2000),
    audience: cleanText(row.audience, 2000),
    motivation: cleanText(row.motivation, 2000),
    socialLink: typeof row.social_link === "string" ? row.social_link : null,
    status: normalizeCoachRequestStatus(row.status),
    createdAt: String(row.created_at ?? ""),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
    adminNote: typeof row.admin_note === "string" ? row.admin_note : null,
    coachMessage: typeof row.admin_message === "string" ? row.admin_message : null,
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
    contractSignedAt: typeof row.contract_signed_at === "string" ? row.contract_signed_at : null,
    contractSignedEmail: cleanText(row.contract_signed_email, 320),
    contractSignatureType: row.contract_signature_type === "typed" || row.contract_signature_type === "drawn"
      ? row.contract_signature_type
      : null,
    contractVerifiedAt: typeof row.contract_verified_at === "string" ? row.contract_verified_at : null,
    contractPreparedAt: typeof row.contract_prepared_at === "string" ? row.contract_prepared_at : null,
    contractSentAt: typeof row.contract_sent_at === "string" ? row.contract_sent_at : null,
  };
}
