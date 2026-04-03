"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { useConsent } from "@/components/analytics/consent-provider";

export function CookieConsentBanner() {
  const {
    shouldShowBanner,
    preferencesOpen,
    analyticsAllowed,
    acceptAll,
    refuseAnalytics,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useConsent();
  const preferencesFormRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      {shouldShowBanner ? (
        <div className="fixed inset-0 z-[185] flex items-center justify-center bg-black/45 p-3 sm:p-5">
          <aside className="cookie-enter-up w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-xl sm:p-6">
            <div className="-mb-1 flex justify-center sm:-mb-0.5">
              <Image
                src="/images/mascots/cookies-hero-mascot.png"
                alt="Mascotte BeFood avec un cookie"
                width={108}
                height={108}
                sizes="108px"
                className="h-[5.8rem] w-[5.8rem] translate-y-2 object-contain sm:h-[6.4rem] sm:w-[6.4rem]"
                priority
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">Cookies</p>
              <h2 className="text-2xl font-semibold leading-tight text-[var(--color-ink)]">Paramètres de cookies</h2>
              <p className="text-sm leading-6 text-[var(--color-muted)] sm:text-base">
                Nous utilisons des cookies nécessaires pour faire fonctionner BeFood et, avec votre accord, des cookies de mesure d&apos;audience pour améliorer le site.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 sm:p-4">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-ink)] px-4 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={refuseAnalytics}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Refuser
                </button>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Personnaliser
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {preferencesOpen ? (
        <div className="fixed inset-0 z-[195] flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-4">
          <div className="relative w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-xl sm:p-6">
            <button
              type="button"
              onClick={closePreferences}
              aria-label="Fermer les préférences cookies"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-lg leading-none text-[var(--color-muted)] transition hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              ×
            </button>
            <p className="text-xl font-semibold leading-tight text-[var(--color-ink)]">Préférences cookies</p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
              Vous pouvez modifier votre choix à tout moment. Cette modale couvre uniquement les cookies et technologies similaires réellement utilisés sur BeFood.
            </p>

            <form
              ref={preferencesFormRef}
              className="mt-4 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = preferencesFormRef.current;
                if (!form) {
                  return;
                }

                const formData = new FormData(form);
                const analyticsEnabled = formData.get("analytics_enabled") === "on";
                savePreferences(analyticsEnabled);
              }}
            >
              <section className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">Cookies nécessaires</p>
                  <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-muted)]">
                    Toujours actifs
                  </span>
                </div>
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  Fonctionnement du site, sécurité, session/connexion et mémorisation du consentement.
                </p>
              </section>

              <section className="space-y-1.5 border-t border-[var(--color-border)] pt-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">Mesure d&apos;audience</p>
                    <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                      Mesure d&apos;audience pour comprendre la fréquentation du site, analyser les parcours et améliorer les pages et CTA via Google Analytics 4.
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">
                      Activé uniquement avec votre consentement. Par défaut, cette option reste désactivée tant que vous ne l&apos;activez pas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="analytics_enabled"
                    defaultChecked={analyticsAllowed}
                    aria-label="Activer la mesure d'audience"
                    className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                  />
                </div>
              </section>

              <section className="space-y-1.5 border-t border-[var(--color-border)] pt-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">Outils utilisés</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
                  <li>Google Analytics 4</li>
                  <li>Cookies et session du site</li>
                  <li>Consentement cookies</li>
                  <li>Vercel Analytics</li>
                  <li>Vercel Speed Insights</li>
                </ul>
                <p className="text-xs text-[var(--color-muted)]">
                  Implémentation actuelle: votre préférence “Mesure d&apos;audience” active ou désactive Google Analytics 4.
                </p>
              </section>

              <div className="border-t border-[var(--color-border)] pt-3 text-sm">
                <p className="font-medium text-[var(--color-ink)]">Liens utiles</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <Link
                    href="/cookies"
                    className="font-medium text-[var(--color-ink)] underline underline-offset-4 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  >
                    En savoir plus sur les cookies
                  </Link>
                  <Link
                    href="/confidentialite"
                    className="font-medium text-[var(--color-ink)] underline underline-offset-4 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  >
                    Politique de confidentialité
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[var(--color-border)] pt-3">
                <button
                  type="button"
                  onClick={() => savePreferences(true)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-ink)] px-4 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                >
                  Tout accepter
                </button>
                <button
                  type="button"
                  onClick={() => savePreferences(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Tout refuser
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Enregistrer mes préférences
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <style jsx global>{`
        @keyframes cookieModalEnterUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cookie-enter-up {
          animation: cookieModalEnterUp 340ms ease-out;
        }
      `}</style>
    </>
  );
}
