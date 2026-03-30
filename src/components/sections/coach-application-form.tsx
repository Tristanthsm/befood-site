"use client";

import { type FormEvent, useMemo, useState } from "react";

type CoachApplicationFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileType: string;
  activity: string;
  expertise: string;
  audience: string;
  motivation: string;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

interface CoachApplicationFormProps {
  destinationEmail: string;
}

const initialState: CoachApplicationFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profileType: "",
  activity: "",
  expertise: "",
  audience: "",
  motivation: "",
};

export function CoachApplicationForm({ destinationEmail }: CoachApplicationFormProps) {
  const [formState, setFormState] = useState<CoachApplicationFormState>(initialState);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionMessage, setSubmissionMessage] = useState<string>("");

  const canSubmit = useMemo(() => {
    return (
      formState.firstName.trim().length > 0
      && formState.lastName.trim().length > 0
      && formState.email.trim().length > 0
      && formState.profileType.trim().length > 0
      && formState.activity.trim().length > 0
      && formState.motivation.trim().length > 0
    );
  }, [formState]);

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

    try {
      const response = await fetch("/api/coach-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Envoi impossible pour le moment.");
      }

      setSubmissionState("success");
      setSubmissionMessage("Candidature envoyée. L'équipe BeFood vous recontactera après étude du profil.");
      setFormState(initialState);
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
          <option value="expert">Expert / praticien</option>
          <option value="createur">Créateur de contenu</option>
          <option value="autre">Autre profil</option>
        </select>
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
          Diplôme / expertise (optionnel)
          <input
            type="text"
            name="expertise"
            placeholder="Ex: diététique, nutrition sportive, coaching..."
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
    </form>
  );
}
