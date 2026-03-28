import type { SupportContent } from "@/lib/types";

export const supportContent: SupportContent = {
  title: "Aide BeFood",
  description:
    "Une question sur votre compte, votre abonnement ou votre expérience ? Notre équipe vous répond avec une aide claire et orientée solution.",
  responseTime: "Nous répondons généralement sous 48h ouvrées.",
  contactHint: "Canal principal: contact@befood.fr",
  faqTitle: "Questions fréquentes",
  faqItems: [
    {
      question: "Comment fonctionne l'analyse des repas ?",
      answer:
        "Ajoutez un repas et BeFood transforme cette information en repères simples pour vous aider à mieux comprendre vos choix au quotidien.",
    },
    {
      question: "Quels bénéfices concrets apporte BeFood ?",
      answer:
        "BeFood vous aide à progresser sans complexité: retours lisibles, recommandations actionnables et suivi régulier de vos habitudes.",
    },
    {
      question: "Comment gérer mon abonnement premium ?",
      answer:
        "La gestion de l'abonnement se fait depuis le store utilisé lors de la souscription (renouvellement, annulation et facturation).",
    },
    {
      question: "Comment signaler un bug ?",
      answer:
        "Envoyez un message détaillé via le formulaire d'aide: ce que vous faisiez, le résultat obtenu et, si possible, l'identifiant de compte.",
    },
    {
      question: "Comment demander la suppression de mon compte ?",
      answer:
        "Vous pouvez demander la suppression du compte et des données via le formulaire d'aide ou depuis les options prévues dans l'application.",
    },
    {
      question: "Où trouver les informations légales et de confidentialité ?",
      answer:
        "Les pages Confidentialité et Conditions d'utilisation sont disponibles en bas de page à tout moment.",
    },
  ],
};
