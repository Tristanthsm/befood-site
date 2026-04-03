"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { buildConsent, persistCookieConsent, readCookieConsent, type CookieConsentState } from "@/lib/consent/cookie-consent";

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

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const existingConsent = readCookieConsent();
      setConsent(existingConsent);
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const savePreferences = (analytics: boolean) => {
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
