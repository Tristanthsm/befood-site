import type { SupportContent } from "@/lib/types";

export const supportContent: SupportContent = {
  title: "Besoin d'aide ?",
  description:
    "Compte, abonnement, bug, confidentialité ou suppression de compte : trouvez rapidement la bonne réponse ou contactez l'équipe BeFood.",
  responseTime: "Nous répondons généralement sous 48h ouvrées.",
  faqTitle: "Questions fréquentes",
  faqItems: [
    {
      question: "Je n'arrive pas à me connecter à mon compte",
      answer:
        "Vérifiez d'abord votre adresse email, puis lancez la réinitialisation du mot de passe. Si le problème continue, contactez l'équipe avec l'email utilisé pour votre compte.",
    },
    {
      question: "Comment gérer ou annuler mon abonnement Premium ?",
      answer:
        "La gestion de l'abonnement se fait depuis le store utilisé lors de la souscription. Ouvrez votre compte store pour annuler, modifier ou vérifier le renouvellement.",
    },
    {
      question: "Supprimer mon compte annule-t-il aussi mon abonnement ?",
      answer:
        "Non. La suppression du compte ou de l'app n'annule pas automatiquement l'abonnement. L'annulation doit être faite dans le store de paiement.",
    },
    {
      question: "Comment supprimer mon compte et mes données ?",
      answer:
        "Vous pouvez demander la suppression depuis l'app. Si vous n'y avez plus accès, contactez l'équipe via le formulaire d'aide avec votre email de compte.",
    },
    {
      question: "Comment signaler un bug ou un problème dans l'app ?",
      answer:
        "Décrivez précisément le contexte: action effectuée, comportement observé et moment du problème. Ajoutez votre identifiant de compte si possible.",
    },
    {
      question: "L'analyse des repas ne fonctionne pas comme prévu : que faire ?",
      answer:
        "Refaites un essai avec une photo nette ou une description plus complète. Si le résultat reste incohérent, envoyez un exemple via le formulaire d'aide.",
    },
    {
      question: "Je n'ai pas accès à Premium après paiement : que faire ?",
      answer:
        "Vérifiez d'abord le compte store utilisé au paiement. Si l'accès n'est toujours pas actif, contactez l'équipe avec le reçu ou la date d'achat.",
    },
    {
      question: "Où trouver la politique de confidentialité et les conditions d'utilisation ?",
      answer:
        "Les deux documents sont accessibles depuis le footer du site: Politique de confidentialité et Conditions d'utilisation.",
    },
    {
      question: "Comment contacter l'équipe BeFood ?",
      answer:
        "Utilisez le formulaire en bas de cette page. Donnez le plus de contexte possible pour accélérer le traitement de votre demande.",
    },
  ],
};
