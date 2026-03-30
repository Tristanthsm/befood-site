import { StartFreeModalTrigger } from "@/components/auth/start-free-modal-trigger";
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
            <StartFreeModalTrigger
              className="inline-flex h-12 items-center justify-center rounded-full px-6 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-[var(--color-ink)] text-white hover:bg-black focus-visible:outline-[var(--color-ink)]"
            >
              Démarrer gratuitement
            </StartFreeModalTrigger>
          </div>
        </div>
      </Container>
    </section>
  );
}
