import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const requestUrl = new URL(request.url);
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);

  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Requête non autorisée." }, { status: 403 });
  }

  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
