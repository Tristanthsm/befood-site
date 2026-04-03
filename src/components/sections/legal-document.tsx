import type { LegalDocument as LegalDocumentType } from "@/lib/types";

interface LegalDocumentProps {
  document: LegalDocumentType;
  hideHeader?: boolean;
}

export function LegalDocument({ document, hideHeader = false }: LegalDocumentProps) {
  return (
    <article className={`mx-auto w-full max-w-4xl ${hideHeader ? "space-y-8" : "space-y-12"}`}>
      {!hideHeader ? (
        <header className="space-y-4">
          <h1 className="font-display text-4xl font-semibold leading-tight text-[var(--color-ink)] sm:text-6xl">{document.title}</h1>
          <p className="max-w-3xl text-base leading-8 text-[color:rgb(33_53_66_/88%)]">{document.intro}</p>
          <p className="text-sm font-medium text-[var(--color-muted)]">Dernière mise à jour: {document.updatedAt}</p>
          {document.replacementNotice ? (
            <p className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-accent-strong)]">
              {document.replacementNotice}
            </p>
          ) : null}
        </header>
      ) : null}

      <div className="space-y-8">
        {document.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-ink)]">{section.heading}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${section.heading}-p-${paragraphIndex}`}
                  className="text-base leading-8 text-[color:rgb(33_53_66_/88%)]"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-base leading-8 text-[color:rgb(33_53_66_/88%)]">
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
