import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

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

function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M16.6 12.7c0-2.2 1.8-3.3 1.9-3.4-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.8 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.3-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 2.9 2.3 1.1 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.3 0 2-.9 2.8-2.1.9-1.3 1.2-2.6 1.3-2.6-.1 0-2.2-.8-2.2-4.2ZM14.2 6c.6-.8 1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.9-1 3 1 .1 2-.5 2.7-1.4Z" />
    </svg>
  );
}

export const metadata: Metadata = createPageMetadata({
  title: "Connexion",
  description: "Page de connexion BeFood pour démarrer votre parcours ou retrouver votre compte.",
  path: "/connexion",
  noIndex: true,
});

export default function ConnexionPage() {
  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(16,185,129,0.12),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(15,23,42,0.10),transparent_35%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-md rounded-[2rem] border border-[color:rgb(11_34_52_/14%)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.65)] sm:p-8">
            <div className="space-y-1 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">Bienvenue</p>
              <h1 className="font-display text-4xl text-[var(--color-ink)]">Connexion</h1>
              <p className="text-sm text-[var(--color-muted)]">Accédez à votre espace BeFood en quelques secondes.</p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
              >
                <GoogleIcon />
                Continuer avec Google
              </button>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
              >
                <AppleIcon />
                Continuer avec Apple
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">ou par email</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <form className="space-y-3">
              <label className="block space-y-1 text-sm font-medium text-[var(--color-ink)]">
                E-mail
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="h-12 w-full rounded-full border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  placeholder="vous@exemple.com"
                />
              </label>
              <label className="block space-y-1 text-sm font-medium text-[var(--color-ink)]">
                Mot de passe
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-full border border-[var(--color-border)] bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  placeholder="••••••••"
                />
              </label>

              <div className="pt-1 text-right">
                <Link
                  href="/aide"
                  className="text-sm font-semibold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="button"
                className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
              >
                Se connecter
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-[var(--color-muted)]">
              En continuant, vous acceptez nos{" "}
              <Link
                href="/terms"
                className="font-semibold text-[var(--color-accent-strong)] underline-offset-3 hover:underline"
              >
                Conditions d&apos;utilisation
              </Link>
              {" "}et notre{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[var(--color-accent-strong)] underline-offset-3 hover:underline"
              >
                Politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Connexion", path: "/connexion" },
        ])}
      />
    </>
  );
}
