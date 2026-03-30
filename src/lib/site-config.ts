import type { FooterLink, NavItem, SiteConfig, StoreLink } from "@/lib/types";

export const APP_STORE_URL_PLACEHOLDER = "https://apps.apple.com/app/id0000000000";

export const siteConfig: SiteConfig = {
  name: "BeFood",
  siteUrl: "https://befood.fr",
  defaultLocale: "fr",
  titleTemplate: "%s | BeFood",
  defaultDescription:
    "BeFood est l'application iOS qui aide à comprendre vos repas grâce à l'analyse photo par IA, des repères nutritionnels clairs et un suivi d'habitudes dans le temps.",
  defaultKeywords: [
    "application nutrition",
    "analyse repas photo",
    "suivi alimentaire",
    "comprendre son alimentation",
    "habitudes alimentaires",
    "coach nutrition IA",
    "journal alimentaire",
  ],
  appStoreUrl: "https://apps.apple.com/fr/app/befood/id6757001850",
  googlePlayUrl: null,
  supportEmail: "contact@befood.fr",
  contactEmail: "contact@befood.fr",
  privacyPath: "/privacy",
  termsPath: "/terms",
  coachRequestAccessUrl: "/candidature-coachs",
  coachSignInUrl: null,
  socialLinks: [],
};

export const mainNavigation: NavItem[] = [
  { label: "Comment ça marche", href: "/#comment-ca-marche" },
  { label: "Coachs & experts", href: "/pour-les-coachs" },
  { label: "Aide", href: "/aide" },
];

const appStoreConfigured = siteConfig.appStoreUrl !== APP_STORE_URL_PLACEHOLDER;

export const storeLinks: { appStore: StoreLink; googlePlay: StoreLink } = {
  appStore: {
    label: "App Store",
    url: appStoreConfigured ? siteConfig.appStoreUrl : null,
    status: appStoreConfigured ? "live" : "coming_soon",
  },
  googlePlay: {
    label: "Google Play",
    url: siteConfig.googlePlayUrl,
    status: siteConfig.googlePlayUrl ? "live" : "coming_soon",
  },
};

export const footerLinks: FooterLink[] = [
  { label: "Coachs & experts", href: "/pour-les-coachs" },
  { label: "Connexion", href: "/connexion" },
  { label: "Aide", href: "/aide" },
  { label: "Confidentialité", href: siteConfig.privacyPath },
  { label: "Conditions d'utilisation", href: siteConfig.termsPath },
];

export const staticRoutes = ["/", "/quiz", "/pour-les-coachs", "/aide", "/privacy", "/terms"];

export const defaultOgImage = {
  url: "/images/og/befood-og.png",
  width: 1200,
  height: 630,
  alt: "BeFood - Comprendre ses repas avec l'IA",
} as const;

export const brandAssets = {
  logo: "/images/brand/befood-logo.png",
  icon: "/images/brand/befood-icon-1024.png",
} as const;
