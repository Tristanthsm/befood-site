import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StoreButtons } from "@/components/ui/store-buttons";
import { content } from "@/content";

export function FinalCtaSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,var(--color-dark),#1b324f)] p-8 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-soft)]">Téléchargement</p>
              <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{content.finalCta.title}</h2>
              <p className="max-w-3xl text-base leading-7 text-white/78 sm:text-lg">{content.finalCta.description}</p>
              <StoreButtons className="[&_[data-store-placeholder]]:!border-white/30 [&_[data-store-placeholder]]:!bg-white/10 [&_[data-store-placeholder]]:!text-white/80" />
              <p className="text-sm text-white/70">{content.finalCta.note}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink
                  href="/aide"
                  variant="ghost"
                  size="md"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Besoin d&apos;aide ? Ouvrir l&apos;aide
                </ButtonLink>
                <ButtonLink
                  href="/pour-les-coachs"
                  variant="ghost"
                  size="md"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Vous êtes coach ? Accéder au parcours pro
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--color-accent-soft)]">Ce que vous lancez</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
                <li className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">Analyse photo IA en quelques secondes</li>
                <li className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">Repères nutritionnels lisibles et actionnables</li>
                <li className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">Suivi d&apos;habitudes progressif, sans culpabilité</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
