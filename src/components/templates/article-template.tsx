import Link from "next/link";

import { BreadcrumbNav } from "@/components/seo/breadcrumb-nav";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface RelatedLink {
  href: string;
  label: string;
  description: string;
}

interface CtaBlock {
  title: string;
  description: string;
  label: string;
  href: string;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface ArticleTemplateProps {
  eyebrow?: string;
  title: string;
  description: string;
  intro: string;
  intent: string;
  updatedAt: string;
  breadcrumbs: BreadcrumbItem[];
  sections: ArticleSection[];
  relatedLinks: RelatedLink[];
  cta?: CtaBlock;
}

function toAnchorId(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function ArticleTemplate({
  eyebrow,
  title,
  description,
  intro,
  intent,
  updatedAt,
  breadcrumbs,
  sections,
  relatedLinks,
  cta,
}: ArticleTemplateProps) {
  return (
    <section className="py-14 sm:py-18">
      <Container className="space-y-8">
        <header className="space-y-4 rounded-[1.75rem] border border-[var(--color-border)] bg-white/92 p-6 sm:p-8">
          <BreadcrumbNav items={breadcrumbs} />
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-accent-strong)]">{eyebrow}</p>
          ) : null}
          <h1 className="max-w-4xl text-balance font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">{description}</p>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-ink)]">{intro}</p>
          <p className="text-sm font-medium text-[var(--color-muted)]">Intent utilisateur: {intent}</p>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-muted)]">Mis à jour le {updatedAt}</p>
        </header>

        {sections.length >= 3 ? (
          <aside className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 sm:p-6">
            <h2 className="font-display text-2xl text-[var(--color-ink)]">Sommaire</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {sections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#${toAnchorId(section.heading)}`}
                    className="font-medium text-[var(--color-ink)] underline-offset-4 hover:text-[var(--color-accent-strong)] hover:underline"
                  >
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}

        <article className="space-y-8">
          {sections.map((section) => (
            <Card key={section.heading} className="space-y-4 bg-white/95">
              <h2 id={toAnchorId(section.heading)} className="font-display text-3xl text-[var(--color-ink)]">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.heading}-${paragraphIndex}`} className="text-base leading-7 text-[var(--color-muted)]">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-[var(--color-muted)]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </article>

        {relatedLinks.length > 0 ? (
          <section aria-labelledby="related-content-title" className="space-y-4">
            <h2 id="related-content-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              Continuer votre exploration
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {relatedLinks.map((link) => (
                <Card key={link.href} className="space-y-2 bg-white/95">
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                    <Link href={link.href} className="underline-offset-4 hover:underline">
                      {link.label}
                    </Link>
                  </h3>
                  <p className="text-sm leading-6 text-[var(--color-muted)]">{link.description}</p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {cta ? (
          <section className="rounded-3xl border border-[color:rgb(11_34_52_/20%)] bg-[linear-gradient(145deg,#0a1a2e,#173553)] p-6 text-white sm:p-8">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">{cta.title}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">{cta.description}</p>
            <div className="mt-5">
              <Link
                href={cta.href}
                data-cta-track="page_cta"
                data-cta-location="article_template"
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                {cta.label}
              </Link>
            </div>
          </section>
        ) : null}
      </Container>
    </section>
  );
}
