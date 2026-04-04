import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedGa4AdminRequest } from "@/lib/analytics/ga4-auth";
import { setKeyEvent } from "@/lib/analytics/ga4-api";

interface KeyEventPayload {
  eventName?: string;
  enabled?: boolean;
}

const ALLOWED_EVENT_NAMES = new Set([
  "bf_join_flow_started",
  "bf_app_store_cta_click",
  "bf_cta_click",
  "bf_marketing_page_view",
  "bf_scroll_depth",
  "page_view",
]);

export async function POST(request: NextRequest) {
  if (!isAuthorizedGa4AdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let payload: KeyEventPayload;
  try {
    payload = (await request.json()) as KeyEventPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const eventName = payload.eventName?.trim();
  if (!eventName) {
    return NextResponse.json({ message: "eventName is required." }, { status: 400 });
  }
  if (!ALLOWED_EVENT_NAMES.has(eventName)) {
    return NextResponse.json({ message: "eventName is not allowed." }, { status: 400 });
  }
  if (typeof payload.enabled !== "boolean") {
    return NextResponse.json({ message: "enabled must be a boolean." }, { status: 400 });
  }

  try {
    await setKeyEvent(eventName, payload.enabled);
    return NextResponse.json(
      {
        ok: true,
        eventName,
        enabled: payload.enabled,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update key event.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
