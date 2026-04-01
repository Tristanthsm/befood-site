import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { SupportContactForm } from "@/components/sections/support-contact-form";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Contact BeFood",
  description: "Contactez l'équipe BeFood pour les questions produit, partenariat, accompagnement coach et support général.",
  path: "/contact",
  keywords: ["contact BeFood", "support BeFood", "partenariat BeFood", "aide application nutrition"],
});

export default function ContactPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <header className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Contact</p>
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">Parler à l&apos;équipe BeFood</h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              Pour toute question sur l&apos;application, les guides, l&apos;accompagnement coach ou les collaborations, vous pouvez écrire ici.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-2 bg-white/95">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Email direct</h2>
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                {siteConfig.contactEmail}
              </p>
            </Card>
            <Card className="space-y-2 bg-white/95">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Temps de réponse</h2>
              <p className="text-sm leading-6 text-[var(--color-muted)]">Nous répondons généralement sous 48h ouvrées.</p>
            </Card>
          </div>

          <SupportContactForm supportEmail={siteConfig.contactEmail} />
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}
