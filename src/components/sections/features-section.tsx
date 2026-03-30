import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { content } from "@/content";

export function FeaturesSection() {
  return (
    <Section
      id="fonctionnalites"
      eyebrow="Valeur produit"
      title={content.featuresTitle}
      description="BeFood combine analyse photo, repères nutritionnels et guidance pour aider à mieux manger avec plus de clarté."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {content.featureItems.map((feature, index) => (
          <Card
            key={feature.title}
            className={[
              "space-y-3 bg-[var(--color-panel)]",
              index === 0 ? "border-[var(--color-border-strong)] bg-[linear-gradient(155deg,#f2fbf7,#e8f0ed)]" : "",
            ].join(" ")}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--color-muted)]">Point clé {index + 1}</p>
            <h3 className="text-xl font-semibold text-[var(--color-ink)]">{feature.title}</h3>
            <p className="text-sm leading-6 text-[var(--color-muted)]">{feature.description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <article className="rounded-3xl border border-[color:rgb(9_27_45_/15%)] bg-[linear-gradient(145deg,#0a1a2d,#132f48)] p-5 text-white sm:p-7">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold leading-tight">
                {content.differentiationTitle}
              </h3>
              <ul className="mt-4 space-y-3">
                {content.differentiators.map((item) => (
                  <li key={item.title} className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-white">
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold leading-tight">
                {content.coachingTitle}
              </h3>
              <ul className="mt-4 space-y-3">
                {content.coachingPoints.map((point) => (
                  <li key={point.title} className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-white">
                    {point.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 text-sm text-white/80">
            Vous êtes coach ou professionnel de la nutrition ?{" "}
            <Link
              href="/pour-les-coachs"
              className="font-semibold text-[var(--color-accent-soft)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Découvrez le parcours pro BeFood
            </Link>
            .
          </p>
        </article>
      </div>
    </Section>
  );
}
