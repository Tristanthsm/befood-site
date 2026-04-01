import { NextRequest, NextResponse } from "next/server";

import { APP_STORE_URL, JOIN_CLICK_COOKIE } from "@/lib/join/constants";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "edge";

function readClickId(request: NextRequest): string | null {
  const fromQuery = request.nextUrl.searchParams.get("click_id");
  if (fromQuery) {
    return fromQuery;
  }

  return request.cookies.get(JOIN_CLICK_COOKIE)?.value ?? null;
}

export async function GET(request: NextRequest) {
  const clickId = readClickId(request);

  if (clickId) {
    try {
      const supabase = getSupabaseServiceRoleClient();
      const { error } = await supabase
        .from("web_join_sessions")
        .update({
          app_store_clicked_at: new Date().toISOString(),
          session_status: "store_clicked",
        })
        .eq("click_id", clickId);

      if (error) {
        console.error("[join-app-store] unable to update click row", error.message);
      }
    } catch (error) {
      console.error("[join-app-store] tracking update failed", error);
    }
  }

  return NextResponse.redirect(APP_STORE_URL, { status: 302 });
}
