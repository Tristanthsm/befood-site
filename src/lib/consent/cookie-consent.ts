export const COOKIE_CONSENT_KEY = "bf_cookie_consent_v1";
export const COOKIE_CONSENT_VERSION = 1 as const;

export interface CookieConsentState {
  necessary: true;
  analytics: boolean;
  version: typeof COOKIE_CONSENT_VERSION;
  updatedAt: string;
}

function parseCookie(rawCookie: string): string | null {
  const segments = rawCookie.split(";").map((part) => part.trim());
  const match = segments.find((segment) => segment.startsWith(`${COOKIE_CONSENT_KEY}=`));
  if (!match) {
    return null;
  }

  return match.slice(`${COOKIE_CONSENT_KEY}=`.length);
}

function parseConsent(raw: string | null): CookieConsentState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsentState>;
    if (
      parsed?.necessary === true
      && typeof parsed.analytics === "boolean"
      && parsed.version === COOKIE_CONSENT_VERSION
      && typeof parsed.updatedAt === "string"
    ) {
      return {
        necessary: true,
        analytics: parsed.analytics,
        version: COOKIE_CONSENT_VERSION,
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function serializeConsent(consent: CookieConsentState): string {
  return encodeURIComponent(JSON.stringify(consent));
}

export function buildConsent(analytics: boolean): CookieConsentState {
  return {
    necessary: true,
    analytics,
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    const localConsent = parseConsent(stored);
    if (localConsent) {
      return localConsent;
    }
  } catch {
    // localStorage can be blocked in strict privacy modes.
  }

  const cookieValue = parseCookie(document.cookie);
  return parseConsent(cookieValue);
}

export function persistCookieConsent(consent: CookieConsentState) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = serializeConsent(consent);

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, decodeURIComponent(serialized));
  } catch {
    // Ignore storage failures and keep cookie fallback.
  }

  try {
    document.cookie = `${COOKIE_CONSENT_KEY}=${serialized}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
  } catch {
    // Some contexts can block cookie writes; consent still stays in-memory for the current session.
  }
}

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? ` domain=${domain};` : "";
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;${domainPart} samesite=lax`;
}

function getCookieDomains(hostname: string): string[] {
  const segments = hostname.split(".").filter(Boolean);
  if (segments.length < 2) {
    return [];
  }

  const domains: string[] = [];
  for (let index = 0; index <= segments.length - 2; index += 1) {
    domains.push(`.${segments.slice(index).join(".")}`);
  }

  return domains;
}

export function clearGaCookies() {
  if (typeof window === "undefined") {
    return;
  }

  const cookieNames = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  if (cookieNames.length === 0) {
    return;
  }

  const hostname = window.location.hostname;
  const domains = getCookieDomains(hostname);

  cookieNames.forEach((name) => {
    expireCookie(name);
    expireCookie(name, hostname);
    domains.forEach((domain) => expireCookie(name, domain));
  });
}
