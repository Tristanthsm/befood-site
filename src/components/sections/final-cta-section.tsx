import Link from "next/link";

import { Container } from "@/components/ui/container";
import { StoreButtons } from "@/components/ui/store-buttons";
import { content } from "@/content";

export function FinalCtaSection() {
  return (
    <section id="telecharger-app" className="py-16 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,var(--color-dark),#1b324f)] p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] lg:items-start">
            <div className="space-y-5">
              <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{content.finalCta.title}</h2>
              <p className="max-w-2xl text-base leading-7 text-white/78 sm:text-lg">{content.finalCta.description}</p>
              <div className="space-y-2 text-sm">
                <p>
                  <Link
                    href="/aide"
                    className="text-white/85 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-soft)]"
                  >
                    Besoin d&apos;aide ? Ouvrir l&apos;aide
                  </Link>
                </p>
              </div>
            </div>

            <div className="space-y-4 lg:justify-self-end">
              <Link
                href="/app"
                data-cta-track="start_free"
                data-cta-location="final_cta"
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#1ad8ab,#0ea678_56%,#0b8f68)] px-5 py-3 text-sm font-bold text-white ring-1 ring-[rgba(16,185,129,0.56)] shadow-[0_18px_36px_-20px_rgba(16,185,129,0.98)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_24px_44px_-20px_rgba(16,185,129,1)] active:translate-y-0"
              >
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.28)_50%,transparent_80%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="relative">Démarrer gratuitement</span>
                <span aria-hidden className="relative text-base leading-none transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </Link>
              <StoreButtons className="flex-col items-stretch gap-3 [&>*]:w-full [&>*]:max-w-none [&_[data-store-placeholder]]:!border-white/30 [&_[data-store-placeholder]]:!bg-white/10 [&_[data-store-placeholder]]:!text-white/80" />
              <p className="text-sm text-white/70">{content.finalCta.note}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
