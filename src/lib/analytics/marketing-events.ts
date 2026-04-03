declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type MarketingEventName =
  | "bf_marketing_page_view"
  | "bf_cta_click"
  | "bf_app_store_cta_click"
  | "bf_scroll_depth"
  | "bf_join_flow_started";

interface EventParams {
  [key: string]: string | number | boolean | null | undefined;
}

export const MARKETING_PAGE_TYPES: Record<string, string> = {
  "/": "home",
  "/comment-ca-marche": "comment_ca_marche",
  "/pour-les-coachs": "pour_les_coachs",
  "/join": "join",
};

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function getMarketingPageType(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  return MARKETING_PAGE_TYPES[normalized] ?? null;
}

export function trackMarketingEvent(eventName: MarketingEventName, params: EventParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", eventName, payload]);
}
