export type CoachSpaceTab = "dashboard" | "dossier";

export type CoachVisibleStatusKey =
  | "submitted"
  | "reviewing"
  | "changes_requested"
  | "contract_pending"
  | "profile_pending"
  | "active"
  | "rejected";

export type CoachVisibleTone = "neutral" | "warning" | "success" | "danger";

export interface CoachVisibleStatus {
  key: CoachVisibleStatusKey;
  label: string;
  tone: CoachVisibleTone;
}

export interface CoachOnboardingStep {
  id: "application" | "review" | "contract" | "profile" | "activation";
  title: string;
  description: string;
  done: boolean;
  current: boolean;
}

interface CoachStatusSource {
  status: string;
  isVerified: boolean;
}

interface CoachRequestStatusSource {
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "changes_requested"
    | "to_prepare"
    | "sent"
    | "signed_pending_verification"
    | "verified";
  coachMessage?: string | null;
}

function hasOneOf(value: string, candidates: string[]): boolean {
  return candidates.some((candidate) => value.includes(candidate));
}

function normalizeStatus(rawStatus: string | null | undefined): string {
  return String(rawStatus ?? "").trim().toLowerCase();
}

export function normalizeCoachTab(input: string | null | undefined, statusKey: CoachVisibleStatusKey): CoachSpaceTab {
  if (input === "dashboard" || input === "dossier") {
    return input;
  }

  return statusKey === "active" ? "dashboard" : "dossier";
}

export function getCoachVisibleStatus(
  coach: CoachStatusSource | null,
  coachRequest: CoachRequestStatusSource | null = null,
): CoachVisibleStatus {
  if (!coach && !coachRequest) {
    return {
      key: "submitted",
      label: "Candidature envoyée",
      tone: "neutral",
    };
  }

  if (coachRequest?.status === "rejected") {
    return {
      key: "rejected",
      label: "Non retenu",
      tone: "danger",
    };
  }

  if (coachRequest?.status === "pending" && !coach) {
    return {
      key: "reviewing",
      label: "En cours de validation",
      tone: "neutral",
    };
  }

  if (coachRequest?.status === "changes_requested") {
    return {
      key: "changes_requested",
      label: "Complément demandé",
      tone: "warning",
    };
  }

  if (
    (coachRequest?.status === "approved"
      || coachRequest?.status === "to_prepare"
      || coachRequest?.status === "sent"
      || coachRequest?.status === "signed_pending_verification")
    && !coach
  ) {
    return {
      key: "contract_pending",
      label: "Contrat à finaliser",
      tone: "warning",
    };
  }

  if (coachRequest?.status === "verified" && !coach) {
    return {
      key: "profile_pending",
      label: "Profil à finaliser",
      tone: "warning",
    };
  }

  if (!coach) {
    return {
      key: "reviewing",
      label: "En cours de validation",
      tone: "neutral",
    };
  }

  const status = normalizeStatus(coach.status);

  if (hasOneOf(status, ["reject", "declin", "refus", "not_retained"])) {
    return {
      key: "rejected",
      label: "Non retenu",
      tone: "danger",
    };
  }

  if (hasOneOf(status, ["active", "enabled", "live"]) && coach.isVerified) {
    return {
      key: "active",
      label: "Coach actif",
      tone: "success",
    };
  }

  if (hasOneOf(status, ["contract", "approved", "accept", "legal"])) {
    return {
      key: "contract_pending",
      label: "Contrat à finaliser",
      tone: "warning",
    };
  }

  if (hasOneOf(status, ["profile", "setup", "onboarding", "provision"])) {
    return {
      key: "profile_pending",
      label: "Profil à finaliser",
      tone: "warning",
    };
  }

  if (hasOneOf(status, ["submitted", "applied", "new", "candid"])) {
    return {
      key: "submitted",
      label: "Candidature envoyée",
      tone: "neutral",
    };
  }

  return {
    key: "reviewing",
    label: "En cours de validation",
    tone: "neutral",
  };
}

