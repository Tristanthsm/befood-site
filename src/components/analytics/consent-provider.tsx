"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { buildConsent, clearGaCookies, persistCookieConsent, readCookieConsent, type CookieConsentState } from "@/lib/consent/cookie-consent";

interface ConsentContextValue {
  isReady: boolean;
  consent: CookieConsentState | null;
  analyticsAllowed: boolean;
  shouldShowBanner: boolean;
  preferencesOpen: boolean;
  acceptAll: () => void;
  refuseAnalytics: () => void;
  savePreferences: (analytics: boolean) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);
const GA4_CONSENT_PAYLOAD = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const existingConsent = readCookieConsent();
        setConsent(existingConsent);
      } catch {
        // If storage APIs are blocked, keep consent null so the banner can still be shown.
        setConsent(null);
      }
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const savePreferences = (analytics: boolean) => {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ...GA4_CONSENT_PAYLOAD,
        analytics_storage: analytics ? "granted" : "denied",
      });
    }

    if (!analytics) {
      clearGaCookies();
    }

    const nextConsent = buildConsent(analytics);
    persistCookieConsent(nextConsent);
    setConsent(nextConsent);
    setPreferencesOpen(false);
  };

  const value = useMemo<ConsentContextValue>(
    () => ({
      isReady,
      consent,
      analyticsAllowed: Boolean(consent?.analytics),
      shouldShowBanner: isReady && !consent,
      preferencesOpen,
      acceptAll: () => savePreferences(true),
      refuseAnalytics: () => savePreferences(false),
      savePreferences,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [consent, isReady, preferencesOpen],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used inside ConsentProvider");
  }

  return context;
}
