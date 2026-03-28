import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { LegalDocument } from "@/components/sections/legal-document";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

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
        <Container className="space-y-6">
          <nav aria-label="Navigation légale" className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/privacy"
              className="font-medium text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Confidentialité
            </Link>
            <Link
              href="/support"
              className="font-medium text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Support
            </Link>
          </nav>
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
