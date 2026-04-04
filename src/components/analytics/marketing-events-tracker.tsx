"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

import { useConsent } from "@/components/analytics/consent-provider";
import {
  getMarketingPageType,
  normalizePath,
  toGaWebVitalValue,
  trackGaPageView,
  trackMarketingEvent,
} from "@/lib/analytics/marketing-events";

const SCROLL_THRESHOLDS = [50, 75] as const;
const SCROLL_TRACKED_PATHS = new Set(["/", "/comment-ca-marche", "/pour-les-coachs"]);

function buildScrollKey(pathname: string, threshold: number): string {
  return `${pathname}:${threshold}`;
}

export function MarketingEventsTracker() {
  const pathnameRaw = usePathname() ?? "/";
  const pathname = useMemo(() => normalizePath(pathnameRaw), [pathnameRaw]);
  const { analyticsAllowed } = useConsent();
  const sentScrollMilestonesRef = useRef<Set<string>>(new Set());
  const lastTrackedRouteRef = useRef<string | null>(null);
  const analyticsAllowedRef = useRef<boolean>(analyticsAllowed);
  const pathnameRef = useRef<string>(pathname);

  useEffect(() => {
    analyticsAllowedRef.current = analyticsAllowed;
  }, [analyticsAllowed]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useReportWebVitals((metric) => {
    if (!analyticsAllowedRef.current) {
      return;
    }

    trackMarketingEvent("bf_web_vital", {
      page_path: pathnameRef.current,
      metric_name: metric.name,
      metric_rating: metric.rating ?? null,
      metric_value: toGaWebVitalValue(metric.name, metric.value),
      metric_delta: toGaWebVitalValue(metric.name, metric.delta),
      navigation_type: metric.navigationType ?? null,
    });
  });

  useEffect(() => {
    if (!analyticsAllowed) {
      lastTrackedRouteRef.current = null;
    }
  }, [analyticsAllowed]);

  useEffect(() => {
    if (!analyticsAllowed) {
      return;
    }

    if (lastTrackedRouteRef.current === pathname) {
      return;
    }
    lastTrackedRouteRef.current = pathname;

    const pageType = getMarketingPageType(pathname);
    trackGaPageView(pathname, pageType);

    if (!pageType) {
      return;
    }

    trackMarketingEvent("bf_marketing_page_view", {
      page_path: pathname,
      page_type: pageType,
    });

    if (pathname === "/join") {
      trackMarketingEvent("bf_join_flow_started", {
        source: "join_page_view",
        page_path: pathname,
      });
    }
  }, [analyticsAllowed, pathname]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!analyticsAllowed) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const trackingElement = target?.closest<HTMLElement>("[data-cta-track]");
      if (!trackingElement) {
        return;
      }

      const ctaId = trackingElement.dataset.ctaTrack?.trim();
      if (!ctaId) {
        return;
      }

      const ctaLocation = trackingElement.dataset.ctaLocation?.trim() || null;
      const href = trackingElement instanceof HTMLAnchorElement ? trackingElement.getAttribute("href") : null;

      trackMarketingEvent("bf_cta_click", {
        cta_id: ctaId,
        cta_location: ctaLocation,
        page_path: pathname,
        href,
      });

      if (ctaId === "start_free") {
        trackMarketingEvent("bf_join_flow_started", {
          source: "start_free_cta",
          cta_location: ctaLocation,
          page_path: pathname,
        });
      }

      if (ctaId === "download_app_store" || ctaId === "join_primary_app_store") {
        trackMarketingEvent("bf_app_store_cta_click", {
          cta_id: ctaId,
          cta_location: ctaLocation,
          page_path: pathname,
        });
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [analyticsAllowed, pathname]);

  useEffect(() => {
    if (!analyticsAllowed || !SCROLL_TRACKED_PATHS.has(pathname)) {
      return;
    }

    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollableHeight = doc.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) {
        return;
      }

      const depth = Math.round((window.scrollY / scrollableHeight) * 100);
      SCROLL_THRESHOLDS.forEach((threshold) => {
        if (depth < threshold) {
          return;
        }

        const key = buildScrollKey(pathname, threshold);
        if (sentScrollMilestonesRef.current.has(key)) {
          return;
        }

        sentScrollMilestonesRef.current.add(key);
        trackMarketingEvent("bf_scroll_depth", {
          page_path: pathname,
          depth_percent: threshold,
        });
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [analyticsAllowed, pathname]);

  return null;
}
