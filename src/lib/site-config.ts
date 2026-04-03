import type { FooterLink, NavItem, SeoRouteConfig, SiteConfig, StoreLink } from "@/lib/types";

export const APP_STORE_URL_PLACEHOLDER = "https://apps.apple.com/app/id0000000000";

const defaultLastModified = "2026-03-31";

export const siteConfig: SiteConfig = {
  name: "BeFood",
  alternateName: "BeFood Nutrition",
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
  privacyPath: "/confidentialite",
  termsPath: "/conditions",
  coachRequestAccessUrl: "/candidature-coachs",
  coachSignInUrl: null,
  socialLinks: [],
};

export const mainNavigation: NavItem[] = [
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Pour les coachs", href: "/pour-les-coachs" },
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
  { label: "Télécharger l’app", href: "/app" },
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Pour les coachs", href: "/pour-les-coachs" },
  { label: "Contact", href: "/contact" },
  { label: "Aide", href: "/aide" },
  { label: "Cookies", href: "/cookies" },
  { label: "Confidentialité", href: siteConfig.privacyPath },
  { label: "Conditions d'utilisation", href: siteConfig.termsPath },
];

export const indexableStaticRoutes: SeoRouteConfig[] = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    lastModified: defaultLastModified,
  },
  {
    path: "/app",
    changeFrequency: "monthly",
    priority: 0.9,
    lastModified: defaultLastModified,
  },
  {
    path: "/comment-ca-marche",
    changeFrequency: "monthly",
    priority: 0.9,
    lastModified: defaultLastModified,
  },
  {
    path: "/pour-les-coachs",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: defaultLastModified,
  },
  {
    path: "/guides",
    changeFrequency: "weekly",
    priority: 0.85,
    lastModified: defaultLastModified,
  },
  {
    path: "/a-propos",
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: defaultLastModified,
  },
  {
    path: "/contact",
    changeFrequency: "monthly",
    priority: 0.65,
    lastModified: defaultLastModified,
  },
  {
    path: "/methodologie",
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: defaultLastModified,
  },
  {
    path: "/aide",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: defaultLastModified,
  },
  {
    path: "/cookies",
    changeFrequency: "yearly",
    priority: 0.3,
    lastModified: defaultLastModified,
  },
  {
    path: "/confidentialite",
    changeFrequency: "yearly",
    priority: 0.3,
    lastModified: defaultLastModified,
  },
  {
    path: "/conditions",
    changeFrequency: "yearly",
    priority: 0.3,
    lastModified: defaultLastModified,
  },
  {
    path: "/quiz",
    changeFrequency: "monthly",
    priority: 0.5,
    lastModified: defaultLastModified,
  },
];

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
