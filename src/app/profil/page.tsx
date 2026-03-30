import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/seo";
import { getCoachAccountSummary } from "@/lib/supabase/coach-account";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Non disponible";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getProviders(providers: unknown): string {
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

export const metadata: Metadata = createPageMetadata({
  title: "Mon profil",
  description: "Informations de votre compte BeFood.",
  path: "/profil",
  noIndex: true,
});

export default async function ProfilPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const email = user.email ?? "Aucun e-mail";
  const providers = getProviders(user.app_metadata?.providers);
  const createdAt = formatDate(user.created_at);
  const lastSignInAt = formatDate(user.last_sign_in_at);
  const coachAccount = await getCoachAccountSummary(user.id);

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Mon compte</p>
            <h1 className="font-display text-3xl text-[var(--color-ink)]">Profil BeFood</h1>
            <p className="text-sm text-[var(--color-muted)]">
              Informations liées à votre session et à votre méthode de connexion.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">E-mail</p>
              <p className="mt-1 break-all text-sm font-semibold text-[var(--color-ink)]">{email}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Méthode de connexion</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{providers}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Compte créé le</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{createdAt}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Dernière connexion</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{lastSignInAt}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {coachAccount ? (
                <Link
                  href="/espace-coach"
                  className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-panel)]"
                >
                  Mon espace coach
                </Link>
              ) : null}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  Se déconnecter
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
