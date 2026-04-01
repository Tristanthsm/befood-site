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

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Rejoindre BeFood</p>
          <h1 className="mt-2 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
            Continuer avec {coachLabel}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)] sm:text-base">
            Nous essayons d&apos;ouvrir l&apos;application BeFood. Si elle ne s&apos;ouvre pas automatiquement, poursuivez via l&apos;App Store.
          </p>

          {initialContext.coachCode ? (
            <p className="mt-4 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
              Code coach: {initialContext.coachCode}
            </p>
          ) : null}

          {attemptingOpen ? (
            <p className="mt-4 text-sm font-semibold text-[var(--color-accent-strong)]">
              Tentative d&apos;ouverture de l&apos;application en cours...
            </p>
          ) : null}

          {appOpened ? (
            <p className="mt-4 text-sm font-semibold text-[var(--color-accent-strong)]">
              Application ouverte. Vous pouvez revenir ici si besoin.
            </p>
          ) : null}

          {trackingError ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {trackingError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={appStoreHref}
              className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Ouvrir l&apos;App Store
            </a>
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
              className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-panel)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              J&apos;ai déjà l&apos;app
            </button>
          </div>

          {manualAttemptCount > 0 ? (
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              Tentatives manuelles: {manualAttemptCount}
            </p>
          ) : null}

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
