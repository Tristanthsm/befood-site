import type { Metadata } from "next";
import Image from "next/image";

import { JsonLd } from "@/components/seo/json-ld";
import { LegalDocument } from "@/components/sections/legal-document";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Politique de confidentialité",
  description: "Consultez la politique de confidentialité BeFood: données collectées, finalités, sécurité et droits des utilisateurs.",
  path: "/confidentialite",
  keywords: ["politique confidentialité BeFood", "données personnelles application nutrition", "RGPD BeFood"],
});

export default function ConfidentialitePage() {
  const document = content.privacyContent;

  return (
    <>
      <section className="pb-10 pt-16 sm:pb-12 sm:pt-20">
        <Container>
          <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#081122,#132b45)] p-6 text-white sm:p-10">
            <div className="grid gap-6 lg:min-h-[26rem] lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4 sm:space-y-5">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-accent-soft)]">
                  Confidentialité & cookies
                </p>
                <h1 className="max-w-3xl text-balance font-display text-4xl leading-tight sm:text-5xl">{document.title}</h1>
                <p className="max-w-3xl text-base leading-7 text-white/80 sm:text-lg">{document.intro}</p>
                <p className="text-sm font-medium text-white/70">Dernière mise à jour: {document.updatedAt}</p>
                {document.replacementNotice ? (
                  <p className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-[var(--color-accent-soft)]">
                    {document.replacementNotice}
                  </p>
                ) : null}
              </div>

              <div className="mx-auto w-full max-w-[19rem] sm:max-w-[22rem]">
                <Image
                  src="/images/mascots/cookies-hero-mascot.png"
                  alt="Mascotte BeFood avec un cookie, illustration de la page confidentialité et cookies"
                  width={768}
                  height={768}
                  className="h-auto w-full object-contain drop-shadow-[0_24px_34px_rgba(0,0,0,0.35)]"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-16">
        <Container>
          <LegalDocument document={document} hideHeader />
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Confidentialité", path: "/confidentialite" },
        ])}
      />
    </>
  );
}
