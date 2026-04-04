"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface AccountDropdownProps {
  email: string;
  providerLabel: string;
  showCoachLink: boolean;
  showAdminLink: boolean;
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 12.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2Zm0 2.3c-4.8 0-8.8 2.7-10 6.7-.1.3.2.8.6.8h18.8c.4 0 .7-.4.6-.8-1.2-4-5.2-6.7-10-6.7Z" />
    </svg>
  );
}

export function AccountDropdown({ email, providerLabel, showCoachLink, showAdminLink }: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] transition hover:bg-[var(--color-panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        <span className="sr-only">Ouvrir le menu compte</span>
        <UserIcon />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[0_18px_40px_-26px_rgba(10,24,39,0.65)]"
        >
          <div className="space-y-1 border-b border-[var(--color-border)] pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Compte connecté</p>
            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{email}</p>
            <p className="text-xs text-[var(--color-muted)]">Connexion: {providerLabel}</p>
          </div>
          <div className="mt-3 space-y-2">
            <Link
              href="/profil"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
            >
              Mon profil
            </Link>
            {showCoachLink ? (
              <Link
                href="/espace-coach"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
              >
                Mon espace coach
              </Link>
            ) : null}
            {showAdminLink ? (
              <>
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                >
                  Espace admin
                </Link>
                <Link
                  href="/admin/conversion"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                >
                  Conversion
                </Link>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
