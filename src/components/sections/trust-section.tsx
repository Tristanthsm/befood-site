import Link from "next/link";

import { Container } from "@/components/ui/container";
import { content } from "@/content";

export function TrustSection() {
  return (
    <section className="py-8 sm:py-10">
      <Container className="space-y-6">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Repères de confiance</p>
          <h2 className="text-2xl font-extrabold leading-tight text-[var(--color-ink)] sm:text-3xl">{content.trustTitle}</h2>
        </header>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {content.trustItems.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[color:rgb(11_34_52_/10%)] bg-white/90 p-4 shadow-[0_16px_30px_-28px_rgba(15,38,43,0.7)]"
            >
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-2 inline-flex text-sm font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Ouvrir
                </Link>
              ) : null}
            </article>
          ))}
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Informations officielles:
          {" "}
          <Link
            href="/aide"
            className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            Aide
          </Link>
          {" · "}
          <Link
            href="/privacy"
            className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            Confidentialité
          </Link>
          {" · "}
          <Link
            href="/terms"
            className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            Conditions
          </Link>
        </p>
      </Container>
    </section>
  );
}
