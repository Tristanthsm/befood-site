import type { AccessCard, CoachPageContent } from "@/lib/types";

export const coachPageContent: CoachPageContent = {
  heroBadge: "Espace professionnels",
  heroTitle: "Développez un accompagnement nutritionnel qui tient entre les séances",
  heroDescription:
    "BeFood transforme les repas du quotidien en décisions actionnables. Vous structurez mieux votre suivi, vos clients appliquent plus facilement, et la progression devient visible semaine après semaine.",
  heroCoachImpactTitle: "Ce que ça change pour les coachs",
  heroCoachImpactPoints: [
    "Moins de flou entre deux séances, plus de matière utile à analyser.",
    "Des retours plus concrets pour personnaliser vos recommandations.",
    "Un suivi continu qui renforce votre valeur d'accompagnement.",
  ],
  heroClientImpactTitle: "Ce que ça change pour les personnes accompagnées",
  heroClientImpactPoints: [
    "Des repères clairs au quotidien, sans surcharge ni culpabilité.",
    "Une meilleure compréhension de leurs choix alimentaires réels.",
    "Plus de régularité grâce à des micro-ajustements simples.",
  ],
  valueTitle: "Pourquoi les coachs adoptent BeFood",
  valueItems: [
    {
      title: "Transformer le savoir en actions",
      description: "Vos recommandations deviennent des gestes concrets appliqués repas après repas.",
    },
    {
      title: "Mieux piloter la progression",
      description: "Vous visualisez les tendances réelles et ajustez rapidement avant que la motivation chute.",
    },
    {
      title: "Renforcer la relation coach-client",
      description: "Le suivi reste vivant entre les séances, ce qui améliore l'adhésion et la confiance.",
    },
  ],
  useCasesTitle: "Cas d'usage concrets",
  useCases: [
    {
      title: "Suivi nutritionnel premium",
      description: "Exploiter les repas capturés pour détecter rapidement les blocages et prioriser les bons ajustements.",
    },
    {
      title: "Parcours anti-abandon",
      description: "Mettre en place un cadre simple pour éviter le cycle \"je recommence\" et sécuriser la constance.",
    },
    {
      title: "Accompagnement hybride efficace",
      description: "Combiner vos séances et un soutien quotidien via l'app iOS pour garder l'élan.",
    },
  ],
  processTitle: "Comment démarrer",
  processSteps: [
    {
      title: "1. Demander un accès professionnel",
      description: "Vous nous partagez votre profil et votre contexte d'accompagnement.",
    },
    {
      title: "2. Validation et onboarding",
      description: "L'équipe BeFood confirme l'accès puis vous guide sur la prise en main.",
    },
    {
      title: "3. Lancer vos premiers suivis",
      description: "Vous utilisez BeFood comme extension de votre relation coach-client.",
    },
  ],
  faqTitle: "FAQ pros",
  faqItems: [
    {
      question: "BeFood remplace-t-elle un suivi humain ?",
      answer:
        "Non. BeFood complète votre accompagnement en apportant de la clarté entre les échanges, sans remplacer votre expertise.",
    },
    {
      question: "Puis-je accéder à un espace web coach dès maintenant ?",
      answer:
        "L'accès web est progressif. La page Connexion vous indique si vous pouvez vous connecter directement ou demander un accès.",
    },
    {
      question: "Faut-il déjà utiliser l'app pour candidater ?",
      answer:
        "Non. Vous pouvez d'abord demander un accès professionnel, puis nous vous guidons vers le bon parcours.",
    },
  ],
  finalCta: {
    title: "Rejoignez le parcours pro BeFood",
    description:
      "Présentez votre activité et votre besoin. L'équipe BeFood revient vers vous avec le bon mode d'accès.",
    note: "Accès coach sur validation. BeFood ne se substitue pas à un avis médical.",
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
      "Si vous avez déjà un accès validé, utilisez votre lien de connexion. Sinon, démarrez par une demande d'accès.",
    ctaLabel: "Demander un accès",
    ctaHref: null,
  },
];
