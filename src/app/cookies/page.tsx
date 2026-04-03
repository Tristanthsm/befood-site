import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { LegalDocument } from "@/components/sections/legal-document";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Politique cookies",
  description: "Consultez la politique cookies BeFood: catégories, finalités et gestion de vos préférences.",
  path: "/cookies",
  keywords: ["cookies BeFood", "consentement cookies", "mesure d'audience GA4", "préférences cookies"],
});

export default function CookiesPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container>
          <LegalDocument document={content.cookiesContent} />
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Cookies", path: "/cookies" },
        ])}
      />
    </>
  );
}
