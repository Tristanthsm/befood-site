import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

function getSafeNextPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/")) {
    return "/";
  }

  return candidate;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const accessToken = requestUrl.searchParams.get("access_token");
  const refreshToken = requestUrl.searchParams.get("refresh_token");
  const providerError = requestUrl.searchParams.get("error");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (providerError) {
    const redirectUrl = new URL("/connexion?error=oauth_provider_error", requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        const redirectUrl = new URL("/connexion?error=oauth_callback_failed", requestUrl.origin);
        return NextResponse.redirect(redirectUrl);
      }
    } else if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        const redirectUrl = new URL("/connexion?error=oauth_callback_failed", requestUrl.origin);
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      const redirectUrl = new URL("/connexion?error=missing_code", requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    const redirectUrl = new URL("/connexion?error=oauth_callback_failed", requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
