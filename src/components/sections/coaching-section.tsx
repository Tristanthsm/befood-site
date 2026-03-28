import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { content } from "@/content";

export function CoachingSection() {
  return (
    <Section id="coaching" eyebrow="Guidance" title={content.coachingTitle} description={content.coachingDescription}>
      <div className="grid gap-4 md:grid-cols-3">
        {content.coachingPoints.map((point) => (
          <Card key={point.title} className="space-y-3 bg-white/95">
            <h3 className="text-xl font-semibold text-[var(--color-ink)]">{point.title}</h3>
            <p className="text-sm leading-6 text-[var(--color-muted)]">{point.description}</p>
          </Card>
        ))}
      </div>
      <p className="mt-5 text-sm text-[var(--color-muted)]">
        Vous êtes coach ou professionnel de la nutrition ?{" "}
        <Link
          href="/pour-les-coachs"
          className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          Découvrez le parcours pro BeFood
        </Link>
        .
      </p>
    </Section>
  );
}
