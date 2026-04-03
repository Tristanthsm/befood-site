"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

type CoachApplicationFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileType: string;
  legalStatus: string;
  activity: string;
  expertise: string;
  audience: string;
  motivation: string;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

interface CoachApplicationFormProps {
  destinationEmail: string;
  initialProfileType?: "coach" | "createur";
}

const initialState: CoachApplicationFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profileType: "",
  legalStatus: "",
  activity: "",
  expertise: "",
  audience: "",
  motivation: "",
};

export function CoachApplicationForm({ destinationEmail, initialProfileType }: CoachApplicationFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<CoachApplicationFormState>({
    ...initialState,
    profileType: initialProfileType ?? "",
  });
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionMessage, setSubmissionMessage] = useState<string>("");
  const [coachSpaceEnabled, setCoachSpaceEnabled] = useState(false);
  const isCoachProfile = formState.profileType === "coach";

  const canSubmit = useMemo(() => {
    return (
      formState.firstName.trim().length > 0
      && formState.lastName.trim().length > 0
      && formState.email.trim().length > 0
      && formState.profileType.trim().length > 0
      && formState.legalStatus.trim().length > 0
      && formState.activity.trim().length > 0
      && (!isCoachProfile || formState.expertise.trim().length > 0)
      && formState.motivation.trim().length > 0
    );
  }, [formState, isCoachProfile]);

  function setField<K extends keyof CoachApplicationFormState>(key: K, value: CoachApplicationFormState[K]) {
    setFormState((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || submissionState === "submitting") {
      return;
    }

    setSubmissionState("submitting");
    setSubmissionMessage("");
    setCoachSpaceEnabled(false);

    try {
      const response = await fetch("/api/coach-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = await response.json().catch(() => null) as { message?: string; coachSpaceEnabled?: boolean } | null;
      const responseMessage = payload?.message?.trim() ?? "";

      if (
        response.status === 409
        && (responseMessage.includes("déjà envoyé") || responseMessage.includes("déjà validée"))
      ) {
        router.replace("/espace-coach/candidature");
        return;
      }

      if (!response.ok) {
        throw new Error(responseMessage || "Envoi impossible pour le moment.");
      }

      setSubmissionState("success");
      const canOpenCoachSpace = payload?.coachSpaceEnabled === true;
      setCoachSpaceEnabled(canOpenCoachSpace);
      const successMessage = responseMessage
        || (canOpenCoachSpace
          ? "Candidature envoyée."
          : "Candidature envoyée. L'équipe BeFood vous recontactera après étude du profil.");
      setSubmissionMessage(successMessage);
      if (canOpenCoachSpace) {
        router.replace("/espace-coach/candidature");
        return;
      }
      setFormState({
        ...initialState,
        profileType: initialProfileType ?? "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Envoi impossible pour le moment.";
      setSubmissionState("error");
      setSubmissionMessage(message);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          Prénom
          <input
            type="text"
            name="firstName"
            required
            autoComplete="given-name"
            value={formState.firstName}
            onChange={(event) => setField("firstName", event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          Nom
          <input
            type="text"
            name="lastName"
            required
            autoComplete="family-name"
            value={formState.lastName}
            onChange={(event) => setField("lastName", event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={formState.email}
            onChange={(event) => setField("email", event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          Téléphone (optionnel)
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={formState.phone}
            onChange={(event) => setField("phone", event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
        Profil principal
        <select
          name="profileType"
          required
          value={formState.profileType}
          onChange={(event) => setField("profileType", event.target.value)}
          className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        >
          <option value="">Sélectionner</option>
          <option value="coach">Coach</option>
          <option value="createur">Créateur de contenu</option>
        </select>
      </label>

      {isCoachProfile ? (
        <p className="text-xs text-[var(--color-muted)]">
          Pour le parcours coach, un diplôme, une certification ou une qualification professionnelle cohérente est requis.
        </p>
      ) : null}

      <p className="text-xs text-[var(--color-muted)]">
        Ces informations serviront à préparer automatiquement votre contrat BeFood.
      </p>

      <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
        Statut juridique (contrat)
        <input
          type="text"
          name="legalStatus"
          required
          placeholder="Ex: professionnel indépendant"
          value={formState.legalStatus}
          onChange={(event) => setField("legalStatus", event.target.value)}
          className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
        Activité actuelle
        <textarea
          name="activity"
          required
          rows={4}
          placeholder="Décrivez votre activité et votre pratique d'accompagnement."
          value={formState.activity}
          onChange={(event) => setField("activity", event.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          {isCoachProfile ? "Diplôme / certification" : "Diplôme / expertise (optionnel)"}
          <input
            type="text"
            name="expertise"
            required={isCoachProfile}
            placeholder={
              isCoachProfile
                ? "Ex: BTS diététique, DE, certification reconnue..."
                : "Ex: thématiques, expérience, expertise..."
            }
            value={formState.expertise}
            onChange={(event) => setField("expertise", event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          Audience / communauté (optionnel)
          <input
            type="text"
            name="audience"
            placeholder="Ex: Instagram 15k, newsletter, communauté privée..."
            value={formState.audience}
            onChange={(event) => setField("audience", event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
        Pourquoi rejoindre BeFood ?
        <textarea
          name="motivation"
          required
          rows={5}
          placeholder="Expliquez la valeur que vous souhaitez apporter dans l'écosystème BeFood."
          value={formState.motivation}
          onChange={(event) => setField("motivation", event.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit || submissionState === "submitting"}
          className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
            canSubmit && submissionState !== "submitting"
              ? "bg-[var(--color-accent)] text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              : "cursor-not-allowed bg-[var(--color-border)] text-[var(--color-muted)]"
          }`}
        >
          {submissionState === "submitting" ? "Envoi en cours..." : "Envoyer ma candidature"}
        </button>
        <p className="text-xs text-[var(--color-muted)]">Adresse de destination: {destinationEmail}</p>
      </div>

      {submissionMessage ? (
        <p
          className={`text-sm ${
            submissionState === "success" ? "text-[var(--color-accent-strong)]" : "text-red-600"
          }`}
        >
          {submissionMessage}
        </p>
      ) : null}

      {submissionState === "success" && coachSpaceEnabled ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
          <p className="text-sm text-[var(--color-ink)]">Vous pouvez suivre votre avancement dans votre espace coach.</p>
          <div className="mt-2">
            <Link
              href="/espace-coach?tab=dossier"
              className="inline-flex items-center rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
            >
              Ouvrir mon espace coach
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
