import { NextRequest, NextResponse } from "next/server";

import { normalizeContractRegistrationStatus } from "@/lib/contract/internal-contract";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    return NextResponse.redirect(withResultQuery("/espace-coach/infos-contractuelles", request, "error", "invalid_form"), { status: 303 });
  }

  const redirectPath = sanitizeRedirectPath(formData.get("redirectTo"), "/espace-coach/infos-contractuelles");

  const contractCoachEmail = cleanText(formData.get("contract_coach_email"), 320);
  const contractCoachStatus = cleanText(formData.get("contract_coach_status"), 250);
  const contractCoachAddress = cleanText(formData.get("contract_coach_address"), 500);
  const registrationStatusInput = cleanText(formData.get("contract_registration_status"), 40);
  const contractCoachRegistrationInput = cleanText(formData.get("contract_coach_registration"), 250);

  if (!contractCoachEmail || !contractCoachStatus || !contractCoachAddress || !registrationStatusInput) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "missing_contract_fields"), { status: 303 });
  }

  if (registrationStatusInput !== "provided" && registrationStatusInput !== "pending_creation") {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_registration_status"), { status: 303 });
  }

  const contractRegistrationStatus = normalizeContractRegistrationStatus(registrationStatusInput);
  const contractCoachRegistration = contractRegistrationStatus === "provided"
    ? contractCoachRegistrationInput
    : null;

  if (contractRegistrationStatus === "provided" && !contractCoachRegistration) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "missing_contract_registration"), { status: 303 });
  }

  if (!isValidEmail(contractCoachEmail)) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_email"), { status: 303 });
  }

  const serviceRole = getSupabaseServiceRoleClient();
  const { data: coachRequest, error: coachRequestError } = await serviceRole
    .from("coach_requests")
    .select("id,status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (coachRequestError || !coachRequest?.id) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "not_found"), { status: 303 });
  }

  const currentStatus = String(coachRequest.status ?? "").toLowerCase();
  const canUpdateContractInfo =
    currentStatus === "approved"
    || currentStatus === "to_prepare"
    || currentStatus === "changes_requested";

  if (!canUpdateContractInfo) {
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "invalid_transition"), { status: 303 });
  }

  const { error: updateError } = await serviceRole
    .from("coach_requests")
    .update({
      contract_coach_email: contractCoachEmail,
      contract_coach_status: contractCoachStatus,
      contract_coach_address: contractCoachAddress,
      contract_coach_registration: contractCoachRegistration,
      contract_registration_status: contractRegistrationStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coachRequest.id);

  if (updateError) {
    console.error("[coach-contract-details] update failed", updateError);
    return NextResponse.redirect(withResultQuery(redirectPath, request, "error", "update_failed"), { status: 303 });
  }

  return NextResponse.redirect(withResultQuery(redirectPath, request, "updated", "1"), { status: 303 });
}
