"use client";

import Script from "next/script";
import { useEffect } from "react";

import { useConsent } from "@/components/analytics/consent-provider";

const FALLBACK_GA4_MEASUREMENT_ID = "G-TG78RM45LE";
const envMeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() ?? "";
const measurementId = envMeasurementId || FALLBACK_GA4_MEASUREMENT_ID;
const isProduction = process.env.NODE_ENV === "production";
const debugModeExpression = isProduction
  ? "window.location.search.includes('ga_debug=1') || window.localStorage.getItem('bf_ga_debug') === '1'"
  : "true";

export function Ga4Loader() {
  const { analyticsAllowed } = useConsent();

  useEffect(() => {
    if (!envMeasurementId) {
      // Keep telemetry active even if the hosting env variable is missing.
      // This warns us in development and browser consoles without breaking tracking.
      console.warn(
        "[ga4] NEXT_PUBLIC_GA4_MEASUREMENT_ID is missing; fallback ID is used.",
      );
    }
  }, []);

  if (!analyticsAllowed || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
            gtag('consent', 'update', {
              analytics_storage: 'granted',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
            gtag('config', '${measurementId}', {
              anonymize_ip: true,
              send_page_view: false,
              allow_google_signals: false,
              debug_mode: ${debugModeExpression}
            });
          `,
        }}
      />
    </>
  );
}
