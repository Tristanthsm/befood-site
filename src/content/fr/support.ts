import type { SupportContent } from "@/lib/types";

export const supportContent: SupportContent = {
  title: "Support BeFood",
  description:
    "Une question sur votre compte, votre abonnement ou le coach ? Le support BeFood est là pour vous aider.",
  responseTime: "Nous répondons généralement sous 48h ouvrées.",
  contactHint: "Le canal support sera affiché ici après configuration finale.",
  faqTitle: "Questions fréquentes",
  faqItems: [
    {
      question: "Comment créer un compte ?",
      answer:
        "Téléchargez BeFood sur iPhone puis suivez l'onboarding intégré dans l'application.",
    },
    {
      question: "Comment fonctionne l'analyse des repas ?",
      answer:
        "Prenez une photo d'un repas dans l'app. L'IA identifie les éléments principaux et propose des repères nutritionnels compréhensibles.",
    },
    {
      question: "Comment lire les repères nutritionnels ?",
      answer:
        "Les repères sont pensés pour être pratiques: ils expliquent les points forts d'un repas et proposent des pistes d'amélioration progressives.",
    },
    {
      question: "Comment gérer mon abonnement premium ?",
      answer:
        "Les abonnements sont gérés par Apple via votre compte App Store. Ouvrez les réglages iOS > votre identifiant Apple > Abonnements.",
    },
    {
      question: "Comment signaler un bug ?",
      answer:
        "Décrivez précisément le problème, votre modèle d'iPhone et votre version iOS depuis le support in-app pour accélérer le diagnostic.",
    },
    {
      question: "Comment demander la suppression de mon compte ?",
      answer:
        "La procédure de suppression des données est disponible depuis le support in-app et la page Confidentialité.",
    },
    {
      question: "Où trouver les informations légales et de confidentialité ?",
      answer:
        "Consultez les pages Confidentialité et Conditions d'utilisation disponibles dans le footer du site.",
    },
  ],
};
