const FALLBACK_CLIENT_ID_KEY = "bf_ga_fallback_cid_v1";

function getFallbackClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    const existing = window.localStorage.getItem(FALLBACK_CLIENT_ID_KEY);
    if (existing) {
      return existing;
    }
  } catch {
    // localStorage may be unavailable in privacy modes.
  }

  const generated = typeof window.crypto?.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    window.localStorage.setItem(FALLBACK_CLIENT_ID_KEY, generated);
  } catch {
    // Best effort persistence only.
  }

  return generated;
}

export function sendGaFallbackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    eventName,
    clientId: getFallbackClientId(),
    pagePath: window.location.pathname,
    pageLocation: window.location.href,
    params,
  };

  const body = JSON.stringify(payload);

  if (typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/fallback", blob);
    return;
  }

  void fetch("/api/analytics/fallback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Avoid user-facing noise for telemetry fallback failures.
  });
}

