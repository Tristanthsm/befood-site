"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";

import { useConsent } from "@/components/analytics/consent-provider";
import { consumeAuthIntent } from "@/lib/analytics/auth-intent";
import { getAttributionEventProperties } from "@/lib/analytics/attribution-context";
import {
  capturePosthogEvent,
  identifyPosthogUser,
  resetPosthogIdentity,
} from "@/lib/analytics/posthog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function extractEmailDomain(email: string | undefined): string | null {
  const normalized = toNullableString(email);
  if (!normalized || !normalized.includes("@")) {
    return null;
  }
  const domain = normalized.split("@")[1]?.trim().toLowerCase();
  return domain && domain.length > 0 ? domain : null;
}

function handleSignedInUser(user: User) {
  const provider = toNullableString(user.app_metadata?.provider);
  const emailDomain = extractEmailDomain(user.email);

  identifyPosthogUser(user.id, {
    auth_provider: provider,
    email_domain: emailDomain,
    app_surface: "website",
  });

  const intent = consumeAuthIntent();
  if (intent?.mode !== "signup") {
    return;
  }

  capturePosthogEvent("signup_completed", {
    auth_method: intent.method,
    auth_source_path: intent.sourcePath,
    auth_provider: provider,
    ...getAttributionEventProperties(),
  });
}

export function PosthogAuthBridge() {
  const { analyticsAllowed } = useConsent();

  useEffect(() => {
    if (!analyticsAllowed) {
      resetPosthogIdentity();
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) {
        return;
      }
      handleSignedInUser(data.user);
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        resetPosthogIdentity();
        return;
      }

      if (!session?.user) {
        return;
      }

      handleSignedInUser(session.user);
    });

    return () => {
      cancelled = true;
      authSubscription.subscription.unsubscribe();
    };
  }, [analyticsAllowed]);

  return null;
}
