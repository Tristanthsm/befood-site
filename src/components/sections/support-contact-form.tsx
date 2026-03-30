"use client";

import { type FormEvent, useMemo, useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountId: string;
  message: string;
};

interface SupportContactFormProps {
  supportEmail: string;
}

type SubmissionState = "idle" | "submitting" | "success" | "error";

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  accountId: "",
  message: "",
};

export function SupportContactForm({ supportEmail }: SupportContactFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");

  const canSubmit = useMemo(() => {
    return (
      formState.firstName.trim().length > 0
      && formState.lastName.trim().length > 0
      && formState.email.trim().length > 0
      && formState.message.trim().length > 0
    );
  }, [formState]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
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
      const response = await fetch("/api/support-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message || "Envoi impossible pour le moment.");
      }

      setSubmissionState("success");
      setSubmissionMessage("Demande envoyée. L'équipe BeFood vous répondra sous 48h ouvrées.");
      setFormState(initialState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Envoi impossible pour le moment.";
      setSubmissionState("error");
      setSubmissionMessage(message);
    }
  }

  return (
    <section aria-labelledby="contact-form-title" className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-5 sm:p-6">
      <div className="mb-5 space-y-2">
        <h2 id="contact-form-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
          Contacter l&apos;équipe BeFood
        </h2>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Si vous n&apos;avez pas trouvé votre réponse, envoyez-nous votre demande avec un maximum de contexte pour accélérer la résolution.
        </p>
      </div>

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
          ID compte (optionnel)
          <input
            type="text"
            name="accountId"
            placeholder="Ex: identifiant / email principal"
            value={formState.accountId}
            onChange={(event) => setField("accountId", event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          Message
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Décrivez votre besoin ou votre problème avec le plus de contexte possible."
            value={formState.message}
            onChange={(event) => setField("message", event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
              canSubmit && submissionState !== "submitting"
                ? "bg-[var(--color-accent)] text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                : "cursor-not-allowed bg-[var(--color-border)] text-[var(--color-muted)]"
            }`}
            disabled={!canSubmit || submissionState === "submitting"}
          >
            {submissionState === "submitting" ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
          <p className="text-xs text-[var(--color-muted)]">Adresse de destination: {supportEmail}</p>
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
    </section>
  );
}
