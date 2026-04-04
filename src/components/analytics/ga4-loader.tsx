"use client";

import Script from "next/script";

import { useConsent } from "@/components/analytics/consent-provider";

const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() ?? "";
const isProduction = process.env.NODE_ENV === "production";

export function Ga4Loader() {
  const { analyticsAllowed } = useConsent();

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
              debug_mode: ${isProduction ? "false" : "true"}
            });
          `,
        }}
      />
    </>
  );
}
