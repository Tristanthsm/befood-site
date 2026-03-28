import type { Metadata } from "next";

import type { FaqItem } from "@/lib/types";
import { defaultOgImage, siteConfig } from "@/lib/site-config";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function createCanonicalUrl(path: string): string {
  return new URL(path, siteConfig.siteUrl).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  keywords = siteConfig.defaultKeywords,
}: PageMetadataInput): Metadata {
  const canonical = createCanonicalUrl(path);

  return {
    title,
    description,
    keywords,
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical,
      languages: {
        "fr-FR": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: "fr_FR",
      type: "website",
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage.url],
    },
  };
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    email: siteConfig.contactEmail,
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    inLanguage: "fr-FR",
  };
}

export function getMobileAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: siteConfig.name,
    operatingSystem: "iOS",
    applicationCategory: "HealthApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    downloadUrl: siteConfig.appStoreUrl,
    description: siteConfig.defaultDescription,
  };
}

export function getFaqJsonLd(faqItems: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: createCanonicalUrl(item.path),
    })),
  };
}
