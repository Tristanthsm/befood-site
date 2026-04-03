import "server-only";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const INTERNAL_CONTRACT_VERSION = "befood_internal_coach_contract_v2";
export const DEFAULT_COACH_LEGAL_STATUS = "professionnel indépendant";
export const DEFAULT_COACH_LEGAL_ADDRESS = "adresse non renseignée";
export const DEFAULT_COACH_LEGAL_REGISTRATION = "non renseigné à la date de signature";
export type ContractRegistrationStatus = "provided" | "pending_creation";
export const DEFAULT_COACH_CONTRACT_TEMPLATE = `CONTRAT DE COLLABORATION COACH INDÉPENDANT – BEFOOD

Version V1

Entre les soussignés

Monsieur Tristan Thomas, entrepreneur individuel exerçant sous le régime de la micro-entreprise sous le nom commercial BeFood, ci-après dénommé « BeFood », domicilié au 134 rue d’Eschérange, 57440 Angevillers, France, immatriculé sous le numéro SIREN 941092744 et SIRET 94109274400015.

ET

Le Coach, [Nom Prénom], [statut], domicilié à [adresse], immatriculé sous le numéro [SIREN / SIRET], adresse email : [email],
ci-après dénommé « le Coach ».
ensemble dénommés les « Parties ».

Article 1 – Objet

Le présent contrat a pour objet de définir les conditions dans lesquelles le Coach collabore avec BeFood au sein de l’application et de l’écosystème BeFood, notamment pour être référencé comme coach, être rattaché à des clients, et percevoir une rémunération sous forme de commission.

Article 2 – Nature de la relation

Le Coach intervient en qualité de professionnel indépendant.

Le présent contrat ne constitue en aucun cas :

un contrat de travail,
une relation salariale,
un lien de subordination juridique permanent,
ni une société commune entre les Parties.

Le Coach reste seul responsable de ses obligations fiscales, sociales, comptables et administratives.

Article 3 – Activation

La signature du présent contrat ne vaut pas activation automatique immédiate du Coach sur BeFood.

L’activation effective du Coach reste soumise à la validation finale de BeFood.

Article 4 – Définitions
4.1 Client Actif

Un Client Actif désigne un utilisateur :

disposant d’un abonnement BeFood payant en cours sur la période considérée,
dont l’abonnement a été effectivement encaissé par BeFood,
et rattaché à un Coach au sens du présent contrat.
4.2 Client Apporté

Un Client Apporté désigne un Client Actif attribué au Coach :

soit via le lien tracké du Coach,
soit via la saisie du code coach du Coach avant souscription.
4.3 Client Marketplace

Un Client Marketplace désigne un Client Actif :

non acquis via le lien ou le code du Coach,
mais rattaché au Coach via la bibliothèque / marketplace BeFood.
Article 5 – Rémunération

La rémunération du Coach prend la forme de commissions calculées sur le chiffre d’affaires hors taxes réellement encaissé par BeFood au titre des abonnements des Clients Actifs rattachés au Coach.

Aucune commission n’est due sur :

les montants non encaissés,
les remboursements,
les impayés,
les fraudes,
les rétrofacturations,
les annulations.
5.1 Commissions sur les Clients Apportés

Pour les Clients Apportés, la commission du Coach est fixée comme suit :

20 % du chiffre d’affaires HT encaissé lorsque le Coach compte de 1 à 20 Clients Actifs Apportés sur le mois concerné ;
25 % du chiffre d’affaires HT encaissé lorsque le Coach compte de 21 à 50 Clients Actifs Apportés sur le mois concerné ;
30 % du chiffre d’affaires HT encaissé lorsque le Coach compte plus de 50 Clients Actifs Apportés sur le mois concerné.
5.2 Commissions sur les Clients Marketplace

Pour les Clients Marketplace, la commission du Coach est fixée à 15 % du chiffre d’affaires HT réellement encaissé par BeFood au titre des abonnements des Clients Actifs rattachés au Coach.

Article 6 – Règles de calcul mensuel

Les commissions sont calculées mois par mois.

En cas de changement de coach en cours de mois :

la commission du mois concerné reste acquise au coach auquel le client était rattaché au premier jour du mois ;
le nouveau rattachement ne produit effet pour la commission qu’à compter du premier jour du mois suivant.

Un client ne peut ouvrir droit à commission que pour un seul coach à la fois au titre d’un même mois.

Article 7 – Relevé, facture et paiement

BeFood met à disposition du Coach un relevé mensuel récapitulant les éléments de calcul de sa commission.

Le Coach émet ensuite une facture conforme.

Sauf accord contraire :

la facture doit être transmise avant le 5 du mois suivant ;
BeFood règle les sommes dues le 15 du mois ;
et, en tout état de cause, dans un délai maximum de 30 jours à compter de la réception de la facture.

En cas de retard de paiement, les pénalités légales de retard ainsi que l’indemnité forfaitaire légale pour frais de recouvrement de 40 euros seront applicables.

Article 8 – Données et accès du Coach

Dans le cadre du présent contrat, le Coach n’a accès qu’à des statistiques agrégées ou anonymisées, notamment :

nombre de clics,
volumes de clients,
indicateurs de performance globaux.

Le Coach n’a pas accès, via les outils standards BeFood, à des utilisateurs identifiables ni à des données personnelles telles que nom, prénom, adresse email, téléphone, adresse IP, identifiant individuel ou donnée de santé. La CNIL rappelle qu’une adresse email, une IP ou un identifiant de connexion constituent des données personnelles, tandis que des données réellement anonymisées de manière irréversible n’en sont plus.

Le Coach s’interdit :

de tenter d’identifier des utilisateurs à partir des statistiques mises à disposition ;
de croiser les données BeFood avec d’autres données pour réidentifier une personne ;
d’utiliser les données de BeFood en dehors de ce qui est expressément autorisé.

Si, à l’avenir, BeFood confie au Coach l’accès à des données personnelles identifiables, un encadrement contractuel complémentaire devra être mis en place avant toute ouverture d’accès.

Article 9 – Confidentialité

Chaque Partie s’engage à conserver confidentielles les informations non publiques obtenues dans le cadre du présent contrat, notamment les informations commerciales, financières, techniques, contractuelles et opérationnelles.

Cette obligation survivra pendant 5 ans après la fin du contrat.

Article 10 – Signature électronique et preuve

Le présent contrat peut être signé électroniquement.

Les Parties reconnaissent que BeFood peut conserver à titre de preuve :

la version du contrat présentée à la signature,
son hash ou empreinte,
la date et l’heure de signature,
l’adresse IP,
le user agent,
l’adresse email du signataire,
le mode de signature,
les journaux d’audit relatifs à la préparation, l’envoi, l’ouverture, la signature et la vérification.

Ces éléments pourront être produits à titre de preuve entre les Parties. L’article 1367 du Code civil prévoit qu’une signature électronique repose sur un procédé fiable d’identification garantissant son lien avec l’acte.

Article 11 – Durée et résiliation

Le présent contrat est conclu pour une durée indéterminée à compter de sa signature.

Chaque Partie peut y mettre fin à tout moment moyennant un préavis écrit de 30 jours calendaires.

En cas de manquement grave, fraude, fausse déclaration, atteinte à l’image de BeFood, non-respect des obligations contractuelles ou incident de sécurité majeur, BeFood pourra résilier le contrat avec effet immédiat.

Les commissions déjà acquises avant la date d’effet de la résiliation restent dues dans les conditions du présent contrat.

Article 12 – Droit applicable et juridiction compétente

Le présent contrat est soumis au droit français.

En cas de litige, les Parties rechercheront d’abord une solution amiable.

À défaut d’accord amiable, compétence expresse est attribuée aux tribunaux compétents dans le ressort du domicile professionnel de Tristan Thomas, sous réserve des règles impératives applicables.`;

