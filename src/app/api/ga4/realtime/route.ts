import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedGa4AdminRequest } from "@/lib/analytics/ga4-auth";
import { runRealtimeReport } from "@/lib/analytics/ga4-api";

export async function GET(request: NextRequest) {
  if (!isAuthorizedGa4AdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const report = await runRealtimeReport();
    const rows = (report.rows ?? []).map((row) => ({
      country: row.dimensionValues?.[0]?.value ?? "(not set)",
      activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    return NextResponse.json(
      {
        ok: true,
        totals: {
          activeUsers: Number(report.totals?.[0]?.metricValues?.[0]?.value ?? 0),
        },
        rows,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "GA4 realtime report failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
