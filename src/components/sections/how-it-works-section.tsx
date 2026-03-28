import { Container } from "@/components/ui/container";
import { content } from "@/content";

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-16 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(140deg,#081122,#112744)] p-7 text-white sm:p-10">
          <header className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-soft)]">Parcours</p>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{content.howItWorksTitle}</h2>
            <p className="text-base leading-7 text-white/78 sm:text-lg">
              Un flux simple et visuel pour passer d&apos;un repas capturé à des décisions plus claires dans la durée.
            </p>
          </header>

          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {content.howItWorksSteps.map((step, index) => {
              const cleanTitle = step.title.replace(/^\d+\.\s*/, "");
              return (
                <li
                  key={step.title}
                  className="relative h-full rounded-3xl border border-white/14 bg-white/7 p-5 backdrop-blur-sm transition hover:bg-white/10"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-white">{cleanTitle}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">{step.description}</p>
                  {index < content.howItWorksSteps.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute -right-2 top-9 hidden h-px w-4 bg-white/30 md:block"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
