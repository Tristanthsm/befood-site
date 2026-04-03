import { NextRequest, NextResponse } from "next/server";

import { getAdminAccessContext } from "@/lib/admin/auth";
import {
  DEFAULT_COACH_CONTRACT_TEMPLATE,
  DEFAULT_COACH_LEGAL_STATUS,
  appendContractEvent,
  buildContractDocumentAndHash,
  getMissingRequiredContractFields,
  getInitialContractStatusFromCoachRequestStatus,
  hasUnresolvedContractPlaceholders,
  normalizeContractRegistrationStatus,
  normalizeContractLifecycleStatus,
  sha256Hex,
} from "@/lib/contract/internal-contract";
import { normalizeCoachRequestStatus } from "@/lib/supabase/coach-requests";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "edge";

type AdminContractAction = "prepare" | "mark_sent" | "verify";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes("does not exist");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function cleanText(value: FormDataEntryValue | null, maxLength = 2000): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

function cleanInlineText(value: unknown, maxLength = 320): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

function cleanMultilineText(value: FormDataEntryValue | null, maxLength = 80_000): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

function sanitizeRedirectPath(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }
  return normalized;
}

function withResultQuery(path: string, request: NextRequest, key: "updated" | "error", value: string): URL {
  const url = new URL(path, request.url);
  url.searchParams.set(key, value);
  return url;
}

function parseAction(value: string | null): AdminContractAction | null {
  if (value === "prepare" || value === "mark_sent" || value === "verify") {
    return value;
  }
  return null;
}

