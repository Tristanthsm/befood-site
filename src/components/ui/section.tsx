import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, description, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <Container>
        <header className="max-w-3xl space-y-4">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">{eyebrow}</p>
          ) : null}
          <h2 className="text-3xl font-extrabold leading-tight text-[var(--color-ink)] sm:text-4xl">{title}</h2>
          {description ? <p className="text-base leading-7 text-[var(--color-muted)] sm:text-lg">{description}</p> : null}
        </header>
        <div className="mt-8">{children}</div>
      </Container>
    </section>
  );
}
