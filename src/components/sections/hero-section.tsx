import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
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

          <div className="mt-6 flex flex-col items-center gap-3">
            <ButtonLink
              href="/connexion"
              size="lg"
              className="bg-[var(--color-ink)] text-white hover:bg-black focus-visible:outline-[var(--color-ink)]"
            >
              Démarrer gratuitement
            </ButtonLink>
            <p className="text-sm text-[color:rgb(70_95_110)]">Obtenez votre programme personnalisé en quelques minutes.</p>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[color:rgb(54_79_95)]">
            <p>{content.heroContent.reassurance}</p>
            <Link
              href="/pour-les-coachs"
              className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Espace coachs et pros
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
