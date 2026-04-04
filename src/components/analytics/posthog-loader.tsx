"use client";

import { useEffect, useRef } from "react";

import { useConsent } from "@/components/analytics/consent-provider";
import { hasPosthogConfig, initializePosthogIfNeeded, setPosthogCaptureEnabled } from "@/lib/analytics/posthog";

export function PosthogLoader() {
  const { analyticsAllowed } = useConsent();
  const warnedMissingConfigRef = useRef(false);

  useEffect(() => {
    if (!hasPosthogConfig()) {
      if (!warnedMissingConfigRef.current) {
        console.warn("[posthog] NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST is missing.");
        warnedMissingConfigRef.current = true;
      }
      return;
    }

    if (!analyticsAllowed) {
      setPosthogCaptureEnabled(false);
      return;
    }

    if (!initializePosthogIfNeeded()) {
      return;
    }

    setPosthogCaptureEnabled(true);
  }, [analyticsAllowed]);

  return null;
}
