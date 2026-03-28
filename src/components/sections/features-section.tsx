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
              index === 0
                ? "border-[var(--color-border-strong)] bg-[linear-gradient(155deg,#f2fbf7,#e8f0ed)] md:col-span-2"
                : "",
            ].join(" ")}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--color-muted)]">Point clé {index + 1}</p>
            <h3 className="text-xl font-semibold text-[var(--color-ink)]">{feature.title}</h3>
            <p className="text-sm leading-6 text-[var(--color-muted)]">{feature.description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <h3 className="text-2xl font-semibold text-[var(--color-ink)]">{content.differentiationTitle}</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            {content.differentiators.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
              </div>
            ))}
          </div>
          <aside className="rounded-2xl border border-[color:rgb(9_27_45_/15%)] bg-[linear-gradient(145deg,#0a1a2d,#132f48)] p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--color-accent-soft)]">
              Différence BeFood
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/85">
              <li className="rounded-xl border border-white/15 bg-white/8 px-3 py-2">
                Vous comprenez le repas dans son ensemble, pas seulement des totaux.
              </li>
              <li className="rounded-xl border border-white/15 bg-white/8 px-3 py-2">
                Les recommandations restent concrètes, progressives et non culpabilisantes.
              </li>
              <li className="rounded-xl border border-white/15 bg-white/8 px-3 py-2">
                L&apos;objectif est la constance durable, pas la pression quotidienne.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </Section>
  );
}
