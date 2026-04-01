import type { Metadata } from "next";

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
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container>
          <LegalDocument document={content.privacyContent} />
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
