export type ContractWorkflowStatus = "none" | "to_prepare" | "sent" | "signed_pending_verification" | "verified";

function normalizeContractWorkflowStatus(value: unknown): ContractWorkflowStatus {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (
    normalized === "to_prepare"
    || normalized === "sent"
    || normalized === "signed_pending_verification"
    || normalized === "verified"
  ) {
    return normalized;
  }
  return "none";
}

export function resolveContractWorkflowStatus(input: {
  contractStatus: unknown;
  requestStatus: unknown;
}): ContractWorkflowStatus {
  const contractStatus = normalizeContractWorkflowStatus(input.contractStatus);
  if (contractStatus !== "none") {
    return contractStatus;
  }
  return normalizeContractWorkflowStatus(input.requestStatus);
}

export function getContractRecommendedAction(status: ContractWorkflowStatus): string {
  return getContractRecommendedActionWithContext(status);
}

export function getContractRecommendedActionWithContext(
  status: ContractWorkflowStatus,
  options?: { isContractMaterialReady?: boolean },
): string {
  const isContractMaterialReady = Boolean(options?.isContractMaterialReady);
  if (status === "to_prepare") {
    if (!isContractMaterialReady) {
      return "Préparer le contrat";
    }
    return "Marquer envoyé";
  }
  if (status === "sent") {
    return "Attendre signature coach";
  }
  if (status === "signed_pending_verification") {
    return "Vérifier signature";
  }
  if (status === "verified") {
    return "Aucune (contrat terminé)";
  }
  return "Préparer";
}

export function getContractRecommendedActionHint(status: ContractWorkflowStatus): string {
  return getContractRecommendedActionHintWithContext(status);
}

export function getContractRecommendedActionHintWithContext(
  status: ContractWorkflowStatus,
  options?: { isContractMaterialReady?: boolean },
): string {
  const isContractMaterialReady = Boolean(options?.isContractMaterialReady);
  if (status === "to_prepare") {
    if (!isContractMaterialReady) {
      return "Contrat non encore préparé. Action attendue: Préparer le contrat.";
    }
    return "Contrat prêt. Action attendue: Marquer envoyé.";
  }
  if (status === "sent") {
    return "Contrat envoyé. Attendre l'ouverture et la signature côté coach.";
  }
  if (status === "signed_pending_verification") {
    return "Signature reçue. Action attendue: Vérifier signature.";
  }
  if (status === "verified") {
    return "Contrat finalisé: aucune action supplémentaire requise.";
  }
  return "Contrat non préparé: action attendue Préparer.";
}

export function getAdminActionErrorMessage(code: string | null | undefined): string | null {
  const normalized = String(code ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized === "invalid_transition") {
    return "Transition invalide pour le statut actuel. Vérifiez l'action recommandée.";
  }
  if (normalized === "contract_not_prepared") {
    return "Le contrat doit être préparé avant l'envoi.";
  }
  if (normalized === "missing_contract_fields") {
    return "Champs contrat obligatoires manquants: nom prénom, statut, adresse, email, SIREN / SIRET.";
  }
  if (normalized === "unresolved_placeholders") {
    return "Le contrat contient encore des placeholders [ ... ].";
  }
  if (normalized === "contract_hash_mismatch") {
    return "Incohérence de preuve: le hash du contrat ne correspond pas au contenu figé.";
  }
  if (normalized === "already_verified") {
    return "Contrat déjà vérifié.";
  }
  if (normalized === "invalid_action") {
    return "Action non reconnue.";
  }
  if (normalized === "invalid_status") {
    return "Statut de dossier invalide.";
  }
  if (normalized === "invalid_form") {
    return "Formulaire invalide. Réessayez.";
  }
  if (normalized === "invalid_id") {
    return "Identifiant dossier invalide.";
  }
  if (normalized === "not_found") {
    return "Dossier introuvable.";
  }
  if (normalized === "update_failed") {
    return "Mise à jour impossible pour le moment. Réessayez.";
  }
  return null;
}
