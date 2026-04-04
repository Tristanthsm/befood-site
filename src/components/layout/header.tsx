import Link from "next/link";

import { AccountDropdown } from "@/components/layout/account-dropdown";
import { HeaderStartFreeCta } from "@/components/layout/header-start-free-cta";
import { HeaderShell } from "@/components/layout/header-shell";
import { getIsAdminForUserId } from "@/lib/admin/auth";
import { mainNavigation } from "@/lib/site-config";
import { getCoachAccountSummary } from "@/lib/supabase/coach-account";
import { getCoachRequestSummary } from "@/lib/supabase/coach-requests";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function toProviderLabel(appMetadata: unknown): string {
  if (!appMetadata || typeof appMetadata !== "object") {
    return "Non défini";
  }

  const providers = (appMetadata as { providers?: unknown }).providers;
  if (!Array.isArray(providers) || providers.length === 0) {
    return "Non défini";
  }

  return providers
    .map((provider) => String(provider))
    .join(", ")
    .replace("google", "Google")
    .replace("apple", "Apple")
    .replace("email", "E-mail");
}

export async function Header() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [coachAccount, coachRequest, isAdmin] = user
    ? await Promise.all([getCoachAccountSummary(user.id), getCoachRequestSummary(user.id), getIsAdminForUserId(user.id)])
    : [null, null, false];
  const hasCoachSpace = Boolean(coachAccount || coachRequest);
  const providerLabel = user ? toProviderLabel(user.app_metadata) : "Non défini";

  return (
    <HeaderShell>
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
        <Link
          href="/"
          className="inline-flex items-center justify-self-start rounded-lg px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          <span className="font-display text-[1.85rem] font-extrabold leading-none tracking-[-0.025em]">
            <span className="text-[var(--color-ink)]">Be</span>
            <span className="text-[var(--color-ink)]">Food</span>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center justify-self-center gap-2 md:flex md:-translate-x-7 lg:-translate-x-9"
        >
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold text-[var(--color-muted)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-[var(--color-ink)] hover:shadow-[0_10px_20px_-14px_rgba(10,24,39,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              <span className="relative">
                {item.label}
                <span className="pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full origin-center scale-x-0 rounded-full bg-[var(--color-accent-strong)] opacity-90 transition-transform duration-200 group-hover:scale-x-100" />
              </span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-self-end md:flex">
          {user ? (
            <AccountDropdown
              email={user.email ?? "Aucun e-mail"}
              providerLabel={providerLabel}
              showCoachLink={hasCoachSpace}
              showAdminLink={isAdmin}
            />
          ) : (
            <HeaderStartFreeCta
              trackingLocation="header_desktop"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-[linear-gradient(135deg,#1ad8ab,#0ea678_56%,#0b8f68)] px-4 py-2 text-sm font-bold text-white ring-1 ring-[rgba(16,185,129,0.5)] shadow-[0_16px_30px_-16px_rgba(16,185,129,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_22px_42px_-18px_rgba(16,185,129,1)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            />
          )}
        </div>

        <details className="group relative justify-self-end md:hidden">
          <summary className="inline-flex h-10 min-w-20 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
            Menu
          </summary>
          <div className="absolute right-0 top-13 w-72 rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-[var(--shadow-card)]">
            <nav aria-label="Navigation mobile" className="flex flex-col gap-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] hover:pl-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/profil"
                    className="mt-1 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                  >
                    Mon profil
                  </Link>
                  {hasCoachSpace ? (
                    <Link
                      href="/espace-coach"
                      className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                    >
                      Mon espace coach
                    </Link>
                  ) : null}
                  {isAdmin ? (
                    <>
                      <Link
                        href="/admin"
                        className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                      >
                        Espace admin
                      </Link>
                      <Link
                        href="/admin/conversion"
                        className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                      >
                        Conversion
                      </Link>
                    </>
                  ) : null}
                </>
              ) : (
                <HeaderStartFreeCta
                  trackingLocation="header_mobile"
                  className="group relative mt-1 inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1ad8ab,#0ea678_56%,#0b8f68)] px-3 py-2 text-sm font-bold text-white ring-1 ring-[rgba(16,185,129,0.5)] shadow-[0_14px_30px_-18px_rgba(16,185,129,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_20px_36px_-18px_rgba(16,185,129,1)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                />
              )}
            </nav>
          </div>
        </details>
      </div>
    </HeaderShell>
  );
}
