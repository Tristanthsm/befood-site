import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_COACH_LEGAL_STATUS,
  normalizeContractRegistrationStatus,
} from "@/lib/contract/internal-contract";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

type CoachApplicationPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileType?: string;
  legalStatus?: string;
  legalAddress?: string;
  legalRegistration?: string;
  registrationStatus?: string;
  activity?: string;
  expertise?: string;
  audience?: string;
  motivation?: string;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const requestUrl = new URL(request.url);
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

function hasInvalidLength(values: string[]): boolean {
  return values.some((value) => value.length > 2000);
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes("does not exist");
}

function buildCertification(profileType: string, expertise: string, activity: string): string {
  if (expertise) {
    return expertise.slice(0, 500);
  }

  if (profileType) {
    return `Profil: ${profileType}`.slice(0, 500);
  }

  return activity.slice(0, 500) || "À compléter";
}

async function resolveAuthenticatedContext(): Promise<{
  userId: string;
  email: string | null;
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;
} | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      return null;
    }
    return {
      userId: user.id,
      email: user.email?.trim() ?? null,
      supabase,
    };
  } catch {
    return null;
  }
}

async function ensureProfileForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  email: string | null;
}): Promise<void> {
  const { data: existingProfile, error: profileSelectError } = await input.supabase
    .from("profiles")
    .select("id")
    .eq("id", input.userId)
    .maybeSingle();

  if (profileSelectError) {
    throw new Error(profileSelectError.message);
  }

  if (existingProfile?.id) {
    return;
  }

  const { error: profileInsertError } = await input.supabase
    .from("profiles")
    .insert({
      id: input.userId,
      email: input.email,
    });

  if (profileInsertError) {
    throw new Error(profileInsertError.message);
  }
}

async function upsertCoachRequestForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileType: string;
  legalStatus: string;
  legalAddress: string;
  legalRegistration: string | null;
  registrationStatus: "provided" | "pending_creation";
  expertise: string;
  activity: string;
  audience: string;
  motivation: string;
}): Promise<void> {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const certification = buildCertification(input.profileType, input.expertise, input.activity);

  const { data: existing, error: selectError } = await input.supabase
    .from("coach_requests")
    .select("id,status")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  const nextStatus = "pending";
  const extendedPayload = {
    full_name: fullName.slice(0, 250),
    certification,
    profile_type: input.profileType.slice(0, 250),
    activity: input.activity.slice(0, 2000),
    expertise: input.expertise.slice(0, 2000),
    audience: input.audience.slice(0, 2000),
    motivation: input.motivation.slice(0, 2000),
    contract_coach_full_name: fullName.slice(0, 250),
    contract_coach_email: input.email.slice(0, 320),
    contract_coach_status: input.legalStatus.slice(0, 250),
    contract_coach_address: input.legalAddress.slice(0, 500),
    contract_coach_registration: input.legalRegistration ? input.legalRegistration.slice(0, 250) : null,
    contract_registration_status: input.registrationStatus,
    admin_note: null,
    admin_message: null,
    updated_at: new Date().toISOString(),
    status: nextStatus,
  };

  if (existing?.id) {
    const { data: updatedRow, error: updateError } = await input.supabase
      .from("coach_requests")
      .update(extendedPayload)
      .eq("id", existing.id)
      .select("id")
      .maybeSingle();

    if (!updateError && updatedRow) {
      return;
    }

    if (!updateError) {
      throw new Error("Coach request update was not applied.");
    }

    if (!isMissingColumnError(updateError.message)) {
      throw new Error(updateError.message);
    }

    const { data: legacyUpdatedRow, error: legacyUpdateError } = await input.supabase
      .from("coach_requests")
      .update({
        full_name: fullName.slice(0, 250),
        certification,
        status: nextStatus,
      })
      .eq("id", existing.id)
      .select("id")
      .maybeSingle();

    if (legacyUpdateError) {
      throw new Error(legacyUpdateError.message);
    }

    if (!legacyUpdatedRow) {
      throw new Error("Coach request update was not applied.");
    }
    return;
  }

  const { error } = await input.supabase
    .from("coach_requests")
    .insert({
      user_id: input.userId,
      ...extendedPayload,
    });

  if (!error) {
    return;
  }

  if (!isMissingColumnError(error.message)) {
    throw new Error(error.message);
  }

  const { error: legacyInsertError } = await input.supabase
    .from("coach_requests")
    .insert({
      user_id: input.userId,
      full_name: fullName.slice(0, 250),
      certification,
      status: "pending",
    });

  if (legacyInsertError) {
    throw new Error(legacyInsertError.message);
  }
}

