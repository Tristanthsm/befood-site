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
                <p>
                  <Link
                    href="/pour-les-coachs"
                    className="text-white/85 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-soft)]"
                  >
                    Vous êtes coach ou expert ? Découvrir l&apos;espace dédié
                  </Link>
                </p>
                <p>
                  <Link
                    href="/guides"
                    className="text-white/85 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-soft)]"
                  >
                    Explorer les guides nutrition et habitudes
                  </Link>
                </p>
              </div>
            </div>

            <div className="space-y-4 lg:justify-self-end">
              <StoreButtons className="flex-col items-stretch gap-3 [&>*]:w-full [&>*]:max-w-none [&_[data-store-placeholder]]:!border-white/30 [&_[data-store-placeholder]]:!bg-white/10 [&_[data-store-placeholder]]:!text-white/80" />
              <p className="text-sm text-white/70">{content.finalCta.note}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
