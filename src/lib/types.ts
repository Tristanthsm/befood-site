export type StoreLinkStatus = "live" | "coming_soon";

export interface StoreLink {
  label: string;
  url: string | null;
  status: StoreLinkStatus;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  siteUrl: string;
  defaultLocale: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  appStoreUrl: string;
  googlePlayUrl: string | null;
  supportEmail: string;
  contactEmail: string;
  privacyPath: string;
  termsPath: string;
  coachRequestAccessUrl: string | null;
  coachSignInUrl: string | null;
  socialLinks: SocialLink[];
}

export interface HeroContent {
  badge: string;
  title: string;
  description: string;
  reassurance: string;
}

export interface TrustItem {
  title: string;
  description: string;
  href?: string;
}

export interface StepItem {
  title: string;
  description: string;
}

export type QuizProfile = "relance" | "cadre" | "emotion" | "temps";

export interface QuizOption {
  label: string;
  profile: QuizProfile;
}

export interface QuizQuestion {
  id: string;
  title: string;
  options: QuizOption[];
}

export interface QuizResult {
  profile: QuizProfile;
  title: string;
  description: string;
  nextStep: string;
}

export interface QuizContent {
  badge: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  disclaimer: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface Differentiator {
  title: string;
  description: string;
}

export interface SocialItem {
  title: string;
  description: string;
}

export interface CtaBlock {
  title: string;
  description: string;
  note: string;
}

export interface CoachingPoint {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CoachUseCase {
  title: string;
  description: string;
}

export interface AccessCard {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string | null;
}

export interface CoachPageContent {
  heroTitle: string;
  heroDescription: string;
  heroBadge: string;
  heroCoachImpactTitle: string;
  heroCoachImpactPoints: string[];
  heroClientImpactTitle: string;
  heroClientImpactPoints: string[];
  valueTitle: string;
  valueItems: FeatureItem[];
  useCasesTitle: string;
  useCases: CoachUseCase[];
  processTitle: string;
  processSteps: StepItem[];
  faqTitle: string;
  faqItems: FaqItem[];
  finalCta: CtaBlock;
}

export interface SupportContent {
  title: string;
  description: string;
  responseTime: string;
  contactHint?: string;
  faqTitle: string;
  faqItems: FaqItem[];
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  intro: string;
  updatedAt: string;
  replacementNotice?: string;
  sections: LegalSection[];
}
