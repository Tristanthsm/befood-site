"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { SocialAuthCard } from "@/components/auth/social-auth-card";

interface StartFreeModalTriggerProps {
  className: string;
  children: ReactNode;
  trackingId?: string;
  trackingLocation?: string;
}

export function StartFreeModalTrigger({
  className,
  children,
  trackingId,
  trackingLocation,
}: StartFreeModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const pathname = usePathname();

  const closeModal = () => {
    setOpen(false);
    setAuthMode("signup");
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeModal();
    // Close modal on route changes to avoid stale overlays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        data-cta-track={trackingId}
        data-cta-location={trackingLocation}
      >
        {children}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
              <button
                type="button"
                aria-label="Fermer la fenêtre de connexion"
                className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
                onClick={closeModal}
              />
              <div className="relative w-full max-w-lg">
                <button
                  type="button"
                  aria-label="Fermer"
                  className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-xl leading-none text-[var(--color-ink)] shadow-sm ring-1 ring-[var(--color-border)] hover:bg-white"
                  onClick={closeModal}
                >
                  ×
                </button>
                <SocialAuthCard mode={authMode} onSwitchMode={setAuthMode} onNavigate={closeModal} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
