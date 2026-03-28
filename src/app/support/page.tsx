import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { SupportContactForm } from "@/components/sections/support-contact-form";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/seo";
import { siteConfig, storeLinks } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Support application nutrition",
  description: "Support BeFood: questions sur l'analyse des repas en photo, le suivi des habitudes, l'abonnement iOS et la confidentialité.",
  path: "/support",
  keywords: ["support BeFood", "aide application nutrition", "analyse repas photo", "abonnement App Store"],
});

export default function SupportPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          <header className="max-w-3xl space-y-4">
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">{content.supportContent.title}</h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">{content.supportContent.description}</p>
            {content.supportContent.contactHint ? (
              <p className="inline-flex rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-muted)]">
                {content.supportContent.contactHint}
              </p>
            ) : null}
            <p className="text-sm text-[var(--color-muted)]">{content.supportContent.responseTime}</p>
            <p className="text-sm leading-6 text-[var(--color-muted)]">
              Parcours utile:
              {" "}
              <Link
                href="/#comment-ca-marche"
                className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Comment ça marche
              </Link>
              {" · "}
              <Link
                href="/#fonctionnalites"
                className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Fonctionnalités
              </Link>
              {" · "}
              <Link
                href="/pour-les-coachs"
                className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Pour les coachs
              </Link>
              {" · "}
              {storeLinks.appStore.status === "live" ? (
                <a
                  href={storeLinks.appStore.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Télécharger sur l&apos;App Store
                </a>
              ) : (
                <span className="font-semibold text-[var(--color-muted)]">App Store bientôt</span>
              )}
            </p>
          </header>

          <SupportContactForm supportEmail={siteConfig.supportEmail} />

          <section aria-labelledby="faq-title" className="space-y-4">
            <h2 id="faq-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {content.supportContent.faqTitle}
            </h2>
            <div className="grid gap-3">
              {content.supportContent.faqItems.map((faq) => (
                <Card key={faq.question} className="p-0">
                  <details className="group rounded-[var(--radius-card)] p-5">
                    <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-[var(--color-ink)] marker:hidden">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{faq.answer}</p>
                  </details>
                </Card>
              ))}
            </div>
          </section>
        </Container>
      </section>
      <JsonLd data={getFaqJsonLd(content.supportContent.faqItems)} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Support", path: "/support" },
        ])}
      />
    </>
  );
}
