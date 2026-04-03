"use client";

import { useConsent } from "@/components/analytics/consent-provider";

export function CookiePreferencesButton() {
  const { openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="text-left text-sm font-semibold text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      Préférences cookies
    </button>
  );
}
