import { AppShowcaseSection } from "@/components/sections/app-showcase-section";
import { CommunitySection } from "@/components/sections/community-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HomeIntentLinksSection } from "@/components/sections/home-intent-links-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { createPageMetadata } from "@/lib/seo";

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
      <HomeIntentLinksSection />
      <AppShowcaseSection />
      <HowItWorksSection />
      <CommunitySection />
      <FinalCtaSection />
    </>
  );
}
