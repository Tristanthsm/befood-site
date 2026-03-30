import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/")) {
    return "/";
  }

  return candidate;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const providerError = requestUrl.searchParams.get("error");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (providerError) {
    const redirectUrl = new URL("/connexion?error=oauth_provider_error", requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/connexion?error=missing_code", requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const redirectUrl = new URL("/connexion?error=oauth_callback_failed", requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    const redirectUrl = new URL("/connexion?error=oauth_callback_failed", requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
