"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearAuthIntent, saveAuthIntent } from "@/lib/analytics/auth-intent";

type PendingAction = "google" | "password" | null;

interface SocialAuthCardProps {
  mode: "signin" | "signup";
  onSwitchMode?: (mode: "signin" | "signup") => void;
  onNavigate?: () => void;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5A9.5 9.5 0 0 0 2.5 12 9.5 9.5 0 0 0 12 21.5c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.9H12Z" />
      <path fill="#34A853" d="M3.6 7.6 6.8 10A6 6 0 0 1 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5A9.5 9.5 0 0 0 3.6 7.6Z" />
      <path fill="#4285F4" d="M12 21.5c2.5 0 4.7-.8 6.3-2.4l-2.9-2.3c-.8.6-1.9 1.2-3.4 1.2A6 6 0 0 1 6.8 14l-3.1 2.4A9.5 9.5 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M3.6 16.4A9.5 9.5 0 0 1 2.5 12c0-1.5.4-2.9 1.1-4.4L6.8 10a6.1 6.1 0 0 0 0 4l-3.2 2.4Z" />
    </svg>
  );
}

function mapCallbackError(rawError: string | null): string | null {
  if (!rawError) {
    return null;
  }

  if (rawError === "oauth_callback_failed") {
    return "La connexion OAuth n'a pas pu être finalisée.";
  }

  if (rawError === "oauth_provider_error") {
    return "Le fournisseur OAuth a renvoyé une erreur.";
  }

  if (rawError === "missing_code") {
    return "Le code de connexion est manquant.";
  }

  return "Une erreur de connexion est survenue.";
}

function getCanonicalOrigin(): string {
  const currentOrigin = window.location.origin;
  if (window.location.hostname === "befood.fr") {
    return currentOrigin.replace("://befood.fr", "://www.befood.fr");
  }

  return currentOrigin;
}

function getCallbackRedirect(): string {
  return `${getCanonicalOrigin()}/auth/callback`;
}

function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function resolveEmailForLogin(identifier: string): Promise<string> {
  const trimmedIdentifier = identifier.trim();
  if (isEmailLike(trimmedIdentifier)) {
    return trimmedIdentifier;
  }

  const response = await fetch("/api/auth/resolve-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier: trimmedIdentifier }),
  });

  const payload = (await response.json()) as { email?: string; message?: string };

  if (!response.ok || !payload.email) {
    throw new Error(payload.message ?? "Identifiant introuvable.");
  }

  return payload.email;
}

export function SocialAuthCard({ mode, onSwitchMode, onNavigate }: SocialAuthCardProps) {
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const callbackErrorMessage = useMemo(() => mapCallbackError(callbackError), [callbackError]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackError(params.get("error"));
  }, []);

  useEffect(() => {
    if (callbackError !== "oauth_callback_failed") {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (!cancelled && data.session) {
          window.location.assign("/");
        }
      } catch {
        // Keep default error handling if we cannot verify session state.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [callbackError]);

  useEffect(() => {
    if (callbackErrorMessage) {
      setErrorMessage(callbackErrorMessage);
      setSuccessMessage(null);
    }
  }, [callbackErrorMessage]);

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPendingAction("google");

    try {
      saveAuthIntent(isSignup ? "signup" : "signin", "google_oauth");
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getCallbackRedirect(),
        },
      });

      if (error) {
        clearAuthIntent();
        setErrorMessage(error.message);
      }
    } catch (error) {
      clearAuthIntent();
      setErrorMessage(error instanceof Error ? error.message : "Erreur de connexion.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setPendingAction("password");

    try {
      saveAuthIntent("signin", "password");
      const resolvedEmail = await resolveEmailForLogin(loginIdentifier);
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) {
        clearAuthIntent();
        setErrorMessage(error.message);
        return;
      }

      window.location.assign("/");
    } catch {
      clearAuthIntent();
      setErrorMessage("Configuration Supabase manquante côté site.");
    } finally {
      setPendingAction(null);
    }
  }

  const isBusy = pendingAction !== null;
  const isSignup = mode === "signup";
  const isSignin = mode === "signin";

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-[color:rgb(11_34_52_/14%)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.65)] sm:p-8">
      <div className="space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">Bienvenue</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">{isSignup ? "Créer un compte" : "Connexion"}</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {isSignup
            ? "Rejoignez BeFood en un clic avec votre compte Google."
            : "Accédez à votre espace BeFood avec Google ou avec votre identifiant coach."}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <GoogleIcon />
          {pendingAction === "google" ? "Connexion..." : `${isSignup ? "Créer un compte" : "Continuer"} avec Google`}
        </button>
      </div>

      {isSignin ? (
        <>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              ou identifiant coach
            </span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <form className="space-y-3" onSubmit={handlePasswordSignIn}>
            <label className="block space-y-1 text-sm font-medium text-[var(--color-ink)]">
              Identifiant ou e-mail
              <input
                type="text"
                name="login_identifier"
                autoComplete="username"
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                className="h-12 w-full rounded-full border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                placeholder="identifiant ou email"
                required
              />
            </label>
            <label className="block space-y-1 text-sm font-medium text-[var(--color-ink)]">
              Mot de passe
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-full border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isBusy}
              className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pendingAction === "password" ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 text-center text-sm text-[var(--color-muted)]">
        {isSignup ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}{" "}
        {onSwitchMode ? (
          <button
            type="button"
            onClick={() => onSwitchMode(isSignup ? "signin" : "signup")}
            className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline"
          >
            {isSignup ? "Se connecter" : "Créer un compte"}
          </button>
        ) : (
          <Link
            href={isSignup ? "/connexion" : "/inscription"}
            className="font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline"
          >
            {isSignup ? "Se connecter" : "Créer un compte"}
          </Link>
        )}
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-[var(--color-muted)]">
        En continuant, vous acceptez nos{" "}
        <Link
          href="/terms"
          onClick={onNavigate}
          className="font-semibold text-[var(--color-accent-strong)] underline-offset-3 hover:underline"
        >
          Conditions d&apos;utilisation
        </Link>
        {" "}et notre{" "}
        <Link
          href="/privacy"
          onClick={onNavigate}
          className="font-semibold text-[var(--color-accent-strong)] underline-offset-3 hover:underline"
        >
          Politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
