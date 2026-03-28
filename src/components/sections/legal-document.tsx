import type { LegalDocument as LegalDocumentType } from "@/lib/types";

interface LegalDocumentProps {
  document: LegalDocumentType;
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-10">
      <header className="space-y-4">
        <h1 className="font-display text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">{document.title}</h1>
        <p className="text-base leading-7 text-[var(--color-muted)]">{document.intro}</p>
        <p className="text-sm text-[var(--color-muted)]">Dernière mise à jour: {document.updatedAt}</p>
        {document.replacementNotice ? (
          <p className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-accent-strong)]">
            {document.replacementNotice}
          </p>
        ) : null}
      </header>

      <div className="space-y-8">
        {document.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-display text-2xl text-[var(--color-ink)]">{section.heading}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${section.heading}-p-${paragraphIndex}`}
                  className="text-base leading-7 text-[var(--color-muted)]"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-[var(--color-muted)]">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={`${section.heading}-b-${bulletIndex}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
