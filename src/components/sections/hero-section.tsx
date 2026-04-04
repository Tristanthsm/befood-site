import Link from "next/link";

import { Container } from "@/components/ui/container";
import { StoreButtons } from "@/components/ui/store-buttons";
import { content } from "@/content";

export function HeroSection() {
  return (
    <section className="bg-[var(--color-background)] pb-6 pt-8 sm:pb-10 sm:pt-12">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-extrabold leading-[0.95] tracking-tight text-[var(--color-ink)] sm:text-6xl">
            {content.heroContent.title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[color:rgb(54_79_95)] sm:text-lg">
            {content.heroContent.description}
          </p>
          {content.heroContent.reassurance ? (
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[var(--color-muted)]">
              {content.heroContent.reassurance}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/app"
              data-cta-track="start_free"
              data-cta-location="hero"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#1ad8ab,#0ea678_56%,#0b8f68)] px-6 text-base font-bold text-white ring-1 ring-[rgba(16,185,129,0.5)] shadow-[0_18px_34px_-18px_rgba(16,185,129,1)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_26px_46px_-20px_rgba(16,185,129,1)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.3)_50%,transparent_80%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative">Démarrer gratuitement</span>
              <span aria-hidden className="relative text-lg leading-none transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
            <StoreButtons compact />
          </div>
        </div>
      </Container>
    </section>
  );
}
