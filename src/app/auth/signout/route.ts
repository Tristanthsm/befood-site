import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
