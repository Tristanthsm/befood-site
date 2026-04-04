import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedGa4AdminRequest } from "@/lib/analytics/ga4-auth";
import { listConversionEvents, listEventsLast30Days } from "@/lib/analytics/ga4-api";

export async function GET(request: NextRequest) {
  if (!isAuthorizedGa4AdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const [eventsReport, conversionEvents] = await Promise.all([
      listEventsLast30Days(),
      listConversionEvents(),
    ]);

    const keyEventNames = new Set(
      conversionEvents
        .map((event) => event.eventName?.trim())
        .filter((eventName): eventName is string => Boolean(eventName)),
    );

    const events = (eventsReport.rows ?? []).map((row) => {
      const eventName = row.dimensionValues?.[0]?.value ?? "(not set)";
      return {
        eventName,
        eventCount: Number(row.metricValues?.[0]?.value ?? 0),
        isKeyEvent: keyEventNames.has(eventName),
      };
    });

    return NextResponse.json(
      {
        ok: true,
        events,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "GA4 events report failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