async function ensureCoachRequestState(input: {
  userId: string;
  email: string | null;
  applicationEmail: string;
  firstName: string;
  lastName: string;
  profileType: string;
  legalStatus: string;
  legalAddress: string;
  legalRegistration: string | null;
  registrationStatus: "provided" | "pending_creation";
  expertise: string;
  activity: string;
  audience: string;
  motivation: string;
  preferredSupabaseClient: SupabaseClient;
}): Promise<void> {
  const writeWithClient = async (supabase: SupabaseClient) => {
    await ensureProfileForUser({
      supabase,
      userId: input.userId,
      email: input.email,
    });

    await upsertCoachRequestForUser({
      supabase,
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.applicationEmail,
      profileType: input.profileType,
      legalStatus: input.legalStatus,
      legalAddress: input.legalAddress,
      legalRegistration: input.legalRegistration,
      registrationStatus: input.registrationStatus,
      expertise: input.expertise,
      activity: input.activity,
      audience: input.audience,
      motivation: input.motivation,
    });
  };

  try {
    await writeWithClient(input.preferredSupabaseClient);
  } catch (primaryError) {
    try {
      await writeWithClient(getSupabaseServiceRoleClient());
    } catch {
      throw primaryError;
    }
  }
}

async function getExistingCoachRequestStatus(input: {
  userId: string;
  preferredSupabaseClient: SupabaseClient;
}): Promise<string | null> {
  const readWithClient = async (supabase: SupabaseClient) => {
    const { data, error } = await supabase
      .from("coach_requests")
      .select("status")
      .eq("user_id", input.userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return typeof data?.status === "string" ? data.status.toLowerCase() : null;
  };

  try {
    return await readWithClient(input.preferredSupabaseClient);
  } catch {
    try {
      return await readWithClient(getSupabaseServiceRoleClient());
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Requête non autorisée." }, { status: 403 });
  }

  const payload = await request.json().catch(() => null) as CoachApplicationPayload | null;

  if (!payload) {
    return NextResponse.json({ message: "Payload invalide." }, { status: 400 });
  }

  const firstName = clean(payload.firstName);
  const lastName = clean(payload.lastName);
  const email = clean(payload.email);
  const phone = clean(payload.phone);
  const profileType = clean(payload.profileType);
  const legalStatus = clean(payload.legalStatus);
  const legalAddress = clean(payload.legalAddress) || "À compléter après validation";
  const registrationStatusRaw = clean(payload.registrationStatus) || "pending_creation";
  if (registrationStatusRaw !== "provided" && registrationStatusRaw !== "pending_creation") {
    return NextResponse.json({ message: "Merci de préciser votre situation SIREN / SIRET." }, { status: 400 });
  }
  const registrationStatus = normalizeContractRegistrationStatus(registrationStatusRaw);
  const legalRegistrationInput = clean(payload.legalRegistration);
  const legalRegistration = registrationStatus === "provided"
    ? legalRegistrationInput
    : null;
  const activity = clean(payload.activity);
  const expertise = clean(payload.expertise);
  const audience = clean(payload.audience);
  const motivation = clean(payload.motivation);

  if (!firstName || !lastName || !email || !profileType || !legalStatus || !activity || !motivation) {
    return NextResponse.json({ message: "Merci de compléter les champs obligatoires." }, { status: 400 });
  }

  if (profileType !== "coach" && profileType !== "createur") {
    return NextResponse.json({ message: "Profil invalide. Choisissez coach ou créateur." }, { status: 400 });
  }

  if (profileType === "coach" && !expertise) {
    return NextResponse.json(
      { message: "Pour une candidature coach, merci d'indiquer votre diplôme ou certification." },
      { status: 400 },
    );
  }

  if (registrationStatus === "provided" && !legalRegistration) {
    return NextResponse.json({ message: "Merci de renseigner votre SIREN / SIRET." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Adresse email invalide." }, { status: 400 });
  }

  if (
    hasInvalidLength([
      firstName,
      lastName,
      email,
      phone,
      profileType,
      legalStatus,
      legalAddress,
      legalRegistration ?? "",
      registrationStatus,
      activity,
      expertise,
      audience,
      motivation,
    ])
  ) {
    return NextResponse.json({ message: "Contenu trop long." }, { status: 400 });
  }

  const authenticatedContext = await resolveAuthenticatedContext();
  let existingStatus: string | null = null;
  if (authenticatedContext) {
    existingStatus = await getExistingCoachRequestStatus({
      userId: authenticatedContext.userId,
      preferredSupabaseClient: authenticatedContext.supabase,
    });

    if (existingStatus === "pending") {
      return NextResponse.json(
        { message: "Votre dossier est déjà envoyé et en cours de validation." },
        { status: 409 },
      );
    }

    if (
      existingStatus === "approved"
      || existingStatus === "to_prepare"
      || existingStatus === "sent"
      || existingStatus === "signed_pending_verification"
      || existingStatus === "verified"
    ) {
      return NextResponse.json(
        { message: "Votre candidature est déjà validée. Continuez dans votre espace coach." },
        { status: 409 },
      );
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { message: "Envoi indisponible: RESEND_API_KEY non configurée côté serveur." },
      { status: 500 },
    );
  }

  const toEmail = process.env.COACH_APPLICATION_TO_EMAIL ?? "contact@befood.fr";
  const fromEmail = process.env.COACH_APPLICATION_FROM_EMAIL ?? "BeFood <contact@befood.fr>";

  const subject = `Nouvelle candidature BeFood - ${firstName} ${lastName}`;
  const lines = [
    "Nouvelle candidature BeFood",
    "",
    `Prénom: ${firstName}`,
    `Nom: ${lastName}`,
    `Email: ${email}`,
    `Téléphone: ${phone || "-"}`,
    `Profil principal: ${profileType}`,
    `Statut juridique: ${legalStatus || DEFAULT_COACH_LEGAL_STATUS}`,
    `Adresse contractuelle: ${legalAddress}`,
    `Situation SIREN / SIRET: ${registrationStatus === "provided" ? "Renseigné" : "En cours de création"}`,
    `SIREN / SIRET: ${legalRegistration ?? "En cours de création"}`,
    `Activité: ${activity}`,
    `Diplôme / expertise: ${expertise || "-"}`,
    `Audience: ${audience || "-"}`,
    "",
    "Motivation",
    motivation,
    "",
    `Date: ${new Date().toISOString()}`,
  ];

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject,
      text: lines.join("\n"),
    }),
  });

  if (!resendResponse.ok) {
    const resendBody = await resendResponse.text();
    let resendMessage = "";
    try {
      resendMessage = String((JSON.parse(resendBody) as { message?: unknown }).message ?? "");
    } catch {
      resendMessage = "";
    }

    console.error("[coach-application] resend error", {
      status: resendResponse.status,
      body: resendBody.slice(0, 300),
    });

    if (resendResponse.status === 403 && resendMessage.includes("verify a domain")) {
      return NextResponse.json(
        {
          message:
            "Resend est en mode test. Vérifiez un domaine dans Resend et utilisez une adresse d'envoi (FROM) de ce domaine.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { message: "Échec d'envoi email. Merci de réessayer dans quelques minutes." },
      { status: 502 },
    );
  }

  let coachSpaceEnabled = false;
  let message = "Candidature envoyée.";

  if (authenticatedContext) {
    try {
      await ensureCoachRequestState({
        userId: authenticatedContext.userId,
        email: authenticatedContext.email,
        applicationEmail: email,
        firstName,
        lastName,
        profileType,
        legalStatus,
        legalAddress,
        legalRegistration,
        registrationStatus,
        expertise,
        activity,
        audience,
        motivation,
        preferredSupabaseClient: authenticatedContext.supabase,
      });
      coachSpaceEnabled = true;
      message = existingStatus === null
        ? "Candidature envoyée. Votre espace coach a été activé."
        : "Candidature envoyée.";
    } catch (error) {
      console.error("[coach-application] unable to create coach request state", error);
      if (existingStatus === null) {
        message = "Candidature envoyée. L'espace coach sera activé après vérification par BeFood.";
      } else {
        coachSpaceEnabled = true;
        message = "Candidature envoyée.";
      }
    }
  }

  return NextResponse.json({ message, coachSpaceEnabled }, { status: 200 });
}
