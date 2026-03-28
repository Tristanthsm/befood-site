import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { content } from "@/content";

export function CommunitySection() {
  return (
    <Section
      id="communaute"
      eyebrow="Communauté"
      title={content.socialTitle}
      description="BeFood favorise une motivation utile: partager, s'inspirer et rester régulier sans se comparer en permanence."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="section-shell overflow-hidden p-4 sm:p-5">
          <div className="relative overflow-hidden rounded-[1.3rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#f6fbf8,#e6efeb)] p-4">
            <div aria-hidden className="absolute -left-14 -top-10 h-28 w-28 rounded-full bg-[var(--color-accent-soft)] blur-2xl" />
            <div aria-hidden className="absolute -bottom-10 -right-8 h-24 w-24 rounded-full bg-[rgba(118,171,190,0.3)] blur-2xl" />
            <Image
              src="/images/app/onboarding-voice.png"
              alt="Aperçu du coach BeFood dans l'application"
              width={519}
              height={1024}
              className="relative mx-auto h-auto w-[72%] max-w-[205px]"
            />
            <p className="relative mt-4 rounded-xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
              Fonction sociale en évolution: partage de repas, idées pratiques et motivation collective dans une logique constructive.
            </p>
          </div>
        </article>

        <div className="grid gap-4">
          {content.socialItems.map((item) => (
            <Card key={item.title} className="space-y-3 bg-white/92">
              <h3 className="text-xl font-semibold text-[var(--color-ink)]">{item.title}</h3>
              <p className="text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