async function getCoachRequestRow(requestId: string) {
  const serviceRole = getSupabaseServiceRoleClient();
  const primaryResult = await serviceRole
    .from("coach_requests")
    .select("id,user_id,full_name,status,contract_status,contract_signed_at,contract_sent_at,contract_version,contract_content_hash,contract_prepared_at,contract_prepared_content,contract_template_text,contract_coach_full_name,contract_coach_email,contract_coach_status,contract_coach_address,contract_coach_registration,contract_registration_status")
    .eq("id", requestId)
    .maybeSingle();
  let data: unknown = primaryResult.data;
  let error = primaryResult.error;

  if (error && isMissingColumnError(error.message)) {
    const fallback = await serviceRole
      .from("coach_requests")
      .select("id,user_id,full_name,status,contract_status,contract_signed_at,contract_sent_at,contract_version,contract_content_hash,contract_prepared_at")
      .eq("id", requestId)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  const row = data as {
    id: unknown;
    user_id: unknown;
    full_name: unknown;
    status: unknown;
    contract_status?: unknown;
    contract_signed_at?: unknown;
    contract_sent_at?: unknown;
    contract_prepared_at?: unknown;
    contract_prepared_content?: unknown;
    contract_version?: unknown;
    contract_content_hash?: unknown;
    contract_template_text?: unknown;
    contract_coach_full_name?: unknown;
    contract_coach_email?: unknown;
    contract_coach_status?: unknown;
    contract_coach_address?: unknown;
    contract_coach_registration?: unknown;
    contract_registration_status?: unknown;
  };

  const userId = typeof row.user_id === "string" ? row.user_id : null;
  let coachEmail = "email-non-renseigne";

  if (userId) {
    const profileResult = await serviceRole
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    if (!profileResult.error && typeof profileResult.data?.email === "string" && profileResult.data.email.trim()) {
      coachEmail = profileResult.data.email.trim().slice(0, 320);
    }
  }

  const status = normalizeCoachRequestStatus(row.status);
  const contractStatus = normalizeContractLifecycleStatus(row.contract_status)
    || getInitialContractStatusFromCoachRequestStatus(status);

  return {
    id: String(row.id ?? ""),
    userId,
    coachFullName: cleanInlineText(row.full_name, 250) ?? "Coach partenaire",
    coachEmail,
    status,
    contractStatus,
    contractSignedAt: cleanInlineText(row.contract_signed_at, 64),
    contractSentAt: cleanInlineText(row.contract_sent_at, 64),
    contractPreparedAt: cleanInlineText(row.contract_prepared_at, 64),
    contractPreparedContent: cleanInlineText(row.contract_prepared_content, 80_000),
    contractVersion: cleanInlineText(row.contract_version, 120),
    contractContentHash: cleanInlineText(row.contract_content_hash, 128),
    contractTemplateText: cleanInlineText(row.contract_template_text, 80_000),
    contractCoachFullName: cleanInlineText(row.contract_coach_full_name, 250),
    contractCoachEmail: cleanInlineText(row.contract_coach_email, 320),
    contractCoachStatus: cleanInlineText(row.contract_coach_status, 250),
    contractCoachAddress: cleanInlineText(row.contract_coach_address, 500),
    contractCoachRegistration: cleanInlineText(row.contract_coach_registration, 250),
    contractRegistrationStatus: normalizeContractRegistrationStatus(
      row.contract_registration_status,
      cleanInlineText(row.contract_coach_registration, 250),
    ),
  };
}

async function applyContractUpdateWithFallback(input: {
  requestId: string;
  payload: Record<string, unknown>;
}): Promise<boolean> {
  const serviceRole = getSupabaseServiceRoleClient();
  const fullUpdate = await serviceRole
    .from("coach_requests")
    .update(input.payload)
    .eq("id", input.requestId)
    .select("id")
    .maybeSingle();

  if (!fullUpdate.error) {
    return Boolean(fullUpdate.data);
  }

  if (!isMissingColumnError(fullUpdate.error.message)) {
    throw new Error(fullUpdate.error.message);
  }

  const legacyStatus = typeof input.payload.status === "string" ? input.payload.status : null;
  if (!legacyStatus) {
    throw new Error(fullUpdate.error.message);
  }

  const fallback = await serviceRole
    .from("coach_requests")
    .update({ status: legacyStatus })
    .eq("id", input.requestId)
    .select("id")
    .maybeSingle();

  if (fallback.error) {
    throw new Error(fallback.error.message);
  }

  return Boolean(fallback.data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Requête non autorisée." }, { status: 403 });
  }

  const { requestId } = await params;
  const fallbackRedirectPath = `/admin/coachs/${requestId}`;

  if (!isUuid(requestId)) {
    return NextResponse.redirect(withResultQuery(fallbackRedirectPath, request, "error", "invalid_id"), { status: 303 });
  }

  const access = await getAdminAccessContext();
  if (!access.isAuthenticated) {
    return NextResponse.redirect(new URL("/connexion", request.url), { status: 303 });
  }

  if (!access.isAdmin || !access.userId) {
    return NextResponse.redirect(new URL("/profil", request.url), { status: 303 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.redirect(withResultQuery(fallbackRedirectPath, request, "error", "invalid_form"), { status: 303 });
  }

  const action = parseAction(cleanText(formData.get("action"), 40));
  if (!action) {
    return NextResponse.redirect(withResultQuery(fallbackRedirectPath, request, "error", "invalid_action"), { status: 303 });
  }

  const templateTextInput = cleanMultilineText(formData.get("contract_template_text"), 80_000);
  const coachFullNameInput = cleanText(formData.get("contract_coach_full_name"), 250);
  const coachEmailInput = cleanText(formData.get("contract_coach_email"), 320);
  const coachStatusInput = cleanText(formData.get("contract_coach_status"), 250);
  const coachAddressInput = cleanText(formData.get("contract_coach_address"), 500);
  const coachRegistrationInput = cleanText(formData.get("contract_coach_registration"), 250);

  const redirectPath = sanitizeRedirectPath(formData.get("redirectTo"), fallbackRedirectPath);

  const coachRequest = await getCoachRequestRow(requestId).catch(() => null);
  if (!coachRequest) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "not_found"), { status: 303 });
  }

  const nowIso = new Date().toISOString();
  let updatePayload: Record<string, unknown> | null = null;
  let eventType: "prepared" | "sent" | "verified" | null = null;
  let eventPayload: Record<string, unknown> = {};

  const resolvedContractTemplateText = templateTextInput
    ?? coachRequest.contractTemplateText
    ?? DEFAULT_COACH_CONTRACT_TEMPLATE;
  const resolvedCoachFullName = coachFullNameInput
    ?? coachRequest.contractCoachFullName
    ?? coachRequest.coachFullName;
  const resolvedCoachEmail = coachEmailInput
    ?? coachRequest.contractCoachEmail
    ?? coachRequest.coachEmail;
  const resolvedCoachStatus = coachStatusInput
    ?? coachRequest.contractCoachStatus
    ?? DEFAULT_COACH_LEGAL_STATUS;
  const resolvedCoachAddress = coachAddressInput
    ?? coachRequest.contractCoachAddress
    ?? "";
  const resolvedCoachRegistration = coachRegistrationInput
    ?? coachRequest.contractCoachRegistration
    ?? null;
  const resolvedRegistrationStatus = normalizeContractRegistrationStatus(
    coachRequest.contractRegistrationStatus,
    resolvedCoachRegistration,
  );
  const missingRequiredFields = getMissingRequiredContractFields({
    coachFullName: resolvedCoachFullName,
    coachEmail: resolvedCoachEmail,
    coachStatus: resolvedCoachStatus,
    coachAddress: resolvedCoachAddress,
    coachRegistration: resolvedCoachRegistration,
    coachRegistrationStatus: resolvedRegistrationStatus,
  });
  const isContractMaterialReady = Boolean(
    coachRequest.contractVersion
    && coachRequest.contractContentHash
    && coachRequest.contractPreparedAt
    && coachRequest.contractPreparedContent,
  );

  if (action === "prepare") {
    if (coachRequest.contractStatus === "verified") {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "already_verified"), { status: 303 });
    }
    if (missingRequiredFields.length > 0) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "missing_contract_fields"), { status: 303 });
    }

    const contractDocument = await buildContractDocumentAndHash({
      coachFullName: resolvedCoachFullName,
      coachEmail: resolvedCoachEmail,
      coachStatus: resolvedCoachStatus,
      coachAddress: resolvedCoachAddress,
      coachRegistration: resolvedCoachRegistration ?? undefined,
      contractTemplateText: resolvedContractTemplateText,
      generatedAtIso: nowIso,
    });
    if (hasUnresolvedContractPlaceholders(contractDocument.contractText)) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "unresolved_placeholders"), { status: 303 });
    }

    updatePayload = {
      status: "to_prepare",
      contract_status: "to_prepare",
      contract_template_text: resolvedContractTemplateText,
      contract_coach_full_name: resolvedCoachFullName,
      contract_coach_email: resolvedCoachEmail,
      contract_coach_status: resolvedCoachStatus,
      contract_coach_address: resolvedCoachAddress,
      contract_coach_registration: resolvedCoachRegistration,
      contract_registration_status: normalizeContractRegistrationStatus(null, resolvedCoachRegistration),
      contract_prepared_content: contractDocument.contractText,
      contract_version: contractDocument.version,
      contract_content_hash: contractDocument.contentHash,
      contract_prepared_at: nowIso,
      contract_sent_at: null,
      contract_signed_at: null,
      contract_signed_ip: null,
      contract_signed_user_agent: null,
      contract_signed_email: null,
      contract_signature_type: null,
      contract_signature_payload: null,
      contract_verified_at: null,
      contract_verified_by: null,
      updated_by: access.userId,
      updated_at: nowIso,
    };
    eventType = "prepared";
    eventPayload = {
      contractVersion: contractDocument.version,
      contractContentHash: contractDocument.contentHash,
      coachFullName: resolvedCoachFullName,
      coachEmail: resolvedCoachEmail,
    };
  }

  if (action === "mark_sent") {
    if (coachRequest.contractStatus === "verified") {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "already_verified"), { status: 303 });
    }

    if (coachRequest.contractStatus === "sent" || coachRequest.contractStatus === "signed_pending_verification") {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "updated", "1"), { status: 303 });
    }

    if (coachRequest.contractStatus !== "to_prepare" && coachRequest.status !== "to_prepare") {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_transition"), { status: 303 });
    }
    if (!isContractMaterialReady) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "contract_not_prepared"), { status: 303 });
    }
    if (missingRequiredFields.length > 0) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "missing_contract_fields"), { status: 303 });
    }
    if (hasUnresolvedContractPlaceholders(coachRequest.contractPreparedContent)) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "unresolved_placeholders"), { status: 303 });
    }
    const contentHash = await sha256Hex(coachRequest.contractPreparedContent ?? "");
    if (!coachRequest.contractContentHash || coachRequest.contractContentHash !== contentHash) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "contract_hash_mismatch"), { status: 303 });
    }

    updatePayload = {
      status: "sent",
      contract_status: "sent",
      contract_sent_at: nowIso,
      updated_by: access.userId,
      updated_at: nowIso,
    };
    eventType = "sent";
    eventPayload = {
      contractVersion: coachRequest.contractVersion,
      contractContentHash: coachRequest.contractContentHash,
    };
  }

  if (action === "verify") {
    if (coachRequest.contractStatus === "verified" || coachRequest.status === "verified") {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "updated", "1"), { status: 303 });
    }

    if (coachRequest.contractStatus !== "signed_pending_verification" && coachRequest.status !== "signed_pending_verification") {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_transition"), { status: 303 });
    }

    updatePayload = {
      status: "verified",
      contract_status: "verified",
      contract_verified_at: nowIso,
      contract_verified_by: access.userId,
      updated_by: access.userId,
      updated_at: nowIso,
    };
    eventType = "verified";
    eventPayload = {
      signedAt: coachRequest.contractSignedAt,
    };
  }

  if (!updatePayload || !eventType) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_action"), { status: 303 });
  }

  try {
    const updated = await applyContractUpdateWithFallback({
      requestId,
      payload: updatePayload,
    });

    if (!updated) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "not_found"), { status: 303 });
    }

    await appendContractEvent({
      requestId,
      eventType,
      eventSource: "admin",
      actorUserId: access.userId,
      payload: eventPayload,
    }).catch((error) => {
      console.error("[admin-contract] failed to append event", error);
    });
  } catch (error) {
    console.error("[admin-contract] failed to update contract", error);
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "update_failed"), { status: 303 });
  }

  return NextResponse.redirect(withResultQuery(redirectPath, request, "updated", "1"), { status: 303 });
}