export type ContractLifecycleStatus = "none" | "to_prepare" | "sent" | "signed_pending_verification" | "verified";
export type ContractSignatureType = "typed" | "drawn";
export type ContractEventType = "prepared" | "sent" | "opened" | "signed" | "verified";
export type ContractEventSource = "admin" | "coach" | "system";

export const CONTRACT_CONSENT_TEXT =
  "Je reconnais avoir lu l’intégralité du contrat, j’accepte ses conditions et je signe électroniquement ce document.";

function cleanText(value: unknown, maxLength = 2000): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

function replaceContractPlaceholder(template: string, placeholder: string, value: string): string {
  return template.split(placeholder).join(value);
}

function cleanTemplateText(value: unknown, maxLength = 80_000): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

export function getMissingRequiredContractFields(input: {
  coachFullName: string | null | undefined;
  coachEmail: string | null | undefined;
  coachStatus: string | null | undefined;
  coachAddress: string | null | undefined;
  coachRegistration: string | null | undefined;
  coachRegistrationStatus?: ContractRegistrationStatus | null | undefined;
}): string[] {
  const missing: string[] = [];
  if (!cleanText(input.coachFullName, 250)) {
    missing.push("nom prénom");
  }
  if (!cleanText(input.coachEmail, 320)) {
    missing.push("email");
  }
  if (!cleanText(input.coachStatus, 250)) {
    missing.push("statut");
  }
  if (!cleanText(input.coachAddress, 500)) {
    missing.push("adresse");
  }
  const registrationStatus = normalizeContractRegistrationStatus(input.coachRegistrationStatus, input.coachRegistration);
  const registrationValue = cleanText(input.coachRegistration, 250);
  if (registrationStatus !== "provided" || !registrationValue) {
    missing.push("SIREN / SIRET");
  }
  return missing;
}

