import { AppShowcaseSection } from "@/components/sections/app-showcase-section";
import { CommunitySection } from "@/components/sections/community-section";
import { CoachingSection } from "@/components/sections/coaching-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HomeFaqSection } from "@/components/sections/home-faq-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { TrustSection } from "@/components/sections/trust-section";
import { JsonLd } from "@/components/seo/json-ld";
import { content } from "@/content";
import { createPageMetadata, getFaqJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Application nutrition iOS: analyse photo repas et habitudes",
  description:
    "BeFood est une application nutrition iOS qui analyse vos repas en photo avec l'IA, clarifie vos repères nutritionnels et vous aide à améliorer vos habitudes dans le temps.",
  path: "/",
  keywords: [
    "application nutrition iOS",
    "analyse repas photo",
    "comprendre son alimentation",
    "coach nutrition IA",
    "suivi habitudes alimentaires",
  ],
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AppShowcaseSection />
      <TrustSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CoachingSection />
      <CommunitySection />
      <HomeFaqSection />
      <FinalCtaSection />
      <JsonLd data={getFaqJsonLd(content.homeFaqItems)} />
    </>
  );
}
