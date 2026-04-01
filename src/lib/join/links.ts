import { APP_DEEP_LINK_BASE } from "@/lib/join/constants";
import { buildSearchParamsFromContext, type JoinQueryContext } from "@/lib/join/params";

function mergeQuery(baseUrl: string, params: URLSearchParams): string {
  if (!params.toString()) {
    return baseUrl;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${params.toString()}`;
}

export function buildAppDeepLink(
  context: JoinQueryContext,
  options: {
    clickId: string;
    sessionId: string;
    bridgeNonce: string | null;
  },
): string {
  const params = buildSearchParamsFromContext(context);
  params.set("click_id", options.clickId);
  params.set("session_id", options.sessionId);
  params.set("source", "web_join");

  if (options.bridgeNonce) {
    params.set("bridge_nonce", options.bridgeNonce);
  }

  return mergeQuery(APP_DEEP_LINK_BASE, params);
}
