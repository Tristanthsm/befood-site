import type { Metadata } from "next";
import Link from "next/link";
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

function toSpecialtyLabels(value: unknown[]): string[] {
  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object" && "label" in item) {
        const label = (item as { label?: unknown }).label;
        if (typeof label === "string") {
          return label.trim();
        }
      }

      return "";
    })
    .filter(Boolean);
}

export const metadata: Metadata = createPageMetadata({
  title: "Mon espace coach",
  description: "Dashboard coach BeFood avec les informations de votre profil partenaire.",
  path: "/espace-coach",
  noIndex: true,
});

export default async function CoachDashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const coach = await getCoachAccountSummary(user.id);

  if (!coach) {
    return (
      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
            <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">Profil coach introuvable</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Ton compte est connecté, mais aucun profil coach n&apos;est associé pour le moment.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/candidature-coachs"
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)]"
              >
                Faire une demande coach
              </Link>
              <Link
                href="/profil"
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]"
              >
                Retour au profil
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const specialtyLabels = toSpecialtyLabels(coach.specialties);
  const socials = coach.socials;
  const socialEntries = Object.entries(socials)
    .map(([key, value]) => [key, typeof value === "string" ? value.trim() : ""] as const)
    .filter(([, value]) => value.length > 0);

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-5xl">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_30px_90px_-46px_rgba(10,24,39,0.45)] sm:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">Espace coach</p>
            <h1 className="font-display text-3xl text-[var(--color-ink)]">Dashboard coach</h1>
            <p className="text-sm text-[var(--color-muted)]">
              Vue des informations que tu as renseignées dans ton profil coach.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Nom affiché</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{coach.businessName}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Titre</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{coach.title ?? "Non défini"}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Bio</p>
            <p className="mt-1 text-sm text-[var(--color-ink)]">{coach.bio ?? "Aucune bio renseignée."}</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Spécialités</p>
              {specialtyLabels.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {specialtyLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-ink)]">Aucune spécialité renseignée.</p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Réseaux et site</p>
              {socialEntries.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {socialEntries.map(([key, value]) => (
                    <li key={key} className="text-sm text-[var(--color-ink)]">
                      <span className="font-semibold capitalize">{key}</span>: {value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-ink)]">Aucun lien renseigné.</p>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Code coach</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{coach.inviteCode ?? "Non défini"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Dernière mise à jour</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{formatDate(coach.updatedAt)}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
