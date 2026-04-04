"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { APP_STORE_URL } from "@/lib/join/constants";
import { buildSearchParamsFromContext, type JoinQueryContext } from "@/lib/join/params";
import { persistAttributionContext } from "@/lib/analytics/attribution-context";

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
  coachToken?: string | null;
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

async function copyCoachTokenToClipboard(token: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(token);
    return true;
  } catch {
    return false;
  }
}

async function fetchJoinTrackingPayload(querySearch: string): Promise<JoinTrackResponse | null> {
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
      return null;
    }

    return (await response.json()) as JoinTrackResponse;
  } catch {
    return null;
  }
}

export function JoinPageClient({ initialContext, initialCoach }: JoinPageClientProps) {
  const [tracking, setTracking] = useState<JoinTrackResponse | null>(null);
  const isMountedRef = useRef(true);
  const ctaRedirectingRef = useRef(false);
  const trackingBootstrapPromiseRef = useRef<Promise<JoinTrackResponse | null> | null>(null);
  const primaryCtaLabel = "Activer mon offre coach";

  const querySearch = useMemo(() => {
    const params = buildSearchParamsFromContext(initialContext).toString();
    return params ? `?${params}` : "";
  }, [initialContext]);

  useEffect(() => {
    isMountedRef.current = true;
    if (typeof document !== "undefined") {
      document.body.classList.add("join-focus-page");
    }
    return () => {
      isMountedRef.current = false;
      if (typeof document !== "undefined") {
        document.body.classList.remove("join-focus-page");
      }
    };
  }, []);

  const attemptToOpenApp = (deepLinkUrl: string) => {
    if (!deepLinkUrl) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!isMountedRef.current) return;
    }, 1600);

    const onVisibilityChange = () => {
      if (!isMountedRef.current) return;
      if (document.visibilityState === "hidden") {
        window.clearTimeout(timeout);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange, { once: true });
    window.location.assign(deepLinkUrl);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapTracking = async () => {
      const trackingPromise = fetchJoinTrackingPayload(querySearch);
      trackingBootstrapPromiseRef.current = trackingPromise;

      const payload = await trackingPromise;
      if (trackingBootstrapPromiseRef.current === trackingPromise) {
        trackingBootstrapPromiseRef.current = null;
      }
      if (!payload || cancelled) {
        return;
      }

      persistAttributionContext({
        clickId: payload.clickId,
        sessionId: payload.sessionId,
        source: "web_join",
        coachCode: initialContext.coachCode,
        utmSource: initialContext.utmSource,
        utmMedium: initialContext.utmMedium,
        utmCampaign: initialContext.utmCampaign,
      });
      setTracking(payload);

      if (isMobileDevice() && payload.deepLinkUrl) {
        attemptToOpenApp(payload.deepLinkUrl);
      }
    };

    void bootstrapTracking();

    return () => {
      cancelled = true;
    };
  }, [
    initialContext.coachCode,
    initialContext.utmCampaign,
    initialContext.utmMedium,
    initialContext.utmSource,
    querySearch,
  ]);

  const coach = tracking?.coach ?? initialCoach;
  const coachLabel = coach?.businessName ?? "votre coach";
  const appStoreHref = tracking?.appStoreRedirectUrl ?? APP_STORE_URL;
  const coachToken = tracking?.coachToken ?? null;
  const coachInitials = coachLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");

  const handlePrimaryCtaClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (ctaRedirectingRef.current) {
      return;
    }
    ctaRedirectingRef.current = true;

    let resolvedTracking = tracking;
    if (!resolvedTracking && trackingBootstrapPromiseRef.current) {
      resolvedTracking = await trackingBootstrapPromiseRef.current;
    }
    if (!resolvedTracking) {
      resolvedTracking = await fetchJoinTrackingPayload(querySearch);
      if (resolvedTracking && isMountedRef.current) {
        persistAttributionContext({
          clickId: resolvedTracking.clickId,
          sessionId: resolvedTracking.sessionId,
          source: "web_join",
          coachCode: initialContext.coachCode,
          utmSource: initialContext.utmSource,
          utmMedium: initialContext.utmMedium,
          utmCampaign: initialContext.utmCampaign,
        });
        setTracking(resolvedTracking);
      }
    }

    const resolvedCoachToken = resolvedTracking?.coachToken ?? coachToken;
    const resolvedAppStoreHref = resolvedTracking?.appStoreRedirectUrl ?? appStoreHref;

    if (resolvedCoachToken?.startsWith("BFTOKEN_")) {
      await copyCoachTokenToClipboard(resolvedCoachToken);
    }

    window.location.assign(resolvedAppStoreHref);
  };

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#060c0a_0%,#0b1511_35%,#0e1d17_100%)] py-2 sm:py-8">
      <style jsx global>{`
        body.join-focus-page header {
          padding-top: 0.35rem !important;
          padding-bottom: 0.35rem !important;
        }

        body.join-focus-page header > div > div {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        body.join-focus-page header > div > div > div {
          padding-top: 0.2rem !important;
          padding-bottom: 0.2rem !important;
        }

        body.join-focus-page header a {
          padding-top: 0.2rem !important;
          padding-bottom: 0.2rem !important;
        }

        body.join-focus-page header [aria-label="Navigation principale"],
        body.join-focus-page header details,
        body.join-focus-page header button {
          display: none !important;
        }

        body.join-focus-page footer {
          display: none !important;
        }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.38)_0%,rgba(16,185,129,0.12)_42%,rgba(16,185,129,0)_74%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.24)_0%,rgba(16,185,129,0.08)_46%,rgba(16,185,129,0)_76%)]"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(243,252,247,0.92))] p-4 shadow-[0_54px_120px_-64px_rgba(0,0,0,0.9)] backdrop-blur sm:rounded-[2rem] sm:p-8">
          <h1 className="mt-2 text-balance font-display text-[1.8rem] leading-[1.03] text-[var(--color-ink)] sm:mt-4 sm:text-5xl">
            Votre coach vous réserve -50% sur BeFood
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-5 text-[var(--color-muted)] sm:mt-2 sm:text-base sm:leading-6">
            Installez BeFood pour activer votre offre et rejoindre votre coach.
          </p>

          <div className="mt-2 rounded-2xl bg-[linear-gradient(180deg,rgba(241,251,246,0.78),rgba(255,255,255,0.86))] p-3 shadow-[0_24px_46px_-30px_rgba(16,53,49,0.5)] sm:mt-3 sm:p-4">
            <div className="rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(230,248,239,0.9))] p-3 sm:rounded-2xl sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(155deg,#07130f_0%,#0f5c44_48%,#1cc789_100%)] text-sm font-bold text-white shadow-[0_22px_34px_-22px_rgba(16,185,129,0.95)] ring-2 ring-emerald-100/90 sm:h-16 sm:w-16 sm:text-lg sm:ring-4">
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_62%)]" />
                <span className="pointer-events-none absolute -right-2 -top-2 h-7 w-7 rounded-full bg-emerald-200/45 blur-[8px]" />
                {coachInitials || "C"}
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">Offre coach</p>
                <p className="text-[1.05rem] font-bold text-[var(--color-ink)] sm:text-[1.2rem]">{coachLabel}</p>
                <p className="text-sm font-semibold text-emerald-800">Offre réservée via votre coach</p>
                <p className="text-xs text-[var(--color-muted)]">Accès coach + offre activés dans l&apos;app.</p>
              </div>
            </div>
            </div>
          </div>

          <div className="mt-2.5 sm:mt-4">
            <a
              href={appStoreHref}
              onClick={handlePrimaryCtaClick}
              data-cta-track="join_primary_app_store"
              data-cta-location="join_primary_cta"
              className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#0d1f19_0%,#0f7f5a_52%,#20d58f_100%)] px-5 py-3.5 text-[15px] font-extrabold tracking-[0.005em] text-white shadow-[0_34px_52px_-24px_rgba(16,185,129,0.98)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:text-base"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_80%)] opacity-0 transition group-hover:opacity-100"
              />
              {primaryCtaLabel}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