export function normalizeContractRegistrationStatus(
  value: unknown,
  registrationValue?: string | null | undefined,
): ContractRegistrationStatus {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "provided" || normalized === "pending_creation") {
    return normalized;
  }
  return cleanText(registrationValue, 250) ? "provided" : "pending_creation";
}

export function hasUnresolvedContractPlaceholders(text: string | null | undefined): boolean {
  if (!text) {
    return false;
  }
  return /\[[^\]\n]{1,120}\]/.test(text);
}

function isMissingRelationError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("relation") || normalized.includes("column");
}

export function normalizeContractLifecycleStatus(value: unknown): ContractLifecycleStatus {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "to_prepare" || normalized === "sent" || normalized === "signed_pending_verification" || normalized === "verified") {
    return normalized;
  }
  return "none";
}

export function buildCoachInternalContractText(input: {
  coachFullName: string;
  coachEmail: string;
  generatedAtIso: string;
  coachStatus?: string;
  coachAddress?: string;
  coachRegistration?: string;
  templateText?: string;
}): string {
  const coachFullName = cleanText(input.coachFullName, 250) ?? "Coach partenaire";
  const coachEmail = cleanText(input.coachEmail, 320) ?? "email-non-renseigne";
  const coachStatus = cleanText(input.coachStatus, 250) ?? DEFAULT_COACH_LEGAL_STATUS;
  const coachAddress = cleanText(input.coachAddress, 500) ?? DEFAULT_COACH_LEGAL_ADDRESS;
  const coachRegistration = cleanText(input.coachRegistration, 250) ?? DEFAULT_COACH_LEGAL_REGISTRATION;
  const generatedAtIso = cleanText(input.generatedAtIso, 64) ?? new Date().toISOString();
  const rawTemplate = cleanTemplateText(input.templateText) ?? DEFAULT_COACH_CONTRACT_TEMPLATE;

  const withCoachName = replaceContractPlaceholder(rawTemplate, "[Nom Prénom]", coachFullName);
  const withCoachStatus = replaceContractPlaceholder(withCoachName, "[statut]", coachStatus);
  const withCoachAddress = replaceContractPlaceholder(withCoachStatus, "[adresse]", coachAddress);
  const withCoachRegistration = replaceContractPlaceholder(withCoachAddress, "[SIREN / SIRET]", coachRegistration);
  const withCoachEmail = replaceContractPlaceholder(withCoachRegistration, "[email]", coachEmail);
  const withGenerationDate = replaceContractPlaceholder(withCoachEmail, "[date_generation]", generatedAtIso);

  return withGenerationDate;
}

