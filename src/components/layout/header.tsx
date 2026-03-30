import Link from "next/link";

import { StartFreeModalTrigger } from "@/components/auth/start-free-modal-trigger";
import { HeaderShell } from "@/components/layout/header-shell";
import { mainNavigation } from "@/lib/site-config";
export function Header() {

  return (
    <HeaderShell>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <span className="font-display text-[1.85rem] font-extrabold leading-none tracking-[-0.025em]">
              <span className="text-[var(--color-ink)]">Be</span>
              <span className="text-[var(--color-ink)]">Food</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-2 md:flex">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold text-[var(--color-muted)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-[var(--color-ink)] hover:shadow-[0_10px_20px_-14px_rgba(10,24,39,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                <span className="relative">
                  {item.label}
                  <span className="pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full origin-center scale-x-0 rounded-full bg-[var(--color-accent-strong)] opacity-90 transition-transform duration-200 group-hover:scale-x-100" />
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden items-center md:flex">
            <StartFreeModalTrigger
              className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(16,185,129,0.95)] transition hover:bg-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Démarrer gratuitement
            </StartFreeModalTrigger>
          </div>

          <details className="group relative md:hidden">
            <summary className="inline-flex h-10 min-w-20 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
              Menu
            </summary>
            <div className="absolute right-0 top-13 w-72 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-card)]">
              <nav aria-label="Navigation mobile" className="flex flex-col gap-2">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] hover:pl-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  >
                    {item.label}
                  </Link>
                ))}
                <StartFreeModalTrigger
                  className="mt-1 rounded-xl bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Démarrer gratuitement
                </StartFreeModalTrigger>
              </nav>
            </div>
          </details>
      </div>
    </HeaderShell>
  );
}
