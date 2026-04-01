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

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as JoinTrackPayload;
  const context = parseJoinContextFromSearchParams(parseSearchFromPayload(payload));

  const existingSessionId = request.cookies.get(JOIN_SESSION_COOKIE)?.value;
  const sessionId = existingSessionId && isUuid(existingSessionId)
    ? existingSessionId
    : crypto.randomUUID();
  const clickId = crypto.randomUUID();

  let coachProfileUserId: string | null = null;
  let coachBusinessName: string | null = null;
  let bridgeNonce: string | null = null;
  let bridgeStatus: "none" | "issued" | "failed" = "none";

  try {
    const supabase = getSupabaseServiceRoleClient();

    if (context.coachCode) {
      const coach = await findCoachByInviteCode(supabase, context.coachCode);
      if (coach) {
        coachProfileUserId = coach.userId;
        coachBusinessName = coach.businessName;
        bridgeNonce = crypto.randomUUID();

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const { error: nonceError } = await supabase.from("coach_token_nonces").insert({
          nonce: bridgeNonce,
          coach_code: coach.inviteCode,
          expires_at: expiresAt,
        });

        bridgeStatus = nonceError ? "failed" : "issued";
        if (nonceError) {
          bridgeNonce = null;
        }
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
      bridge_nonce: bridgeNonce,
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
    bridgeNonce,
  });

  const appStoreRedirectUrl = `/api/join/app-store?click_id=${encodeURIComponent(clickId)}`;

  const response = NextResponse.json({
    clickId,
    sessionId,
    deepLinkUrl,
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
