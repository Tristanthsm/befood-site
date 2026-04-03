import type { AccessCard, CoachPageContent } from "@/lib/types";

export const coachPageContent: CoachPageContent = {
  heroBadge: "Écosystème BeFood",
  heroTitle: "Pourquoi les profils sélectionnés rendent BeFood plus utile",
  heroDescription:
    "BeFood n'est pas qu'une app d'analyse repas: c'est un écosystème avec repères concrets, progression durable et profils utiles intégrés à l'expérience.",
  heroUserLensTitle: "Ce que l'utilisateur gagne",
  heroUserLensDescription:
    "Des retours plus crédibles, des actions concrètes et une progression plus engageante dans la durée.",
  heroProfileLensTitle: "Ce que BeFood intègre",
  heroProfileLensDescription:
    "Coachs, experts, créateurs et profils affinitaires sont intégrés au produit, pas ajoutés en périphérie.",
  ecosystemTitle: "Pourquoi cela change l'expérience BeFood",
  ecosystemDescription:
    "Les profils sélectionnés rendent BeFood plus crédible, plus incarné et plus utile à chaque repas.",
  ecosystemItems: [
    {
      title: "Des décisions repas plus claires, plus vite",
      description:
        "L'analyse photo devient plus exploitable: vous savez quoi ajuster dès le repas suivant.",
    },
    {
      title: "Des conseils actionnables dans la vraie vie",
      description:
        "Les recommandations restent réalistes, applicables au quotidien et alignées avec vos objectifs.",
    },
    {
      title: "Une progression plus engageante et durable",
      description:
        "Contenu, accompagnement et communauté aident à tenir le cap sans logique punitive.",
    },
  ],
  eligibilityTitle: "Qui peut candidater ?",
  eligibilityDescription:
    "L'intégration n'est jamais automatique. BeFood sélectionne les profils selon leur cohérence et la valeur apportée à l'utilisateur.",
  eligibilityItems: [
    {
      title: "Coachs et praticiens",
      description:
        "Vous accompagnez déjà des personnes avec une pratique structurée et une méthode applicable au quotidien.",
    },
    {
      title: "Experts spécialisés",
      description:
        "Vous avez une spécialisation claire, une expertise reconnue et des repères fiables à transmettre.",
    },
    {
      title: "Créateurs et profils affinitaires",
      description:
        "Vous créez du contenu utile, fédérez une audience engagée et renforcez l'écosystème BeFood.",
    },
  ],
  finalCta: {
    title: "Présentez votre profil à BeFood",
    description:
      "Vous avez une expertise, une pratique d'accompagnement ou une audience engagée ? BeFood étudie chaque candidature pour intégrer des profils réellement utiles à l'expérience.",
    note: "Chaque candidature est étudiée avec attention.",
  },
};

export const connexionPageIntro = {
  title: "Connexion BeFood",
  description:
    "BeFood est d'abord une expérience mobile iOS. Cette page vous oriente vers le bon accès selon votre profil.",
};

export const connexionCards: AccessCard[] = [
  {
    title: "Utilisateurs BeFood",
    description:
      "Le suivi principal se fait dans l'app iPhone: analyse photo, repères nutritionnels et progression des habitudes.",
    ctaLabel: "Télécharger sur l'App Store",
    ctaHref: null,
  },
  {
    title: "Coachs et professionnels",
    description:
      "Si vous avez déjà un accès validé, utilisez votre lien de connexion. Sinon, candidatez pour présenter votre profil.",
    ctaLabel: "Candidater pour rejoindre BeFood",
    ctaHref: null,
  },
];
