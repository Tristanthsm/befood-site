"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AndroidWaitlistTriggerProps {
  className: string;
  children: ReactNode;
  source: string;
  trackingId?: string;
  trackingLocation?: string;
  dataStorePlaceholder?: boolean;
}

type SubmitState = "idle" | "submitting" | "success";

interface WaitlistResponse {
  message?: string;
}

function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AndroidWaitlistTrigger({
  className,
  children,
  source,
  trackingId,
  trackingLocation,
  dataStorePlaceholder = false,
}: AndroidWaitlistTriggerProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const closeModal = () => {
    setOpen(false);
    setSubmitState("idle");
    setErrorMessage(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!isEmailLike(normalizedEmail)) {
      setErrorMessage("Adresse email invalide.");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/join/android-waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          source,
          referrer: typeof document !== "undefined" ? document.referrer : null,
          fullUrl: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as WaitlistResponse;

      if (!response.ok) {
        setErrorMessage(payload.message ?? "Impossible de vous inscrire pour le moment.");
        setSubmitState("idle");
        return;
      }

      setSubmitState("success");
    } catch {
      setErrorMessage("Impossible de vous inscrire pour le moment.");
      setSubmitState("idle");
    }
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        data-cta-track={trackingId}
        data-cta-location={trackingLocation}
        data-store-placeholder={dataStorePlaceholder || undefined}
      >
        {children}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6">
              <button
                type="button"
                aria-label="Fermer la file d'attente Android"
                className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
                onClick={closeModal}
              />

              <div className="relative w-full max-w-md rounded-[1.6rem] border border-[color:rgb(11_34_52_/16%)] bg-white p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.65)] sm:p-7">
                <button
                  type="button"
                  aria-label="Fermer"
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-panel)] text-xl leading-none text-[var(--color-ink)] ring-1 ring-[var(--color-border)] hover:bg-white"
                  onClick={closeModal}
                >
                  ×
                </button>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
                  Android en priorite
                </p>
                <h3 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Google Play arrive vite</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Laissez votre email pour recevoir l&apos;acces Android des qu&apos;il est disponible.
                </p>

                {submitState === "success" ? (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Vous etes bien sur la liste. On vous previendra des l&apos;ouverture Android.
                  </div>
                ) : (
                  <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                    <label className="block space-y-1 text-sm font-medium text-[var(--color-ink)]">
                      Votre email
                      <input
                        type="email"
                        name="android_waitlist_email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-12 w-full rounded-full border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                        placeholder="vous@exemple.com"
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={submitState === "submitting"}
                      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitState === "submitting" ? "Inscription..." : "Me prevenir pour Android"}
                    </button>
                  </form>
                )}

                {errorMessage ? (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
