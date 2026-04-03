import { NextRequest, NextResponse } from "next/server";

import {
  INTERNAL_CONTRACT_VERSION,
  appendContractEvent,
  appendContractOpenedEventIfNeeded,
  buildContractSignatureSnapshot,
  getClientIpFromHeaders,
  hasUnresolvedContractPlaceholders,
  normalizeContractLifecycleStatus,
  sha256Hex,
  type ContractSignatureType,
} from "@/lib/contract/internal-contract";
import { normalizeCoachRequestStatus } from "@/lib/supabase/coach-requests";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

function withResultQuery(path: string, request: NextRequest, key: "signed" | "error", value: string): URL {
  const url = new URL(path, request.url);
  url.searchParams.set(key, value);
  return url;
}

function isSignatureType(value: string | null): value is ContractSignatureType {
  return value === "typed" || value === "drawn";
}

async function sendSignatureProofEmails(input: {
  coachEmail: string;
  coachFullName: string;
  requestId: string;
  signedAtIso: string;
  contractVersion: string;
  contractContentHash: string;
  snapshotHash: string;
  signatureType: ContractSignatureType;
}) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (!resendApiKey) {
    return;
  }

  const adminEmail = process.env.COACH_APPLICATION_TO_EMAIL?.trim() || "contact@befood.fr";
  const fromEmail = process.env.COACH_APPLICATION_FROM_EMAIL?.trim() || "BeFood <contact@befood.fr>";

  const subject = `Preuve de signature contrat - ${input.coachFullName}`;
  const lines = [
    "Signature contrat coach - BeFood",
    "",
    `Coach: ${input.coachFullName}`,
    `Email coach: ${input.coachEmail}`,
    `Request ID: ${input.requestId}`,
    `Date signature (UTC): ${input.signedAtIso}`,
    `Version contrat: ${input.contractVersion}`,
    `Hash contenu contrat (SHA-256): ${input.contractContentHash}`,
    `Hash snapshot de preuve (SHA-256): ${input.snapshotHash}`,
    `Type de signature: ${input.signatureType}`,
  ];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [input.coachEmail, adminEmail],
      subject,
      text: lines.join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`resend proof email failed (${response.status}): ${body.slice(0, 240)}`);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Requête non autorisée." }, { status: 403 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.redirect(new URL("/connexion", request.url), { status: 303 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.redirect(withResultQuery("/espace-coach/contrat", request, "error", "invalid_form"), { status: 303 });
  }

  const redirectPath = sanitizeRedirectPath(formData.get("redirectTo"), "/espace-coach/contrat");
  const signatureTypeRaw = cleanText(formData.get("signature_type"), 20);
  if (!isSignatureType(signatureTypeRaw)) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_signature_type"), { status: 303 });
  }

  const consentChecked = formData.get("contract_consent") === "on";
  if (!consentChecked) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "consent_required"), { status: 303 });
  }

  const typedSignature = cleanText(formData.get("signature_typed"), 180);
  const drawnSignature = cleanText(formData.get("signature_drawn"), 20_000);
  const signatureValue = signatureTypeRaw === "typed" ? typedSignature : drawnSignature;

  if (!signatureValue) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "signature_required"), { status: 303 });
  }

  if (signatureTypeRaw === "drawn" && !signatureValue.startsWith("data:image/")) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_drawn_signature"), { status: 303 });
  }

  const serviceRole = getSupabaseServiceRoleClient();
  const primaryRequest = await serviceRole
    .from("coach_requests")
    .select("id,user_id,full_name,status,contract_status,contract_prepared_at,contract_prepared_content,contract_template_text,contract_coach_full_name,contract_coach_email,contract_coach_status,contract_coach_address,contract_coach_registration,contract_version,contract_content_hash,contract_signed_at")
    .eq("user_id", user.id)
    .maybeSingle();
  let requestRow: unknown = primaryRequest.data;
  let requestError = primaryRequest.error;

  if (requestError && requestError.message.toLowerCase().includes("does not exist")) {
    const fallbackRequest = await serviceRole
      .from("coach_requests")
      .select("id,user_id,full_name,status,contract_status,contract_prepared_at,contract_version,contract_content_hash,contract_signed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    requestRow = fallbackRequest.data;
    requestError = fallbackRequest.error;
  }

  if (requestError || !requestRow) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "not_found"), { status: 303 });
  }

  const row = requestRow as {
    id: unknown;
    full_name: unknown;
    status: unknown;
    contract_status?: unknown;
    contract_prepared_at?: unknown;
    contract_prepared_content?: unknown;
    contract_template_text?: unknown;
    contract_coach_full_name?: unknown;
    contract_coach_email?: unknown;
    contract_coach_status?: unknown;
    contract_coach_address?: unknown;
    contract_coach_registration?: unknown;
    contract_version?: unknown;
    contract_content_hash?: unknown;
    contract_signed_at?: unknown;
  };

  const requestId = String(row.id ?? "");
  const status = normalizeCoachRequestStatus(row.status);
  const contractStatus = normalizeContractLifecycleStatus(row.contract_status) || (status === "sent"
    ? "sent"
    : status === "signed_pending_verification"
      ? "signed_pending_verification"
      : status === "verified"
        ? "verified"
        : "none");

  if (status === "signed_pending_verification" || status === "verified" || contractStatus === "signed_pending_verification" || contractStatus === "verified") {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "signed", "1"), { status: 303 });
  }

  if (status !== "sent" && contractStatus !== "sent") {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_transition"), { status: 303 });
  }

  const coachFullName = cleanText(row.contract_coach_full_name, 250) ?? cleanText(row.full_name, 250) ?? "Coach partenaire";
  const coachEmail = cleanText(row.contract_coach_email, 320) ?? cleanText(user.email, 320) ?? "email-non-renseigne";
  const preparedContractText = cleanText(row.contract_prepared_content, 80_000);
  if (!preparedContractText) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "contract_not_prepared"), { status: 303 });
  }
  if (hasUnresolvedContractPlaceholders(preparedContractText)) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "unresolved_placeholders"), { status: 303 });
  }
  const computedPreparedHash = await sha256Hex(preparedContractText);
  const storedContractHash = cleanText(row.contract_content_hash, 128);
  if (storedContractHash && storedContractHash !== computedPreparedHash) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "contract_hash_mismatch"), { status: 303 });
  }
  const finalContractVersion = cleanText(row.contract_version, 120) ?? INTERNAL_CONTRACT_VERSION;
  const finalContractContentHash = storedContractHash ?? computedPreparedHash;

  const signedAtIso = new Date().toISOString();
  const signedIp = getClientIpFromHeaders(request.headers);
  const signedUserAgent = cleanText(request.headers.get("user-agent"), 500);

  const snapshot = buildContractSignatureSnapshot({
    requestId,
    coachUserId: user.id,
    coachFullName,
    coachEmail,
    signatureType: signatureTypeRaw,
    signatureValue,
    signedAtIso,
    signedIp,
    signedUserAgent,
    contractText: preparedContractText,
    contractContentHash: finalContractContentHash,
  });
  const snapshotHash = await sha256Hex(JSON.stringify(snapshot));

  const payload = {
    status: "signed_pending_verification",
    contract_status: "signed_pending_verification",
    contract_version: finalContractVersion,
    contract_content_hash: finalContractContentHash,
    contract_prepared_content: preparedContractText,
    contract_signed_at: signedAtIso,
    contract_signed_ip: signedIp,
    contract_signed_user_agent: signedUserAgent,
    contract_signed_email: coachEmail,
    contract_signature_type: signatureTypeRaw,
    contract_signature_payload: {
      ...snapshot,
      snapshotHash,
      snapshotGeneratedAt: signedAtIso,
      proofFormat: "json_snapshot_v1",
    },
    updated_at: signedAtIso,
  };

  const { data: updatedRow, error: updateError } = await serviceRole
    .from("coach_requests")
    .update(payload)
    .eq("id", requestId)
    .eq("user_id", user.id)
    .eq("status", "sent")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("[coach-contract-sign] failed to update request", updateError);
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "update_failed"), { status: 303 });
  }

  if (!updatedRow) {
    const { data: checkRow } = await serviceRole
      .from("coach_requests")
      .select("status")
      .eq("id", requestId)
      .maybeSingle();

    const alreadySigned = normalizeCoachRequestStatus(checkRow?.status) === "signed_pending_verification"
      || normalizeCoachRequestStatus(checkRow?.status) === "verified";
    if (alreadySigned) {
      return NextResponse.redirect(withResultQuery(redirectPath, request, "signed", "1"), { status: 303 });
    }

    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "update_failed"), { status: 303 });
  }

  await appendContractOpenedEventIfNeeded({
    requestId,
    actorUserId: user.id,
    dedupeMinutes: 720,
  }).catch((error) => {
    console.error("[coach-contract-sign] failed to append opened event", error);
  });

  await appendContractEvent({
    requestId,
    eventType: "signed",
    eventSource: "coach",
    actorUserId: user.id,
    payload: {
      signatureType: signatureTypeRaw,
      signedAt: signedAtIso,
      contractVersion: finalContractVersion,
      contractContentHash: finalContractContentHash,
      snapshotHash,
    },
  }).catch((error) => {
    console.error("[coach-contract-sign] failed to append signed event", error);
  });

  await sendSignatureProofEmails({
    coachEmail,
    coachFullName,
    requestId,
    signedAtIso,
    contractVersion: finalContractVersion,
    contractContentHash: finalContractContentHash,
    snapshotHash,
    signatureType: signatureTypeRaw,
  }).catch((error) => {
    console.error("[coach-contract-sign] proof email failed", error);
  });

  return NextResponse.redirect(withResultQuery(redirectPath, request, "signed", "1"), { status: 303 });
}