export function getStatusBadgeClass(tone: CoachVisibleTone): string {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (tone === "danger") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }
  return "border-[var(--color-border)] bg-white text-[var(--color-ink)]";
}

export function buildCoachOnboardingSteps(statusKey: CoachVisibleStatusKey): CoachOnboardingStep[] {
  const order: CoachOnboardingStep["id"][] = ["application", "review", "contract", "profile", "activation"];
  const indexByStatus: Record<CoachVisibleStatusKey, number> = {
    submitted: 0,
    reviewing: 1,
    changes_requested: 1,
    contract_pending: 2,
    profile_pending: 3,
    active: 4,
    rejected: 1,
  };
  const currentIndex = indexByStatus[statusKey];
  const isRejected = statusKey === "rejected";

  const labels: Record<CoachOnboardingStep["id"], { title: string; description: string }> = {
    application: {
      title: "Candidature",
      description: "Dossier initial envoyé depuis la page publique.",
    },
    review: {
      title: "Validation BeFood",
      description: "Revue humaine de votre dossier par l'équipe BeFood.",
    },
    contract: {
      title: "Contrat",
      description: "Étape contractuelle obligatoire avant l'activation.",
    },
    profile: {
      title: "Finalisation du profil",
      description: "Informations coach finalisées pour un lancement propre.",
    },
    activation: {
      title: "Activation coach",
      description: "Activation finale validée manuellement par BeFood.",
    },
  };

  return order.map((id, index) => {
    const done = isRejected ? index < 1 : index < currentIndex || (statusKey === "active" && index === currentIndex);
    const current = !isRejected && index === currentIndex && statusKey !== "active";

    return {
      id,
      title: labels[id].title,
      description: labels[id].description,
      done,
      current,
    };
  });
}

export function getCoachNextActions(
  statusKey: CoachVisibleStatusKey,
  inviteCode: string | null,
  coachMessage: string | null = null,
  contractStatus: "none" | "to_prepare" | "sent" | "signed_pending_verification" | "verified" = "none",
): string[] {
  if (statusKey === "submitted" || statusKey === "reviewing") {
    return [
      "Votre candidature a bien été envoyée et est en revue par BeFood.",
      "Nous vous contactons dès que la validation est terminée.",
    ];
  }

  if (statusKey === "changes_requested") {
    const actions = [
      "Votre dossier a été traité et nécessite une nouvelle candidature.",
      "Soumettez un nouveau dossier depuis la page candidature coach.",
    ];
    if (coachMessage) {
      actions.splice(1, 0, `Message BeFood: ${coachMessage.slice(0, 240)}.`);
    }
    return actions;
  }

  if (statusKey === "contract_pending") {
    if (contractStatus === "to_prepare") {
      return [
        "Le contrat est en préparation côté BeFood.",
        "Vous recevrez un document prêt à signer depuis cet espace.",
      ];
    }
    if (contractStatus === "sent") {
      return [
        "Le contrat est disponible et prêt à être signé.",
        "Ouvrez la section contrat et signez pour poursuivre l'onboarding.",
      ];
    }
    if (contractStatus === "signed_pending_verification") {
      return [
        "Votre signature a bien été reçue.",
        "BeFood vérifie la preuve avant passage à l'étape suivante.",
      ];
    }
    return [
      "Finaliser le contrat dans cette section.",
      "Une fois validé, vous passerez à la finalisation du profil.",
    ];
  }

  if (statusKey === "profile_pending") {
    return [
      "Compléter les éléments de profil demandés par BeFood.",
      "Attendre la validation finale d'activation par l'équipe.",
    ];
  }

  if (statusKey === "active") {
    return [
      "Votre onboarding est terminé.",
      inviteCode ? `Votre code d'invitation actif: ${inviteCode}.` : "Votre compte coach est actif.",
    ];
  }

  return [
    coachMessage?.slice(0, 240) ? `Message BeFood: ${coachMessage.slice(0, 240)}.` : "Votre candidature n'a pas été retenue à ce stade.",
    "Vous pouvez soumettre une nouvelle candidature quand vous êtes prêt.",
  ];
}
