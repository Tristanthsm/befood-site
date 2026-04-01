export interface JoinQueryContext {
  coachCode: string | null;
  ref: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  queryString: string;
}

function cleanParam(value: string | null, maxLength: number): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

export function normalizeCoachCode(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned) {
    return null;
  }

  let suffix = "";
  if (cleaned.startsWith("BFCOACH")) {
    suffix = cleaned.slice(7, 13);
  } else if (cleaned.length === 6) {
    suffix = cleaned;
  } else {
    return null;
  }

  if (suffix.length !== 6) {
    return null;
  }

  return `BFCOACH-${suffix}`;
}

export function parseJoinContextFromSearchParams(searchParams: URLSearchParams): JoinQueryContext {
  const coachCode = normalizeCoachCode(searchParams.get("coach_code"));
  const ref = cleanParam(searchParams.get("ref"), 120);
  const utmSource = cleanParam(searchParams.get("utm_source"), 160);
  const utmMedium = cleanParam(searchParams.get("utm_medium"), 160);
  const utmCampaign = cleanParam(searchParams.get("utm_campaign"), 200);
  const utmTerm = cleanParam(searchParams.get("utm_term"), 200);
  const utmContent = cleanParam(searchParams.get("utm_content"), 200);

  return {
    coachCode,
    ref,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    queryString: searchParams.toString(),
  };
}

export function buildSearchParamsFromContext(context: JoinQueryContext): URLSearchParams {
  const params = new URLSearchParams();

  if (context.coachCode) params.set("coach_code", context.coachCode);
  if (context.ref) params.set("ref", context.ref);
  if (context.utmSource) params.set("utm_source", context.utmSource);
  if (context.utmMedium) params.set("utm_medium", context.utmMedium);
  if (context.utmCampaign) params.set("utm_campaign", context.utmCampaign);
  if (context.utmTerm) params.set("utm_term", context.utmTerm);
  if (context.utmContent) params.set("utm_content", context.utmContent);

  return params;
}

export function toUrlSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.set(key, value);
      return;
    }

    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
      params.set(key, value[0]);
    }
  });

  return params;
}
