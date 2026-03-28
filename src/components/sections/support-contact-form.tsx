"use client";

import { useMemo, useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  appVersion: string;
  message: string;
  consent: boolean;
};

interface SupportContactFormProps {
  supportEmail: string;
}

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  appVersion: "",
  message: "",
  consent: false,
};

export function SupportContactForm({ supportEmail }: SupportContactFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);

  const canSubmit = useMemo(() => {
    return (
      formState.firstName.trim().length > 0
      && formState.lastName.trim().length > 0
      && formState.email.trim().length > 0
      && formState.subject.trim().length > 0
      && formState.message.trim().length > 0
      && formState.consent
    );
  }, [formState]);

  const mailtoHref = useMemo(() => {
    const lines = [
      `Prénom: ${formState.firstName.trim() || "-"}`,
      `Nom: ${formState.lastName.trim() || "-"}`,
      `Email: ${formState.email.trim() || "-"}`,
      `Téléphone: ${formState.phone.trim() || "-"}`,
      `Version de l'app: ${formState.appVersion.trim() || "-"}`,
      "",
      "Message:",
      formState.message.trim() || "-",
    ];
    const subject = formState.subject.trim() || "Demande support BeFood";
    return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }, [formState, supportEmail]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <section aria-labelledby="contact-form-title" className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-5 sm:p-6">
      <div className="mb-5 space-y-2">
        <h2 id="contact-form-title" className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
          Contacter le support
        </h2>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Décrivez votre demande, nous préparons votre email avec toutes les informations utiles.
        </p>
      </div>

      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
            Sujet
            <input
              type="text"
              name="subject"
              required
              value={formState.subject}
              onChange={(event) => setField("subject", event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
            Version de l&apos;app (optionnel)
            <input
              type="text"
              name="appVersion"
              placeholder="Ex: iOS 18.4 · BeFood 1.2.0"
              value={formState.appVersion}
              onChange={(event) => setField("appVersion", event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
          Message
          <textarea
            name="message"
            required
            rows={6}
            value={formState.message}
            onChange={(event) => setField("message", event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </label>

        <label className="flex items-start gap-2 text-sm leading-6 text-[var(--color-muted)]">
          <input
            type="checkbox"
            name="consent"
            checked={formState.consent}
            onChange={(event) => setField("consent", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          J&apos;accepte que ces informations soient utilisées pour traiter ma demande de support.
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={canSubmit ? mailtoHref : "#"}
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
              canSubmit
                ? "bg-[var(--color-accent)] text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                : "cursor-not-allowed bg-[var(--color-border)] text-[var(--color-muted)]"
            }`}
            aria-disabled={!canSubmit}
            onClick={(event) => {
              if (!canSubmit) {
                event.preventDefault();
              }
            }}
          >
            Préparer l&apos;email
          </a>
          <p className="text-xs text-[var(--color-muted)]">Adresse de destination: {supportEmail}</p>
        </div>
      </form>
    </section>
  );
}
