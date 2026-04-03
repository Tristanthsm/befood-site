import { NextRequest, NextResponse } from "next/server";

import { getAdminAccessContext } from "@/lib/admin/auth";
import {
  DEFAULT_COACH_CONTRACT_TEMPLATE,
  DEFAULT_COACH_LEGAL_STATUS,
  normalizeContractRegistrationStatus,
} from "@/lib/contract/internal-contract";
import { isAdminCoachRequestStatus } from "@/lib/supabase/admin-coach-requests";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "edge";

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
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("could not find") || normalized.includes("schema cache");
}

function isStatusConstraintError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("coach_requests_status_check") || normalized.includes("violates check constraint");
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

async function updateCoachRequestWithFallback(input: {
  requestId: string;
  status: string;
  adminUserId: string;
  adminNote: string | null;
  coachMessage: string | null;
  contractStatus: "to_prepare" | null;
  contractVersion: string | null;
  contractContentHash: string | null;
  contractPreparedContent: string | null;
  contractTemplateText: string | null;
  contractCoachFullName: string | null;
  contractCoachEmail: string | null;
  contractCoachStatus: string | null;
  contractCoachAddress: string | null;
  contractCoachRegistration: string | null;
  contractRegistrationStatus: "provided" | "pending_creation" | null;
  contractPreparedAt: string | null;
}) {
  const serviceRole = getSupabaseServiceRoleClient();
  const payloadWithContractAndCoachMessage = {
    status: input.status,
    updated_by: input.adminUserId,
    updated_at: new Date().toISOString(),
    admin_note: input.adminNote,
    admin_message: input.coachMessage,
    contract_status: input.contractStatus,
    contract_version: input.contractVersion,
    contract_content_hash: input.contractContentHash,
    contract_prepared_content: input.contractPreparedContent,
    contract_template_text: input.contractTemplateText,
    contract_coach_full_name: input.contractCoachFullName,
    contract_coach_email: input.contractCoachEmail,
    contract_coach_status: input.contractCoachStatus,
    contract_coach_address: input.contractCoachAddress,
    contract_coach_registration: input.contractCoachRegistration,
    contract_registration_status: input.contractRegistrationStatus,
    contract_prepared_at: input.contractPreparedAt,
  };
  const payloadWithoutContract = {
    status: input.status,
    updated_by: input.adminUserId,
    updated_at: new Date().toISOString(),
    admin_note: input.adminNote,
    admin_message: input.coachMessage,
  };
  const payloadWithoutContractAndCoachMessage = {
    status: input.status,
    updated_by: input.adminUserId,
    updated_at: new Date().toISOString(),
    admin_note: input.adminNote,
  };

  let { data, error } = await serviceRole
    .from("coach_requests")
    .update(payloadWithContractAndCoachMessage)
    .eq("id", input.requestId)
    .select("id")
    .maybeSingle();

  if (error && isMissingColumnError(error.message)) {
    const noContract = await serviceRole
      .from("coach_requests")
      .update(payloadWithoutContract)
      .eq("id", input.requestId)
      .select("id")
      .maybeSingle();
    data = noContract.data;
    error = noContract.error;
  }

  if (error && isMissingColumnError(error.message)) {
    const noCoachMessage = await serviceRole
      .from("coach_requests")
      .update(payloadWithoutContractAndCoachMessage)
      .eq("id", input.requestId)
      .select("id")
      .maybeSingle();
    data = noCoachMessage.data;
    error = noCoachMessage.error;
  }

  if (error && isMissingColumnError(error.message)) {
    const legacy = await serviceRole
      .from("coach_requests")
      .update({ status: input.status })
      .eq("id", input.requestId)
      .select("id")
      .maybeSingle();
    data = legacy.data;
    error = legacy.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getCoachRequestIdentity(requestId: string): Promise<{
  coachFullName: string;
  coachEmail: string;
  coachStatus: string;
  coachAddress: string;
  coachRegistration: string | null;
  registrationStatus: "provided" | "pending_creation";
} | null> {
  const serviceRole = getSupabaseServiceRoleClient();
  const requestResult = await serviceRole
    .from("coach_requests")
    .select("id,user_id,full_name,contract_coach_full_name,contract_coach_email,contract_coach_status,contract_coach_address,contract_coach_registration,contract_registration_status")
    .eq("id", requestId)
    .maybeSingle();

  if (requestResult.error || !requestResult.data) {
    return null;
  }

  const row = requestResult.data as {
    user_id?: unknown;
    full_name?: unknown;
    contract_coach_full_name?: unknown;
    contract_coach_email?: unknown;
    contract_coach_status?: unknown;
    contract_coach_address?: unknown;
    contract_coach_registration?: unknown;
    contract_registration_status?: unknown;
  };
  const userId = typeof row.user_id === "string" ? row.user_id : null;
  const coachFullName = typeof row.contract_coach_full_name === "string" && row.contract_coach_full_name.trim()
    ? row.contract_coach_full_name.trim()
    : typeof row.full_name === "string" && row.full_name.trim()
      ? row.full_name.trim()
      : "Coach partenaire";
  const coachStatus = typeof row.contract_coach_status === "string" && row.contract_coach_status.trim()
    ? row.contract_coach_status.trim()
    : DEFAULT_COACH_LEGAL_STATUS;
  const coachAddress = typeof row.contract_coach_address === "string" && row.contract_coach_address.trim()
    ? row.contract_coach_address.trim()
    : "";
  const coachRegistration = typeof row.contract_coach_registration === "string" && row.contract_coach_registration.trim()
    ? row.contract_coach_registration.trim()
    : null;
  const registrationStatus = normalizeContractRegistrationStatus(row.contract_registration_status, coachRegistration);

  if (!userId) {
    const coachEmail = typeof row.contract_coach_email === "string" && row.contract_coach_email.trim()
      ? row.contract_coach_email.trim()
      : "email-non-renseigne";
    return {
      coachFullName,
      coachEmail,
      coachStatus,
      coachAddress,
      coachRegistration,
      registrationStatus,
    };
  }

  const profileResult = await serviceRole
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  const fallbackProfileEmail = !profileResult.error && typeof profileResult.data?.email === "string" && profileResult.data.email.trim()
    ? profileResult.data.email.trim()
    : "email-non-renseigne";
  const coachEmail = typeof row.contract_coach_email === "string" && row.contract_coach_email.trim()
    ? row.contract_coach_email.trim()
    : fallbackProfileEmail;

  return {
    coachFullName,
    coachEmail,
    coachStatus,
    coachAddress,
    coachRegistration,
    registrationStatus,
  };
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

  const statusValue = cleanText(formData.get("status"), 40);
  if (!isAdminCoachRequestStatus(statusValue)) {
    return NextResponse.redirect(withResultQuery(fallbackRedirectPath, request, "error", "invalid_status"), { status: 303 });
  }

  const adminNote = cleanText(formData.get("admin_note"), 2000);
  const coachMessage = cleanText(formData.get("coach_message"), 2000);
  const redirectPath = sanitizeRedirectPath(formData.get("redirectTo"), fallbackRedirectPath);
  const shouldPrepareContract = statusValue === "approved";

  let resolvedStatus: string = statusValue;
  let contractStatus: "to_prepare" | null = null;
  let contractVersion: string | null = null;
  let contractContentHash: string | null = null;
  let contractPreparedContent: string | null = null;
  let contractTemplateText: string | null = null;
  let contractCoachFullName: string | null = null;
  let contractCoachEmail: string | null = null;
  let contractCoachStatus: string | null = null;
  let contractCoachAddress: string | null = null;
  let contractCoachRegistration: string | null = null;
  let contractRegistrationStatus: "provided" | "pending_creation" | null = null;
  let contractPreparedAt: string | null = null;

  if (shouldPrepareContract) {
    const coachIdentity = await getCoachRequestIdentity(requestId);
    if (!coachIdentity) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "not_found"), { status: 303 });
    }

    resolvedStatus = "to_prepare";
    contractStatus = "to_prepare";
    contractVersion = null;
    contractContentHash = null;
    contractPreparedContent = null;
    contractTemplateText = DEFAULT_COACH_CONTRACT_TEMPLATE;
    contractCoachFullName = coachIdentity.coachFullName;
    contractCoachEmail = coachIdentity.coachEmail;
    contractCoachStatus = coachIdentity.coachStatus;
    contractCoachAddress = coachIdentity.coachAddress;
    contractCoachRegistration = coachIdentity.coachRegistration;
    contractRegistrationStatus = coachIdentity.registrationStatus;
    contractPreparedAt = null;
  }

  try {
    const updated = await updateCoachRequestWithFallback({
      requestId,
      status: resolvedStatus,
      adminUserId: access.userId,
      adminNote,
      coachMessage,
      contractStatus,
      contractVersion,
      contractContentHash,
      contractPreparedContent,
      contractTemplateText,
      contractCoachFullName,
      contractCoachEmail,
      contractCoachStatus,
      contractCoachAddress,
      contractCoachRegistration,
      contractRegistrationStatus,
      contractPreparedAt,
    });

    if (!updated && shouldPrepareContract) {
      const fallbackApproved = await updateCoachRequestWithFallback({
        requestId,
        status: "approved",
        adminUserId: access.userId,
        adminNote,
        coachMessage,
        contractStatus: null,
        contractVersion: null,
        contractContentHash: null,
        contractPreparedContent: null,
        contractTemplateText: null,
        contractCoachFullName: null,
        contractCoachEmail: null,
        contractCoachStatus: null,
        contractCoachAddress: null,
        contractCoachRegistration: null,
        contractRegistrationStatus: null,
        contractPreparedAt: null,
      });
      if (!fallbackApproved) {
        return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "not_found"), { status: 303 });
      }
    } else if (!updated) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "not_found"), { status: 303 });
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    if (shouldPrepareContract && isStatusConstraintError(message)) {
      try {
        const fallbackApproved = await updateCoachRequestWithFallback({
          requestId,
          status: "approved",
          adminUserId: access.userId,
          adminNote,
          coachMessage,
          contractStatus: null,
          contractVersion: null,
          contractContentHash: null,
          contractPreparedContent: null,
          contractTemplateText: null,
          contractCoachFullName: null,
          contractCoachEmail: null,
          contractCoachStatus: null,
          contractCoachAddress: null,
          contractCoachRegistration: null,
          contractRegistrationStatus: null,
          contractPreparedAt: null,
        });
        if (fallbackApproved) {
          return NextResponse.redirect(withResultQuery(redirectPath, request, "updated", "1"), { status: 303 });
        }
      } catch (fallbackError) {
        console.error("[admin-coachs] fallback approval update failed", fallbackError);
      }
    }
    console.error("[admin-coachs] failed to update coach request", error);
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "update_failed"), { status: 303 });
  }

  return NextResponse.redirect(withResultQuery(redirectPath, request, "updated", "1"), { status: 303 });
}
