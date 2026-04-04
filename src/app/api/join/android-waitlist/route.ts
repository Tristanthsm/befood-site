import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/security/rate-limit";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

interface AndroidWaitlistPayload {
  email?: unknown;
  firstName?: unknown;
  goal?: unknown;
  source?: unknown;
  referrer?: unknown;
  fullUrl?: unknown;
}

function clean(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isMissingTableError(message: string): boolean {
  return message.toLowerCase().includes("relation") && message.toLowerCase().includes("does not exist");
}

function isDuplicateErrorCode(code: string | undefined): boolean {
  return code === "23505";
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const requestUrl = new URL(request.url);
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

async function sendWaitlistNotificationEmail(input: {
  email: string;
  firstName: string | null;
  goal: string | null;
  source: string;
  referrer: string | null;
  fullUrl: string | null;
}) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (!resendApiKey) {
    console.error("[android-waitlist] RESEND_API_KEY is missing; notification skipped");
    return;
  }

  const toEmail = process.env.ANDROID_WAITLIST_TO_EMAIL?.trim() || process.env.SUPPORT_TO_EMAIL?.trim() || "contact@befood.fr";
  const fromEmail =
    process.env.ANDROID_WAITLIST_FROM_EMAIL?.trim() ||
    process.env.SUPPORT_FROM_EMAIL?.trim() ||
    "BeFood <contact@befood.fr>";

  const subject = "Nouvelle inscription waitlist Android BeFood";
  const lines = [
    "Nouvelle inscription waitlist Android",
    "",
    `Email: ${input.email}`,
    `Prenom: ${input.firstName || "-"}`,
    `Objectif: ${input.goal || "-"}`,
    `Source: ${input.source}`,
    `Referrer: ${input.referrer || "-"}`,
    `URL: ${input.fullUrl || "-"}`,
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
      reply_to: input.email,
      subject,
      text: lines.join("\n"),
    }),
  });

  if (!resendResponse.ok) {
    const resendBody = await resendResponse.text();
    console.error("[android-waitlist] resend notification failed", {
      status: resendResponse.status,
      body: resendBody.slice(0, 300),
    });
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: "android-waitlist",
    windowMs: 10 * 60 * 1000,
    maxRequests: 8,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Trop de tentatives. Merci de réessayer dans quelques minutes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Requête non autorisée." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => ({}))) as AndroidWaitlistPayload;

  const emailInput = clean(payload.email, 320)?.toLowerCase() ?? "";
  if (!emailInput || !isValidEmail(emailInput)) {
    return NextResponse.json({ message: "Adresse email invalide." }, { status: 400 });
  }
  const firstName = clean(payload.firstName, 120);
  const goal = clean(payload.goal, 280);

  const source = clean(payload.source, 80) ?? "unknown";
  const httpReferrer =
    clean(payload.referrer, 2048) ??
    clean(request.headers.get("referer"), 2048);
  const fullUrl = clean(payload.fullUrl, 2048);
  const userAgent = clean(request.headers.get("user-agent"), 1024);

  try {
    const supabase = getSupabaseServiceRoleClient();

    const { data: existing, error: existingError } = await supabase
      .from("android_waitlist_emails")
      .select("id")
      .eq("email_normalized", emailInput)
      .maybeSingle();

    if (existingError) {
      if (isMissingTableError(existingError.message)) {
        return NextResponse.json(
          {
            message: "Configuration waitlist incomplète. Migration Supabase à déployer.",
          },
          { status: 500 },
        );
      }
      throw new Error(existingError.message);
    }

    if (existing?.id) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: "Email déjà inscrit à la liste Android.",
      });
    }

    const { error: insertError } = await supabase
      .from("android_waitlist_emails")
      .insert({
        email: emailInput,
        email_normalized: emailInput,
        first_name: firstName,
        goal,
        source,
        http_referrer: httpReferrer,
        user_agent: userAgent,
        metadata: {
          full_url: fullUrl,
        },
      });

    if (insertError) {
      if (isDuplicateErrorCode(insertError.code)) {
        return NextResponse.json({
          ok: true,
          duplicate: true,
          message: "Email déjà inscrit à la liste Android.",
        });
      }

      if (isMissingTableError(insertError.message)) {
        return NextResponse.json(
          {
            message: "Configuration waitlist incomplète. Migration Supabase à déployer.",
          },
          { status: 500 },
        );
      }

      throw new Error(insertError.message);
    }

    await sendWaitlistNotificationEmail({
      email: emailInput,
      firstName,
      goal,
      source,
      referrer: httpReferrer,
      fullUrl,
    });

    return NextResponse.json({
      ok: true,
      duplicate: false,
      message: "Inscription enregistrée.",
    });
  } catch (error) {
    console.error("[android-waitlist] unable to persist email", error);
    return NextResponse.json(
      {
        message: "Inscription indisponible pour le moment.",
      },
      { status: 500 },
    );
  }
}
