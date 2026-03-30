import type { AccessCard, CoachPageContent } from "@/lib/types";

export const coachPageContent: CoachPageContent = {
  heroBadge: "Écosystème coachs & experts BeFood",
  heroTitle: "Qu'est-ce qu'un coach BeFood ?",
  heroDescription:
    "Un coach BeFood est un profil sélectionné qui rend l'accompagnement plus incarné dans l'app : repères concrets, compréhension des repas et progression durable.",
  heroUserLensTitle: "Pour les utilisateurs",
  heroUserLensDescription:
    "Retrouvez des profils que vous appréciez, gardez un cadre vivant entre deux séances et avancez avec plus de continuité.",
  heroProfileLensTitle: "Pour les coachs, créateurs et experts",
  heroProfileLensDescription:
    "BeFood ouvre une place réelle dans l'expérience produit aux profils retenus, avec une intégration pensée pour le quotidien utilisateur.",
  ecosystemTitle: "Pourquoi cela change l'expérience BeFood",
  ecosystemDescription:
    "BeFood n'ajoute pas des coachs en périphérie. Les profils sélectionnés font partie du produit pour aider les utilisateurs à mieux comprendre leurs habitudes et rester engagés dans le temps.",
  ecosystemItems: [
    {
      title: "Un accompagnement plus incarné",
      description:
        "L'utilisateur peut s'appuyer sur des profils reconnus plutôt que sur un parcours anonyme et impersonnel.",
    },
    {
      title: "Des repères qui restent concrets",
      description:
        "Conseils, interprétation et actions du quotidien restent alignés, même entre deux points de suivi.",
    },
    {
      title: "Une continuité de progression",
      description:
        "Moins de ruptures, plus de régularité: la progression devient plus lisible et plus durable.",
    },
  ],
  eligibilityTitle: "Qui peut rejoindre BeFood ?",
  eligibilityDescription:
    "L'intégration n'est jamais automatique. BeFood sélectionne les profils selon leur cohérence, leur qualité d'accompagnement et la valeur apportée à l'expérience utilisateur.",
  eligibilityItems: [
    {
      title: "Coachs et praticiens",
      description:
        "Vous accompagnez déjà des personnes avec une pratique structurée et une méthode applicable au quotidien.",
    },
    {
      title: "Experts spécialisés",
      description:
        "Vous avez un diplôme reconnu, une spécialisation claire ou une expertise solide dans votre domaine.",
    },
    {
      title: "Créateurs avec audience engagée",
      description:
        "Vous produisez des contenus utiles et fédérez une audience qualifiée autour de la nutrition et du bien-être.",
    },
  ],
  finalCta: {
    title: "Présentez votre profil à BeFood",
    description:
      "Vous avez une expertise, une pratique d'accompagnement ou une audience engagée ? BeFood étudie chaque candidature avec attention pour intégrer des profils cohérents avec son expérience utilisateur.",
    note: "Chaque candidature est étudiée avec attention avant validation. Si votre profil est retenu, l'équipe BeFood vous guide dans la bonne intégration.",
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
