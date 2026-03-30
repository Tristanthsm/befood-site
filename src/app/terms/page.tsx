import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LegalDocument } from "@/components/sections/legal-document";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const runtime = "edge";

export const metadata: Metadata = createPageMetadata({
  title: "Conditions d'utilisation",
  description: "Consultez les conditions d'utilisation de BeFood: accès au service, abonnements, responsabilités et droit applicable.",
  path: "/terms",
  keywords: ["conditions utilisation BeFood", "abonnement App Store BeFood", "mentions légales application nutrition"],
});

export default function TermsPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container>
          <LegalDocument document={content.termsContent} />
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Conditions d'utilisation", path: "/terms" },
        ])}
      />
    </>
  );
}
