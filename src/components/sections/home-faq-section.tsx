import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { content } from "@/content";

export function HomeFaqSection() {
  return (
    <Section id="faq" eyebrow="FAQ" title={content.homeFaqTitle} description="Des réponses utiles pour démarrer avec le bon niveau d'attente sur le produit.">
      <div className="grid gap-3">
        {content.homeFaqItems.map((faq) => (
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
      <p className="text-sm text-[var(--color-muted)]">
        Besoin de plus de détails ? Consultez la page{" "}
        <Link
          href="/aide"
          className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          Aide
        </Link>
        {" "}ou{" "}
        <Link
          href="/pour-les-coachs"
          className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          Pour les coachs
        </Link>
        .
      </p>
    </Section>
  );
}
