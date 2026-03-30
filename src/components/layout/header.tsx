import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import { StartFreeModalTrigger } from "@/components/auth/start-free-modal-trigger";
import { Container } from "@/components/ui/container";
import { mainNavigation } from "@/lib/site-config";
import type { CoachAccountSummary } from "@/lib/supabase/coach-account";
import { getCoachAccountSummary } from "@/lib/supabase/coach-account";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 12.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2Zm0 2.3c-4.8 0-8.8 2.7-10 6.7-.1.3.2.8.6.8h18.8c.4 0 .7-.4.6-.8-1.2-4-5.2-6.7-10-6.7Z" />
    </svg>
  );
}

function toProviderLabel(user: User): string {
  const providers = user.app_metadata?.providers;
  if (Array.isArray(providers) && providers.length > 0) {
    return providers
      .map((provider) => String(provider))
      .join(", ")
      .replace("google", "Google")
      .replace("apple", "Apple")
      .replace("email", "E-mail");
  }

  return "Non défini";
}

function AccountMenu({
  user,
  coachAccount,
  mobile = false,
}: {
  user: User;
  coachAccount: CoachAccountSummary | null;
  mobile?: boolean;
}) {
  const email = user.email ?? "Aucun e-mail";
  const providerLabel = toProviderLabel(user);
  const hasCoachAccess = Boolean(coachAccount);
  const coachStatus = coachAccount?.status ?? "pending";

  if (mobile) {
    return (
      <div className="mt-2 space-y-2 rounded-xl border border-[var(--color-border)] bg-white p-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Compte</p>
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{email}</p>
          <p className="text-xs text-[var(--color-muted)]">Connexion: {providerLabel}</p>
        </div>
        <Link
          href="/profil"
          className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
        >
          Mon profil
        </Link>
        {hasCoachAccess ? (
          <Link
            href="/espace-coach"
            className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
          >
            Mon espace coach
          </Link>
        ) : null}
        {hasCoachAccess ? (
          <p className="text-xs text-[var(--color-muted)]">Statut coach: {coachStatus}</p>
        ) : null}
      </div>
    );
  }

  return (
    <details className="relative">
      <summary className="inline-flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] marker:hidden transition hover:bg-[var(--color-panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
        <span className="sr-only">Ouvrir le menu compte</span>
        <UserIcon />
      </summary>
      <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[0_18px_40px_-26px_rgba(10,24,39,0.65)]">
        <div className="space-y-1 border-b border-[var(--color-border)] pb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Compte connecté</p>
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{email}</p>
          <p className="text-xs text-[var(--color-muted)]">Connexion: {providerLabel}</p>
        </div>
        <div className="mt-3 space-y-2">
          <Link
            href="/profil"
            className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
          >
            Mon profil
          </Link>
          {hasCoachAccess ? (
            <Link
              href="/espace-coach"
              className="block rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
            >
              Mon espace coach
            </Link>
          ) : null}
          {hasCoachAccess ? (
            <p className="px-1 text-xs text-[var(--color-muted)]">Statut coach: {coachStatus}</p>
          ) : null}
        </div>
      </div>
    </details>
  );
}

export async function Header() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const coachAccount = user ? await getCoachAccountSummary(user.id) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-[color:rgb(11_34_52_/8%)] bg-[color:rgb(233_242_238_/88%)] py-3 backdrop-blur-md">
      <Container>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-[color:rgb(11_34_52_/10%)] bg-[color:rgb(250_253_252_/92%)] px-4 py-2.5 shadow-[0_16px_34px_-28px_rgba(14,41,38,0.55)] sm:px-5">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <span className="font-display text-[1.85rem] font-extrabold leading-none tracking-[-0.025em]">
              <span className="text-[var(--color-ink)]">Be</span>
              <span className="text-[var(--color-accent-strong)]">Food</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-7 md:flex">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center md:flex">
            {user ? (
              <AccountMenu user={user} coachAccount={coachAccount} />
            ) : (
              <StartFreeModalTrigger
                className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(16,185,129,0.95)] transition hover:bg-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Démarrer gratuitement
              </StartFreeModalTrigger>
            )}
          </div>

          <details className="group relative md:hidden">
            <summary className="inline-flex h-10 min-w-20 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
              Menu
            </summary>
            <div className="absolute right-0 top-13 w-72 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-card)]">
              <nav aria-label="Navigation mobile" className="flex flex-col gap-2">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <AccountMenu user={user} coachAccount={coachAccount} mobile />
                ) : (
                  <StartFreeModalTrigger
                    className="mt-1 rounded-xl bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                  >
                    Démarrer gratuitement
                  </StartFreeModalTrigger>
                )}
              </nav>
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
