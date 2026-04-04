import posthog from "posthog-js";

const rawPosthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ?? "";
const rawPosthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? "";

let initialized = false;

type PosthogPrimitive = string | number | boolean | null;
type PosthogProperties = Record<string, PosthogPrimitive>;

function normalizeHost(host: string): string {
  if (!host) {
    return "";
  }

  const withoutTrailingSlash = host.replace(/\/+$/, "");
  const withProtocol =
    withoutTrailingSlash.startsWith("http://") || withoutTrailingSlash.startsWith("https://")
      ? withoutTrailingSlash
      : `https://${withoutTrailingSlash}`;
  return withProtocol
    .replace("://us.posthog.com", "://us.i.posthog.com")
    .replace("://eu.posthog.com", "://eu.i.posthog.com")
    .replace("://i.posthog.com", "://us.i.posthog.com");
}

function sanitizeProperties(properties: PosthogProperties): PosthogProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  ) as PosthogProperties;
}

export function hasPosthogConfig(): boolean {
  return rawPosthogKey.length > 0 && normalizeHost(rawPosthogHost).length > 0;
}

export function initializePosthogIfNeeded(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (initialized) {
    return true;
  }

  if (!hasPosthogConfig()) {
    return false;
  }

  posthog.init(rawPosthogKey, {
    api_host: normalizeHost(rawPosthogHost),
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    persistence: "localStorage+cookie",
  });

  initialized = true;
  return true;
}

export function setPosthogCaptureEnabled(enabled: boolean) {
  if (!initialized) {
    return;
  }

  if (enabled) {
    posthog.opt_in_capturing();
    return;
  }

  posthog.opt_out_capturing();
}

export function capturePosthogEvent(eventName: string, properties: PosthogProperties = {}) {
  if (!initialized || posthog.has_opted_out_capturing()) {
    return;
  }

  posthog.capture(eventName, sanitizeProperties(properties));
}

export function identifyPosthogUser(userId: string, properties: PosthogProperties = {}) {
  if (!initialized || posthog.has_opted_out_capturing()) {
    return;
  }

  posthog.identify(userId, sanitizeProperties(properties));
}

export function resetPosthogIdentity() {
  if (!initialized) {
    return;
  }

  posthog.reset(true);
}
