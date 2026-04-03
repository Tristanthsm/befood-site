import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

interface AndroidWaitlistPayload {
  email?: unknown;
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

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as AndroidWaitlistPayload;

  const emailInput = clean(payload.email, 320)?.toLowerCase() ?? "";
  if (!emailInput || !isValidEmail(emailInput)) {
    return NextResponse.json({ message: "Adresse email invalide." }, { status: 400 });
  }

  const source = clean(payload.source, 80) ?? "unknown";
  const httpReferrer =
    clean(payload.referrer, 2048) ??
    clean(request.headers.get("referer"), 2048);
  const fullUrl = clean(payload.fullUrl, 2048);
  const userAgent = clean(request.headers.get("user-agent"), 1024);

  try {
    const supabase = getSupabaseServiceRoleClient();

    const { error } = await supabase
      .from("android_waitlist_emails")
      .upsert(
        {
          email: emailInput,
          email_normalized: emailInput,
          source,
          http_referrer: httpReferrer,
          user_agent: userAgent,
          metadata: {
            full_url: fullUrl,
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email_normalized",
          ignoreDuplicates: false,
        },
      );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
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
