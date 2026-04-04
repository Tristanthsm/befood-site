import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { StoreButtons } from "@/components/ui/store-buttons";
import { createPageMetadata, getBreadcrumbJsonLd, getSoftwareApplicationJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Application nutrition photo pour comprendre ses repas",
  description:
    "Installez BeFood pour analyser vos repas en photo, recevoir des recommandations coach personnalisées et progresser avec des actions concrètes.",
  path: "/app",
  keywords: [
    "application nutrition photo",
    "analyse repas iOS",
    "journal alimentaire photo",
    "coach nutrition IA",
    "recettes nutrition personnalisées",
  ],
});

export default function AppPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16">
        <Container>
          <div className="relative mt-1 overflow-hidden rounded-[2.2rem] border border-[color:rgb(9_31_40_/45%)] bg-[linear-gradient(170deg,#02060d_2%,#041229_34%,#08203a_60%,#0b2c3d_78%,#0f4339_100%)] px-6 pb-11 pt-8 text-white shadow-[0_36px_90px_-52px_rgba(2,10,20,0.98)] sm:mt-1 sm:px-10 sm:pb-[3.25rem] sm:pt-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)]" />
            <div className="pointer-events-none absolute bottom-[-7rem] left-1/2 h-[21rem] w-[68rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.38),rgba(16,185,129,0.18)_44%,transparent_78%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[11rem] bg-[linear-gradient(180deg,transparent_12%,rgba(16,185,129,0.1)_58%,rgba(16,185,129,0.23)_100%)]" />
            <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
              <p className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-accent-soft)]">
                Installer BeFood
              </p>
              <h1 className="font-display text-3xl leading-tight sm:text-5xl">
                Téléchargez BeFood et passez du repas à l&apos;action.
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
                Une seule action maintenant: Installez l&apos;app pour recevoir des recommandations après chaque repas.
              </p>

              <StoreButtons className="pt-1" />
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={getSoftwareApplicationJsonLd("/app")} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "App", path: "/app" },
        ])}
      />
    </>
  );
}
