import Image from "next/image";

import { Container } from "@/components/ui/container";
import { content } from "@/content";

const desktopTuning = {
  containerMinHeightPx: 410,
  circleCenterYPercent: 46,
  circleSizePx: 210,
  topCardMaxWidthPx: 430,
  topCardOffsetYPx: 0,
  bottomRowOffsetYPx: 10,
  leftCardOffsetYPx: 0,
  rightCardOffsetYPx: 0,
};

export function CommunitySection() {
  const topItem = content.socialItems[0];
  const leftItem = content.socialItems[1];
  const rightItem = content.socialItems[2];

  return (
    <section id="communaute" className="py-16 sm:py-20">
      <Container>
        <article className="section-shell relative overflow-hidden p-5 sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-[rgba(16,185,129,0.14)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 right-2 h-64 w-64 rounded-full bg-[rgba(91,161,180,0.16)] blur-3xl"
          />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-[var(--color-border-strong)] bg-[rgba(16,185,129,0.1)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
                {content.socialEyebrow}
              </p>
              <h2 className="mt-4 max-w-3xl text-balance text-3xl font-extrabold leading-tight text-[var(--color-ink)] sm:text-4xl">
                {content.socialTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                {content.socialDescription}
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:hidden">
                {content.socialItems.map((item, index) => (
                  <li
                    key={item.title}
                    className={`rounded-2xl border border-[var(--color-border)] bg-white/85 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] ${index === 2 ? "sm:col-span-2" : ""}`}
                  >
                    <p className="mb-2 inline-flex rounded-full border border-[rgba(16,120,95,0.2)] bg-[rgba(219,244,235,0.68)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent-strong)]">
                      Etape {index + 1}
                    </p>
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                  </li>
                ))}
              </ul>

              <div className="relative mt-8 hidden lg:block" style={{ minHeight: `${desktopTuning.containerMinHeightPx}px` }}>
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(16,120,95,0.2)] bg-[radial-gradient(circle,rgba(219,244,235,0.72)_0%,rgba(219,244,235,0.24)_62%,rgba(219,244,235,0)_100%)]"
                  style={{
                    top: `${desktopTuning.circleCenterYPercent}%`,
                    width: `${desktopTuning.circleSizePx}px`,
                    height: `${desktopTuning.circleSizePx}px`,
                  }}
                />

                <div className="relative z-10">
                  {topItem ? (
                    <article
                      className="mx-auto rounded-2xl border border-[var(--color-border)] bg-white/94 p-5 shadow-[0_18px_32px_-26px_rgba(22,56,48,0.58)] transition duration-300 hover:border-[var(--color-border-strong)]"
                      style={{
                        maxWidth: `${desktopTuning.topCardMaxWidthPx}px`,
                        transform: `translateY(${desktopTuning.topCardOffsetYPx}px)`,
                      }}
                    >
                      <p className="mb-3 inline-flex rounded-full border border-[rgba(16,120,95,0.2)] bg-[rgba(219,244,235,0.68)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent-strong)]">
                        Etape 1
                      </p>
                      <h3 className="text-lg font-semibold leading-7 text-[var(--color-ink)]">{topItem.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{topItem.description}</p>
                    </article>
                  ) : null}

                  <div className="mt-5 grid grid-cols-2 gap-5" style={{ transform: `translateY(${desktopTuning.bottomRowOffsetYPx}px)` }}>
                    {leftItem ? (
                      <article
                        className="rounded-2xl border border-[var(--color-border)] bg-white/94 p-5 shadow-[0_18px_32px_-26px_rgba(22,56,48,0.58)] transition duration-300 hover:border-[var(--color-border-strong)]"
                        style={{ transform: `translateY(${desktopTuning.leftCardOffsetYPx}px)` }}
                      >
                        <p className="mb-3 inline-flex rounded-full border border-[rgba(16,120,95,0.2)] bg-[rgba(219,244,235,0.68)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent-strong)]">
                          Etape 2
                        </p>
                        <h3 className="text-lg font-semibold leading-7 text-[var(--color-ink)]">{leftItem.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{leftItem.description}</p>
                      </article>
                    ) : null}

                    {rightItem ? (
                      <article
                        className="rounded-2xl border border-[var(--color-border)] bg-white/94 p-5 shadow-[0_18px_32px_-26px_rgba(22,56,48,0.58)] transition duration-300 hover:border-[var(--color-border-strong)]"
                        style={{ transform: `translateY(${desktopTuning.rightCardOffsetYPx}px)` }}
                      >
                        <p className="mb-3 inline-flex rounded-full border border-[rgba(16,120,95,0.2)] bg-[rgba(219,244,235,0.68)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent-strong)]">
                          Etape 3
                        </p>
                        <h3 className="text-lg font-semibold leading-7 text-[var(--color-ink)]">{rightItem.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{rightItem.description}</p>
                      </article>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[370px]">
              <div className="relative overflow-hidden rounded-[1.8rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,#f9fdfa,#e4efea)] p-4 sm:p-5">
                <div aria-hidden className="absolute -left-14 -top-10 h-28 w-28 rounded-full bg-[var(--color-accent-soft)] blur-2xl" />
                <div
                  aria-hidden
                  className="absolute -bottom-10 -right-8 h-24 w-24 rounded-full bg-[rgba(118,171,190,0.3)] blur-2xl"
                />
                <Image
                  src="/images/community/iphone17-community.png"
                  alt="Capture de la communauté BeFood avec partage de repas"
                  width={1290}
                  height={2796}
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 320px, 370px"
                  className="relative mx-auto h-auto w-full max-w-[302px]"
                />
              </div>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
}
