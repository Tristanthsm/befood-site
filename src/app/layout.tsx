import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ConsentProvider } from "@/components/analytics/consent-provider";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent-banner";
import { Ga4Loader } from "@/components/analytics/ga4-loader";
import { MarketingEventsTracker } from "@/components/analytics/marketing-events-tracker";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultOgImage, siteConfig } from "@/lib/site-config";
import { getMobileAppJsonLd, getOrganizationJsonLd, getWebsiteJsonLd } from "@/lib/seo";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.name,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.defaultDescription,
  keywords: siteConfig.defaultKeywords,
  alternates: {
    canonical: siteConfig.siteUrl,
    languages: {
      "fr-FR": siteConfig.siteUrl,
    },
  },
  applicationName: siteConfig.name,
  category: "nutrition",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.svg?v=3", type: "image/svg+xml", sizes: "any" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico?v=3"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.defaultDescription,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.defaultDescription,
    images: [defaultOgImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-ink)]">
        <ConsentProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-ink)] focus:outline focus:outline-2 focus:outline-[var(--color-accent)]"
          >
            Aller au contenu principal
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <JsonLd data={getOrganizationJsonLd()} />
          <JsonLd data={getWebsiteJsonLd()} />
          <JsonLd data={getMobileAppJsonLd()} />
          <Analytics />
          <SpeedInsights />
          <Ga4Loader />
          <MarketingEventsTracker />
          <CookieConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
