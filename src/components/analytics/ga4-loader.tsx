"use client";

import Script from "next/script";

import { useConsent } from "@/components/analytics/consent-provider";

const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() ?? "";

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
            gtag('config', '${measurementId}', { anonymize_ip: true, send_page_view: false });
          `,
        }}
      />
    </>
  );
}
