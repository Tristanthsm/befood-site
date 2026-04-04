import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "edge";

interface ResolveLoginBody {
  identifier?: unknown;
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function getServiceRoleSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "";

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: "resolve-login",
    windowMs: 5 * 60 * 1000,
    maxRequests: 40,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        message: "Trop de tentatives. Merci de réessayer dans quelques minutes.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Requête non autorisée." }, { status: 403 });
  }

  const client = getServiceRoleSupabaseClient();
  if (!client) {
    return NextResponse.json(
      {
        message:
          "Connexion par identifiant non disponible pour l'instant. Utilise un e-mail ou configure SUPABASE_SERVICE_ROLE_KEY côté serveur.",
      },
      { status: 501 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as ResolveLoginBody;
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";

  if (!identifier || identifier.length > 100) {
    return NextResponse.json({ message: "Identifiant invalide." }, { status: 400 });
  }

  const { data: byUsername, error: usernameError } = await client
    .from("profiles")
    .select("id,email")
    .eq("username", identifier)
    .limit(1)
    .maybeSingle();

  if (usernameError) {
    return NextResponse.json({ message: "Impossible de résoudre cet identifiant." }, { status: 500 });
  }

  const { data: byEmail, error: emailError } = await client
    .from("profiles")
    .select("id,email")
    .eq("email", identifier)
    .limit(1)
    .maybeSingle();

  if (emailError) {
    return NextResponse.json({ message: "Impossible de résoudre cet identifiant." }, { status: 500 });
  }

  const profileMatch = byUsername ?? byEmail;
  let email = typeof profileMatch?.email === "string" ? profileMatch.email.trim() : "";

  if (!email && profileMatch?.id) {
    const { data: authData, error: authError } = await client.auth.admin.getUserById(String(profileMatch.id));
    if (authError) {
      return NextResponse.json({ message: "Impossible de résoudre cet identifiant." }, { status: 500 });
    }
    email = authData.user?.email?.trim() ?? "";
  }
  if (!email) {
    return NextResponse.json(
      { message: "Identifiant introuvable. Utilise ton e-mail ou contacte le support." },
      { status: 404 },
    );
  }

  return NextResponse.json({ email });
}