export async function sha256Hex(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildContractDocumentAndHash(input: {
  coachFullName: string;
  coachEmail: string;
  generatedAtIso?: string;
  coachStatus?: string;
  coachAddress?: string;
  coachRegistration?: string;
  contractTemplateText?: string;
}): Promise<{ contractText: string; contentHash: string; version: string }> {
  const generatedAtIso = input.generatedAtIso ?? new Date().toISOString();
  const contractText = buildCoachInternalContractText({
    coachFullName: input.coachFullName,
    coachEmail: input.coachEmail,
    coachStatus: input.coachStatus,
    coachAddress: input.coachAddress,
    coachRegistration: input.coachRegistration,
    templateText: input.contractTemplateText,
    generatedAtIso,
  });
  const contentHash = await sha256Hex(contractText);

  return {
    contractText,
    contentHash,
    version: INTERNAL_CONTRACT_VERSION,
  };
}

export async function appendContractEvent(input: {
  requestId: string;
  eventType: ContractEventType;
  eventSource: ContractEventSource;
  actorUserId: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const serviceRole = getSupabaseServiceRoleClient();
  const { error } = await serviceRole
    .from("coach_request_contract_events")
    .insert({
      coach_request_id: input.requestId,
      event_type: input.eventType,
      event_source: input.eventSource,
      actor_user_id: input.actorUserId,
      payload: input.payload ?? {},
    });

  if (error && isMissingRelationError(error.message)) {
    return;
  }
  if (error) {
    throw new Error(error.message);
  }
}

export async function appendContractOpenedEventIfNeeded(input: {
  requestId: string;
  actorUserId: string | null;
  dedupeMinutes?: number;
}): Promise<void> {
  const dedupeMinutes = input.dedupeMinutes ?? 30;
  const serviceRole = getSupabaseServiceRoleClient();
  const sinceIso = new Date(Date.now() - dedupeMinutes * 60_000).toISOString();

  const check = await serviceRole
    .from("coach_request_contract_events")
    .select("id")
    .eq("coach_request_id", input.requestId)
    .eq("event_type", "opened")
    .eq("event_source", "coach")
    .gte("occurred_at", sinceIso)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (check.error && isMissingRelationError(check.error.message)) {
    return;
  }
  if (check.error) {
    throw new Error(check.error.message);
  }
  if (check.data?.id) {
    return;
  }

  await appendContractEvent({
    requestId: input.requestId,
    eventType: "opened",
    eventSource: "coach",
    actorUserId: input.actorUserId,
  });
}

export function getClientIpFromHeaders(headers: Headers): string | null {
  const forwarded = cleanText(headers.get("x-forwarded-for"), 250);
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim() ?? "";
    if (first) {
      return first.slice(0, 100);
    }
  }

  const direct =
    cleanText(headers.get("cf-connecting-ip"), 100)
    ?? cleanText(headers.get("x-real-ip"), 100)
    ?? cleanText(headers.get("x-client-ip"), 100);

  return direct;
}

export function buildContractSignatureSnapshot(input: {
  requestId: string;
  coachUserId: string;
  coachFullName: string;
  coachEmail: string;
  signatureType: ContractSignatureType;
  signatureValue: string;
  signedAtIso: string;
  signedIp: string | null;
  signedUserAgent: string | null;
  contractText: string;
  contractContentHash: string;
}): Record<string, unknown> {
  return {
    version: INTERNAL_CONTRACT_VERSION,
    requestId: input.requestId,
    coachUserId: input.coachUserId,
    coachFullName: input.coachFullName,
    coachEmail: input.coachEmail,
    signatureType: input.signatureType,
    signatureValue: input.signatureValue,
    signedAt: input.signedAtIso,
    signedIp: input.signedIp,
    signedUserAgent: input.signedUserAgent,
    consentText: CONTRACT_CONSENT_TEXT,
    contract: {
      content: input.contractText,
      contentHash: input.contractContentHash,
    },
  };
}

export function getInitialContractStatusFromCoachRequestStatus(status: string): ContractLifecycleStatus {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "to_prepare") {
    return "to_prepare";
  }
  if (normalized === "sent") {
    return "sent";
  }
  if (normalized === "signed_pending_verification") {
    return "signed_pending_verification";
  }
  if (normalized === "verified") {
    return "verified";
  }
  return "none";
}
