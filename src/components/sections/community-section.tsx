import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { content } from "@/content";

export function CommunitySection() {
  return (
    <section id="communaute" className="py-16 sm:py-20">
      <Container>
        <article className="section-shell overflow-hidden p-5 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-extrabold leading-tight text-[var(--color-ink)] sm:text-4xl">
                {content.socialTitle}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                BeFood encourage une dynamique utile : partager, s&apos;inspirer et rester régulier sans comparaison permanente.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {content.socialItems.map((item) => (
                  <Card key={item.title} className="space-y-2 bg-white">
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
                    <p className="text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[360px]">
              <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#f7fcfa,#e5f0ec)] p-4 sm:p-5">
                <div aria-hidden className="absolute -left-14 -top-10 h-28 w-28 rounded-full bg-[var(--color-accent-soft)] blur-2xl" />
                <div aria-hidden className="absolute -bottom-10 -right-8 h-24 w-24 rounded-full bg-[rgba(118,171,190,0.3)] blur-2xl" />
                <Image
                  src="/images/community/iphone17-community.png"
                  alt="Capture de la communauté BeFood avec partage de repas"
                  width={1290}
                  height={2796}
                  className="relative mx-auto h-auto w-full max-w-[300px]"
                />
              </div>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
}
