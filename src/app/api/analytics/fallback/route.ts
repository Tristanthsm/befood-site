import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "edge";

const FALLBACK_GA4_MEASUREMENT_ID = "G-TG78RM45LE";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "bf_marketing_page_view",
  "bf_cta_click",
  "bf_app_store_cta_click",
  "bf_scroll_depth",
  "bf_join_flow_started",
  "bf_web_vital",
]);

type FallbackPayload = {
  eventName?: unknown;
  clientId?: unknown;
  pagePath?: unknown;
  pageLocation?: unknown;
  params?: unknown;
};

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

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

function sanitizeParams(raw: unknown): Record<string, string | number | boolean> {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const entries = Object.entries(raw as Record<string, unknown>).slice(0, 40);
  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, value] of entries) {
    const safeKey = cleanString(key, 64);
    if (!safeKey) {
      continue;
    }

    if (typeof value === "string") {
      sanitized[safeKey] = value.slice(0, 512);
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      sanitized[safeKey] = value;
    }
  }

  return sanitized;
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: "ga-fallback",
    windowMs: 5 * 60 * 1000,
    maxRequests: 120,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many telemetry events." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Unauthorized request origin." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => ({}))) as FallbackPayload;
  const eventName = cleanString(payload.eventName, 64);
  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ message: "Unsupported event name." }, { status: 400 });
  }

  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || FALLBACK_GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET?.trim() ?? "";
  if (!apiSecret || !measurementId) {
    return NextResponse.json({ ok: true, forwarded: false }, { status: 200 });
  }

  const clientId = cleanString(payload.clientId, 120) ?? crypto.randomUUID();
  const pagePath = cleanString(payload.pagePath, 2048);
  const pageLocation = cleanString(payload.pageLocation, 2048);
  const params = sanitizeParams(payload.params);

  const eventParams = {
    ...params,
    page_path: pagePath || params.page_path,
    page_location: pageLocation || params.page_location,
    engagement_time_msec: typeof params.engagement_time_msec === "number" ? params.engagement_time_msec : 1,
    debug_mode: false,
  };

  const gaResponse = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        non_personalized_ads: true,
        events: [
          {
            name: eventName,
            params: eventParams,
          },
        ],
      }),
    },
  );

  if (!gaResponse.ok) {
    const body = await gaResponse.text();
    console.error("[ga-fallback] measurement protocol error", {
      status: gaResponse.status,
      body: body.slice(0, 300),
    });
  }

  return NextResponse.json({ ok: true, forwarded: gaResponse.ok }, { status: 200 });
}

