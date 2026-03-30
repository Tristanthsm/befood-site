import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { SupportContactForm } from "@/components/sections/support-contact-form";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { createPageMetadata, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Aide",
  description: "Aide BeFood: compte, abonnement, bug, confidentialité et contact de l'équipe.",
  path: "/aide",
  keywords: ["aide BeFood", "support BeFood", "abonnement premium", "suppression compte"],
});

export default function AidePage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          <header className="max-w-4xl space-y-4">
            <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
              Besoin d&apos;aide ?
            </h1>
            <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              Compte, abonnement, bug, confidentialité ou suppression de compte : trouvez rapidement la bonne réponse ou contactez l&apos;équipe BeFood.
            </p>
            <p className="text-sm font-medium text-[var(--color-muted)]">{content.supportContent.responseTime}</p>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            <article id="mon-compte">
              <Card className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">Mon compte</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  Si vous ne pouvez pas vous connecter, vérifiez d&apos;abord l&apos;adresse email utilisée et testez la réinitialisation du mot de passe.
                </p>
              </Card>
            </article>

            <article id="signaler-un-bug">
              <Card className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">Signaler un bug</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  Décrivez ce que vous faisiez, ce qui s&apos;est passé, et si possible l&apos;identifiant du compte pour accélérer l&apos;analyse.
                </p>
              </Card>
            </article>

            <article id="supprimer-mon-compte">
              <Card className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">Supprimer mon compte</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  La suppression peut être demandée depuis l&apos;app ou via le formulaire de cette page si vous êtes bloqué.
                </p>
              </Card>
            </article>

            <article id="confidentialite-donnees">
              <Card className="space-y-2 bg-white/95">
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">Confidentialité et données</h2>
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  Consultez la{" "}
                  <Link href="/privacy" className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
                    Politique de confidentialité
                  </Link>
                  {" "}et les{" "}
                  <Link href="/terms" className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
                    Conditions d&apos;utilisation
                  </Link>
                  .
                </p>
              </Card>
            </article>
          </section>

          <SupportContactForm supportEmail={siteConfig.supportEmail} />

          <section aria-labelledby="faq-title" className="space-y-4">
            <h2 id="faq-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {content.supportContent.faqTitle}
            </h2>
            <div className="grid gap-3">
              {content.supportContent.faqItems.map((faq, index) => (
                <Card key={faq.question} className="p-0">
                  <details className="group rounded-[var(--radius-card)] p-5">
                    <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-[var(--color-ink)] marker:hidden">
                      {index + 1}. {faq.question}
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
          { name: "Aide", path: "/aide" },
        ])}
      />
    </>
  );
}
