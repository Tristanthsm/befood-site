import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

function getSafeNextPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/")) {
    return "/";
  }

  return candidate;
}

function redirectWithError(requestUrl: URL, code: string) {
  return NextResponse.redirect(new URL(`/connexion?error=${code}`, requestUrl.origin));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const accessToken = requestUrl.searchParams.get("access_token");
  const refreshToken = requestUrl.searchParams.get("refresh_token");
  const providerError = requestUrl.searchParams.get("error");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (providerError) {
    return redirectWithError(requestUrl, "oauth_provider_error");
  }

  try {
    const supabase = await getSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        const { data: existingSession } = await supabase.auth.getSession();
        if (existingSession.session) {
          return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
        }

        return redirectWithError(requestUrl, "oauth_callback_failed");
      }
    } else if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        const { data: existingSession } = await supabase.auth.getSession();
        if (existingSession.session) {
          return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
        }

        return redirectWithError(requestUrl, "oauth_callback_failed");
      }
    } else {
      return redirectWithError(requestUrl, "missing_code");
    }
  } catch {
    return redirectWithError(requestUrl, "oauth_callback_failed");
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
