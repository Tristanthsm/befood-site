export type AuthIntentMode = "signup" | "signin";

interface AuthIntentState {
  mode: AuthIntentMode;
  method: "google_oauth" | "password";
  sourcePath: string;
  createdAt: string;
}

const AUTH_INTENT_KEY = "bf_auth_intent_v1";
const AUTH_INTENT_MAX_AGE_MS = 1000 * 60 * 30;

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredIntent(): AuthIntentState | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_INTENT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthIntentState>;
    if (
      (parsed.mode !== "signup" && parsed.mode !== "signin")
      || (parsed.method !== "google_oauth" && parsed.method !== "password")
      || typeof parsed.createdAt !== "string"
      || typeof parsed.sourcePath !== "string"
    ) {
      return null;
    }

    const createdAtMs = Date.parse(parsed.createdAt);
    if (!Number.isFinite(createdAtMs) || Date.now() - createdAtMs > AUTH_INTENT_MAX_AGE_MS) {
      return null;
    }

    return {
      mode: parsed.mode,
      method: parsed.method,
      sourcePath: parsed.sourcePath,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export function saveAuthIntent(mode: AuthIntentMode, method: "google_oauth" | "password") {
  if (!isBrowser()) {
    return;
  }

  const payload: AuthIntentState = {
    mode,
    method,
    sourcePath: window.location.pathname || "/",
    createdAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage issues in strict privacy mode.
  }
}

export function clearAuthIntent() {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_INTENT_KEY);
  } catch {
    // Ignore storage issues in strict privacy mode.
  }
}

export function consumeAuthIntent(): AuthIntentState | null {
  const intent = readStoredIntent();
  clearAuthIntent();
  return intent;
}
