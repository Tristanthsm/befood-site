import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { LegalDocument } from "@/components/sections/legal-document";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Politique de confidentialité",
  description: "Consultez la politique de confidentialité BeFood: données collectées, finalités, sécurité et droits des utilisateurs.",
  path: "/privacy",
  keywords: ["politique confidentialité BeFood", "données personnelles application nutrition", "RGPD BeFood"],
});

export default function PrivacyPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-6">
          <nav aria-label="Navigation légale" className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/terms"
              className="font-medium text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Conditions d&apos;utilisation
            </Link>
            <Link
              href="/support"
              className="font-medium text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Support
            </Link>
          </nav>
          <LegalDocument document={content.privacyContent} />
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Confidentialité", path: "/privacy" },
        ])}
      />
    </>
  );
}
