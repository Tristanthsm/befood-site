import { NextRequest, NextResponse } from "next/server";

import { findCoachByInviteCode } from "@/lib/join/coach";
import { APP_STORE_URL, JOIN_CLICK_COOKIE, JOIN_SESSION_COOKIE, SHARE_BASE_URL } from "@/lib/join/constants";
import { buildAppDeepLink } from "@/lib/join/links";
import { parseJoinContextFromSearchParams } from "@/lib/join/params";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "edge";

interface JoinTrackPayload {
  search?: unknown;
  referrer?: unknown;
  fullUrl?: unknown;
}

interface CoachTokenResponse {
  token?: unknown;
}

function isUuid(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toSafeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, maxLength);
}

function parseSearchFromPayload(payload: JoinTrackPayload): URLSearchParams {
  const rawSearch = typeof payload.search === "string" ? payload.search : "";
  const normalized = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
  return new URLSearchParams(normalized);
}

function resolveClientIp(request: NextRequest): string | null {
  const rawIp =
    toSafeString(request.headers.get("cf-connecting-ip"), 128) ??
    toSafeString(request.headers.get("x-forwarded-for"), 256);
  if (!rawIp) {
    return null;
  }

  const first = rawIp.split(",")[0]?.trim();
  return first || null;
}

async function issueCoachBridgeToken(coachCode: string, clientIp?: string | null): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const supabaseApiKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "";

  if (!supabaseUrl || !supabaseApiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-coach-token?coach_code=${encodeURIComponent(coachCode)}`,
      {
        method: "GET",
        headers: {
          apikey: supabaseApiKey,
          "Content-Type": "application/json",
          ...(clientIp ? { "x-forwarded-for": clientIp, "cf-connecting-ip": clientIp } : {}),
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json().catch(() => ({}))) as CoachTokenResponse;
    const token = typeof payload.token === "string" ? payload.token.trim() : "";
    if (!token.startsWith("BFTOKEN_")) {
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as JoinTrackPayload;
  const context = parseJoinContextFromSearchParams(parseSearchFromPayload(payload));
  const clientIp = resolveClientIp(request);

  const existingSessionId = request.cookies.get(JOIN_SESSION_COOKIE)?.value;
  const sessionId = existingSessionId && isUuid(existingSessionId)
    ? existingSessionId
    : crypto.randomUUID();
  const clickId = crypto.randomUUID();

  let coachProfileUserId: string | null = null;
  let coachBusinessName: string | null = null;
  let coachToken: string | null = null;
  let bridgeStatus: "none" | "issued" | "failed" = "none";

  try {
    const supabase = getSupabaseServiceRoleClient();

    if (context.coachCode) {
      const coach = await findCoachByInviteCode(supabase, context.coachCode);
      if (coach) {
        coachProfileUserId = coach.userId;
        coachBusinessName = coach.businessName;
        coachToken = await issueCoachBridgeToken(coach.inviteCode, clientIp);
        bridgeStatus = coachToken ? "issued" : "failed";
      }
    }

    const requestReferrer =
      toSafeString(payload.referrer, 2048) ??
      toSafeString(request.headers.get("referer"), 2048);
    const fullUrl =
      toSafeString(payload.fullUrl, 2048) ??
      `${SHARE_BASE_URL}/join${context.queryString ? `?${context.queryString}` : ""}`;

    const { error: insertError } = await supabase.from("web_join_sessions").insert({
      click_id: clickId,
      session_id: sessionId,
      coach_code: context.coachCode,
      coach_profile_user_id: coachProfileUserId,
      ref: context.ref,
      utm_source: context.utmSource,
      utm_medium: context.utmMedium,
      utm_campaign: context.utmCampaign,
      utm_term: context.utmTerm,
      utm_content: context.utmContent,
      http_referrer: requestReferrer,
      user_agent: toSafeString(request.headers.get("user-agent"), 1024),
      landing_path: "/join",
      query_string: context.queryString,
      app_open_attempted_at: new Date().toISOString(),
      bridge_nonce: null,
      bridge_status: bridgeStatus,
      metadata: {
        full_url: fullUrl,
      },
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  } catch (error) {
    console.error("[join-track] unable to persist tracking context", error);

    return NextResponse.json(
      {
        message: "Unable to initialize join tracking.",
      },
      { status: 500 },
    );
  }

  const deepLinkUrl = buildAppDeepLink(context, {
    clickId,
    sessionId,
    coachToken,
  });

  const appStoreRedirectUrl = `/api/join/app-store?click_id=${encodeURIComponent(clickId)}`;

  const response = NextResponse.json({
    clickId,
    sessionId,
    deepLinkUrl,
    coachToken,
    appStoreRedirectUrl,
    appStoreUrl: APP_STORE_URL,
    coach: coachBusinessName && context.coachCode
      ? {
          businessName: coachBusinessName,
          coachCode: context.coachCode,
        }
      : null,
  });

  response.cookies.set(JOIN_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set(JOIN_CLICK_COOKIE, clickId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
