import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export function NotFoundView() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Card className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Erreur 404</p>
          <h1 className="font-display text-4xl text-[var(--color-ink)] sm:text-5xl">Page introuvable</h1>
          <p className="text-base leading-7 text-[var(--color-muted)]">
            La page demandée n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil ou contactez le support si besoin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/" size="md">
              Retour à l&apos;accueil
            </ButtonLink>
            <ButtonLink href="/support" variant="secondary" size="md">
              Ouvrir le support
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </section>
  );
}
