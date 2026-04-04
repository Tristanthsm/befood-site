import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedGa4AdminRequest } from "@/lib/analytics/ga4-auth";
import { getPropertyResourceName, runHealthReport } from "@/lib/analytics/ga4-api";

export async function GET(request: NextRequest) {
  if (!isAuthorizedGa4AdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const report = await runHealthReport();
    const activeUsers = Number(report.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    return NextResponse.json(
      {
        ok: true,
        property: getPropertyResourceName(),
        activeUsersLast7Days: activeUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "GA4 health check failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
