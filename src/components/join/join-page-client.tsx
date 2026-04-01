"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { APP_STORE_URL, SUPPORT_URL } from "@/lib/join/constants";
import { buildSearchParamsFromContext, type JoinQueryContext } from "@/lib/join/params";

interface JoinPageClientProps {
  initialContext: JoinQueryContext;
  initialCoach: {
    businessName: string;
    coachCode: string;
  } | null;
}

interface JoinTrackResponse {
  clickId: string;
  sessionId: string;
  deepLinkUrl: string;
  appStoreRedirectUrl: string;
  appStoreUrl: string;
  coach: {
    businessName: string;
    coachCode: string;
  } | null;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function JoinPageClient({ initialContext, initialCoach }: JoinPageClientProps) {
  const [tracking, setTracking] = useState<JoinTrackResponse | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [attemptingOpen, setAttemptingOpen] = useState(false);
  const [appOpened, setAppOpened] = useState(false);
  const [manualAttemptCount, setManualAttemptCount] = useState(0);
  const isMountedRef = useRef(true);

  const querySearch = useMemo(() => {
    const params = buildSearchParamsFromContext(initialContext).toString();
    return params ? `?${params}` : "";
  }, [initialContext]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const attemptToOpenApp = (deepLinkUrl: string) => {
    if (!deepLinkUrl) {
      return;
    }

    setAttemptingOpen(true);
    const timeout = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setAttemptingOpen(false);
    }, 1600);

    const onVisibilityChange = () => {
      if (!isMountedRef.current) return;
      if (document.visibilityState === "hidden") {
        setAppOpened(true);
        setAttemptingOpen(false);
        window.clearTimeout(timeout);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange, { once: true });
    window.location.assign(deepLinkUrl);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapTracking = async () => {
      try {
        const response = await fetch("/api/join/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search: querySearch,
            referrer: typeof document !== "undefined" ? document.referrer : null,
            fullUrl: typeof window !== "undefined" ? window.location.href : null,
          }),
        });

        if (!response.ok) {
          throw new Error("tracking_failed");
        }

        const payload = (await response.json()) as JoinTrackResponse;
        if (cancelled) {
          return;
        }

        setTracking(payload);

        if (isMobileDevice() && payload.deepLinkUrl) {
          attemptToOpenApp(payload.deepLinkUrl);
        }
      } catch {
        if (!cancelled) {
          setTrackingError("Impossible d'initialiser le tracking pour ce lien.");
        }
      }
    };

    bootstrapTracking();

    return () => {
      cancelled = true;
    };
  }, [querySearch]);

  const coach = tracking?.coach ?? initialCoach;
  const coachLabel = coach?.businessName ?? "votre coach";
  const deepLinkUrl = tracking?.deepLinkUrl ?? "";
  const appStoreHref = tracking?.appStoreRedirectUrl ?? APP_STORE_URL;
  const coachInitial = coachLabel.slice(0, 1).toUpperCase();

  const statusMessage = trackingError
    ? "Le tracking n'a pas pu être initialisé. Vous pouvez quand même continuer vers l'App Store."
    : appOpened
      ? "Application ouverte. Vous pouvez revenir ici à tout moment."
      : attemptingOpen
        ? "Tentative d'ouverture de l'application en cours..."
        : "Lien prêt. Ouvrez l'application ou continuez via l'App Store.";

  const statusClassName = trackingError
    ? "border-amber-200 bg-amber-50 text-amber-800"
    : appOpened
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : attemptingOpen
        ? "border-sky-200 bg-sky-50 text-sky-800"
        : "border-[var(--color-border)] bg-white text-[var(--color-ink)]";

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0.06)_55%,rgba(16,185,129,0)_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16)_0%,rgba(56,189,248,0.06)_50%,rgba(56,189,248,0)_72%)]"
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/96 p-6 shadow-[0_38px_90px_-52px_rgba(10,24,39,0.55)] sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Rejoindre BeFood</p>
              <h1 className="mt-2 font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
                Rejoignez l&apos;espace de <span className="text-[var(--color-accent-strong)]">{coachLabel}</span>
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)] sm:text-base">
                Votre lien coach est bien reconnu. Nous essayons d&apos;ouvrir l&apos;application automatiquement pour conserver le
                contexte d&apos;attribution.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {initialContext.coachCode ? (
                  <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                    Code coach: {initialContext.coachCode}
                  </span>
                ) : null}
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Lien traçable actif
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 md:min-w-56">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white">
                {coachInitial}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Coach référent</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{coachLabel}</p>
              </div>
            </div>
          </div>

          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${statusClassName}`}>
            {statusMessage}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Option 1 (recommandée)</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">J&apos;ai déjà l&apos;application</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                Ouvrez directement BeFood avec le contexte coach déjà préparé.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Option 2</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">Passer par l&apos;App Store</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                Le clic est tracé avant redirection pour préserver l&apos;attribution.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!deepLinkUrl) {
                  return;
                }
                setManualAttemptCount((value) => value + 1);
                attemptToOpenApp(deepLinkUrl);
              }}
              disabled={!deepLinkUrl}
              className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              J&apos;ai déjà l&apos;app
            </button>
            <a
              href={appStoreHref}
              className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Ouvrir l&apos;App Store
            </a>
          </div>

          {manualAttemptCount > 0 ? (
            <p className="mt-3 text-xs text-[var(--color-muted)]">Tentatives manuelles: {manualAttemptCount}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
            <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1">Contexte coach conservé</span>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1">Clic App Store tracké</span>
            <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1">Flow compatible app existante</span>
          </div>

          <p className="mt-5 text-xs text-[var(--color-muted)]">
            Besoin d&apos;aide ?{" "}
            <a href={SUPPORT_URL} className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline">
              Contacter le support
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
