"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CookiePreferencesButton } from "@/components/analytics/cookie-preferences-button";
import { StartFreeModalTrigger } from "@/components/auth/start-free-modal-trigger";
import { Container } from "@/components/ui/container";
import { content } from "@/content";
import { footerLinks, siteConfig, storeLinks } from "@/lib/site-config";

export function Footer() {
  const pathname = usePathname();
  const isCoachSpace = pathname?.startsWith("/espace-coach") ?? false;

  if (isCoachSpace) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-[var(--color-border)] bg-[var(--color-dark)] py-14 text-white">
      <Container className="space-y-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <p className="font-display text-3xl">{content.siteCopy.brandName}</p>
            <p className="max-w-xl text-sm leading-6 text-white/75">{content.siteCopy.footerDescription}</p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="inline-flex text-sm font-semibold text-white/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              {siteConfig.contactEmail}
            </a>
          </div>

          <nav aria-label="Liens de pied de page" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                {link.label}
              </Link>
            ))}
            {storeLinks.appStore.status === "live" ? (
              <a
                href={storeLinks.appStore.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                App Store
              </a>
            ) : (
              <span className="text-sm font-semibold text-white/60">App Store (bientôt)</span>
            )}
            <StartFreeModalTrigger
              trackingId="start_free"
              trackingLocation="footer_links"
              className="inline-flex justify-start text-left text-sm font-semibold text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Se connecter / Créer un compte
            </StartFreeModalTrigger>
            <CookiePreferencesButton />
          </nav>
        </div>

        <p className="border-t border-white/15 pt-5 text-xs text-white/55">
          © {currentYear} {content.siteCopy.copyrightOwner}. Tous droits réservés.
        </p>
      </Container>
    </footer>
  );
}
