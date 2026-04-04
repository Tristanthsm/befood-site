type AttributionPrimitive = string | number | boolean | null;

export interface AttributionContext {
  clickId: string | null;
  sessionId: string | null;
  source: string | null;
  ref: string | null;
  coachCode: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  updatedAt: string;
}

const ATTRIBUTION_CONTEXT_KEY = "bf_attribution_context_v1";
const ATTRIBUTION_CONTEXT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

function isBrowser() {
  return typeof window !== "undefined";
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseContext(raw: string | null): AttributionContext | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AttributionContext>;
    if (typeof parsed.updatedAt !== "string") {
      return null;
    }

    const updatedAtMs = Date.parse(parsed.updatedAt);
    if (!Number.isFinite(updatedAtMs) || Date.now() - updatedAtMs > ATTRIBUTION_CONTEXT_MAX_AGE_MS) {
      return null;
    }

    return {
      clickId: toNullableString(parsed.clickId),
      sessionId: toNullableString(parsed.sessionId),
      source: toNullableString(parsed.source),
      ref: toNullableString(parsed.ref),
      coachCode: toNullableString(parsed.coachCode),
      utmSource: toNullableString(parsed.utmSource),
      utmMedium: toNullableString(parsed.utmMedium),
      utmCampaign: toNullableString(parsed.utmCampaign),
      utmTerm: toNullableString(parsed.utmTerm),
      utmContent: toNullableString(parsed.utmContent),
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function readAttributionContext(): AttributionContext | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    return parseContext(window.localStorage.getItem(ATTRIBUTION_CONTEXT_KEY));
  } catch {
    return null;
  }
}

export function persistAttributionContext(input: Omit<AttributionContext, "updatedAt">) {
  if (!isBrowser()) {
    return;
  }

  const next: AttributionContext = {
    clickId: toNullableString(input.clickId),
    sessionId: toNullableString(input.sessionId),
    source: toNullableString(input.source),
    ref: toNullableString(input.ref),
    coachCode: toNullableString(input.coachCode),
    utmSource: toNullableString(input.utmSource),
    utmMedium: toNullableString(input.utmMedium),
    utmCampaign: toNullableString(input.utmCampaign),
    utmTerm: toNullableString(input.utmTerm),
    utmContent: toNullableString(input.utmContent),
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(ATTRIBUTION_CONTEXT_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures in strict privacy mode.
  }
}

export function getAttributionEventProperties(): Record<string, AttributionPrimitive> {
  const context = readAttributionContext();
  if (!context) {
    return {};
  }

  return {
    click_id: context.clickId,
    session_id: context.sessionId,
    source: context.source,
    ref: context.ref,
    coach_code: context.coachCode,
    utm_source: context.utmSource,
    utm_medium: context.utmMedium,
    utm_campaign: context.utmCampaign,
    utm_term: context.utmTerm,
    utm_content: context.utmContent,
  };
}

/**
 * Capture UTM params, ref, source, and coach_code from the current URL
 * and persist them into the attribution context.
 *
 * Does NOT overwrite click_id/session_id if they already exist (those are
 * set by the /join tracking flow only).
 *
 * Safe to call on any page load — only writes if the URL contains at least
 * one attribution parameter.
 */
export function captureAttributionFromUrl() {
  if (!isBrowser()) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = toNullableString(params.get("utm_source"));
  const utmMedium = toNullableString(params.get("utm_medium"));
  const utmCampaign = toNullableString(params.get("utm_campaign"));
  const utmTerm = toNullableString(params.get("utm_term"));
  const utmContent = toNullableString(params.get("utm_content"));
  const ref = toNullableString(params.get("ref"));
  const source = toNullableString(params.get("source"));
  const coachCode = toNullableString(params.get("coach_code"));

  const hasAnyParam = utmSource || utmMedium || utmCampaign || utmTerm || utmContent || ref || source || coachCode;
  if (!hasAnyParam) {
    return;
  }

  const existing = readAttributionContext();

  persistAttributionContext({
    clickId: existing?.clickId ?? null,
    sessionId: existing?.sessionId ?? null,
    source: source ?? existing?.source ?? null,
    ref: ref ?? existing?.ref ?? null,
    coachCode: coachCode ?? existing?.coachCode ?? null,
    utmSource: utmSource ?? existing?.utmSource ?? null,
    utmMedium: utmMedium ?? existing?.utmMedium ?? null,
    utmCampaign: utmCampaign ?? existing?.utmCampaign ?? null,
    utmTerm: utmTerm ?? existing?.utmTerm ?? null,
    utmContent: utmContent ?? existing?.utmContent ?? null,
  });
}
