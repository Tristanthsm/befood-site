import type {
  CoachingPoint,
  CtaBlock,
  Differentiator,
  FaqItem,
  FeatureItem,
  HeroContent,
  QuizContent,
  SocialItem,
  StepItem,
  TrustItem,
} from "@/lib/types";

export const heroContent: HeroContent = {
  badge: "",
  title: "Comprenez vos repas. Construisez de meilleures habitudes.",
  description:
    "Une photo, des repères clairs, puis un accompagnement personnalisé pour mieux manger dans la durée.",
  reassurance:
    "Approche bien-être et éducation nutritionnelle. BeFood n'est pas un service médical et ne fournit pas de diagnostic.",
};

export const trustTitle = "Comprendre. Être accompagné. Progresser.";

export const trustItems: TrustItem[] = [
  {
    title: "Des repères enfin lisibles",
    description: "Photo d'un repas, repères clairs en quelques secondes.",
  },
  {
    title: "Un coach adapté à vos objectifs",
    description: "Un accompagnement qui suit votre objectif et votre rythme.",
  },
  {
    title: "Une progression qui tient dans le temps",
    description: "Une dynamique collective pour rester régulier dans la durée.",
  },
];

export const howItWorksTitle = "Comment ça marche";

export const howItWorksSteps: StepItem[] = [
  {
    title: "1. Prenez votre repas en photo",
    description: "Vous capturez votre assiette en quelques secondes, sans journal manuel complexe.",
  },
  {
    title: "2. Recevez une analyse nutritionnelle claire",
    description: "BeFood transforme la photo en repères lisibles pour comprendre les équilibres de votre repas.",
  },
  {
    title: "3. Suivez vos habitudes dans le temps",
    description: "Vous suivez vos tendances et ajustez vos choix dans une logique long terme.",
  },
];

export const quizContent: QuizContent = {
  badge: "Diagnostic 90 secondes",
  title: "Pourquoi ça ne tient pas sur la durée ?",
  description:
    "Répondez à 6 questions pour identifier votre principal frein et recevoir une stratégie BeFood simple à appliquer dès cette semaine.",
  questions: [
    {
      id: "regimes",
      title: "Quand vous démarrez un nouveau plan alimentaire, que se passe-t-il le plus souvent ?",
      options: [
        { label: "Je suis motivé 1-2 semaines puis je décroche", profile: "relance" },
        { label: "Je tiens quand j'ai un cadre précis, sinon je flotte", profile: "cadre" },
        { label: "Le stress ou la fatigue me font sortir du plan", profile: "emotion" },
      ],
    },
    {
      id: "blocage",
      title: "Votre blocage n°1 aujourd'hui, c'est plutôt...",
      options: [
        { label: "J'ai déjà essayé beaucoup de choses sans résultat durable", profile: "relance" },
        { label: "Je manque d'accompagnement concret au quotidien", profile: "cadre" },
        { label: "Je manque de temps pour organiser mes repas", profile: "temps" },
      ],
    },
    {
      id: "soir",
      title: "Le soir, vous vous reconnaissez davantage dans quelle situation ?",
      options: [
        { label: "Je grignote pour relâcher la pression", profile: "emotion" },
        { label: "Je ne sais pas vraiment quoi préparer rapidement", profile: "temps" },
        { label: "Je fais au feeling, sans repère clair", profile: "cadre" },
      ],
    },
    {
      id: "cadre",
      title: "Ce qui vous aiderait le plus à tenir, ce serait...",
      options: [
        { label: "Un plan réaliste qui évite l'effet yoyo", profile: "relance" },
        { label: "Des retours personnalisés sur mes repas", profile: "cadre" },
        { label: "Des actions très courtes à intégrer sans charge mentale", profile: "temps" },
      ],
    },
    {
      id: "emotion",
      title: "Face à un écart alimentaire, votre réaction habituelle est plutôt...",
      options: [
        { label: "Je culpabilise et je repars de zéro", profile: "emotion" },
        { label: "J'ai besoin qu'on me dise quoi faire au repas suivant", profile: "cadre" },
        { label: "Je laisse passer plusieurs jours avant de m'y remettre", profile: "relance" },
      ],
    },
    {
      id: "rythme",
      title: "Quel format vous paraît le plus tenable sur 3 mois ?",
      options: [
        { label: "Un cap hebdo simple pour rester régulier", profile: "relance" },
        { label: "Des micro-ajustements guidés repas après repas", profile: "cadre" },
        { label: "Des choix rapides qui respectent mon emploi du temps", profile: "temps" },
      ],
    },
  ],
  results: [
    {
      profile: "relance",
      title: "Profil: cycle \"je recommence\"",
      description:
        "Votre enjeu n'est pas la motivation de départ, mais la constance. L'objectif BeFood: verrouiller une routine minimale et éviter le tout-ou-rien.",
      nextStep: "Pendant 7 jours: 1 photo repas + 1 ajustement concret par jour, sans compensation punitive.",
    },
    {
      profile: "cadre",
      title: "Profil: besoin de cadre clair",
      description:
        "Vous progressez mieux avec des repères précis et un feedback régulier. L'objectif BeFood: transformer chaque repas en décision simple, sans surcharge.",
      nextStep: "Pendant 7 jours: analyse photo + action guidée immédiate au repas suivant.",
    },
    {
      profile: "emotion",
      title: "Profil: pression émotionnelle",
      description:
        "Le frein principal n'est pas l'information, mais la charge mentale. L'objectif BeFood: réduire la culpabilité et garder un cap réaliste après les écarts.",
      nextStep: "Pendant 7 jours: noter le contexte des écarts + appliquer un plan de rebond au repas d'après.",
    },
    {
      profile: "temps",
      title: "Profil: manque de temps",
      description:
        "Votre difficulté vient surtout du rythme quotidien. L'objectif BeFood: rendre les choix alimentaires rapides, lisibles et praticables même les jours chargés.",
      nextStep: "Pendant 7 jours: privilégier 2 options repas express et maintenir la régularité avant la perfection.",
    },
  ],
  disclaimer: "Ce diagnostic est informatif et ne remplace pas un avis médical personnalisé.",
};

export const featuresTitle = "Une lecture plus utile que le simple tracking";

export const featureItems: FeatureItem[] = [
  {
    title: "Analyse photo des repas",
    description: "Passez d'une photo à une lecture utile de votre repas, sans friction.",
  },
  {
    title: "Repères nutritionnels clairs",
    description: "Des explications concrètes pour savoir quoi ajuster au prochain repas.",
  },
  {
    title: "Progression dans le temps",
    description: "Un suivi pensé pour installer des habitudes réalistes, pas pour surcontrôler.",
  },
  {
    title: "Accompagnement intelligent",
    description: "Des suggestions contextualisées pour décider avec plus de confiance au quotidien.",
  },
];

export const differentiationTitle = "Une lecture plus utile que le simple tracking";

export const differentiators: Differentiator[] = [
  {
    title: "Comprendre avant restreindre",
    description: "L'objectif est de guider vos choix, pas d'imposer une logique punitive.",
  },
  {
    title: "Habitudes avant obsession",
    description: "La constance et les ajustements utiles comptent plus que la perfection quotidienne.",
  },
  {
    title: "Repères avant chiffres isolés",
    description: "Vous comprenez le repas dans son ensemble, pas uniquement des totaux.",
  },
];

export const coachingTitle = "Un accompagnement qui aide vraiment";

export const coachingDescription =
  "BeFood ajoute une couche de guidance pour interpréter vos repas, prendre de meilleures décisions et garder le cap sans culpabilité.";

export const coachingPoints: CoachingPoint[] = [
  {
    title: "Des retours contextualisés",
    description: "Chaque analyse devient une recommandation concrète à appliquer dans votre contexte réel.",
  },
  {
    title: "Un ton non culpabilisant",
    description: "Le ton reste constructif, même quand une semaine est imparfaite.",
  },
  {
    title: "Des décisions plus claires au quotidien",
    description: "Vous savez quoi ajuster au prochain repas sans repartir de zéro.",
  },
];

export const socialEyebrow = "Communauté BeFood";

export const socialTitle = "Rester motivé ensemble, simplement";

export const socialDescription = "Des idées de repas, du soutien utile et des progrès partagés sans pression.";

export const socialItems: SocialItem[] = [
  {
    title: "Partager ses repas",
    description: "Postez vos repas et vos retours pour garder le cap ensemble.",
  },
  {
    title: "Trouver des idées utiles",
    description: "Découvrez des recettes simples et praticables au quotidien.",
  },
  {
    title: "Progresser sur la durée",
    description: "Avancez avec une dynamique collective constructive et régulière.",
  },
];

export const homeFaqTitle = "Questions fréquentes";

export const homeFaqItems: FaqItem[] = [
  {
    question: "Comment fonctionne l'analyse des repas ?",
    answer: "Vous prenez une photo dans l'app, puis BeFood fournit une analyse nutritionnelle claire et des repères pratiques.",
  },
  {
    question: "BeFood est-elle disponible sur Android ?",
    answer: "Pas encore. BeFood est actuellement disponible sur iOS, et la version Android est en préparation.",
  },
  {
    question: "BeFood remplace-t-elle un professionnel de santé ?",
    answer:
      "Non. BeFood aide à mieux comprendre son alimentation mais ne remplace pas un avis médical ou un suivi clinique.",
  },
  {
    question: "Peut-on suivre ses habitudes dans le temps ?",
    answer: "Oui, l'app vous aide à suivre vos tendances pour améliorer vos décisions sur la durée.",
  },
  {
    question: "Les coachs peuvent-ils rejoindre BeFood ?",
    answer: "Oui, une page dédiée présente le parcours d'accès pour les coachs et professionnels de la nutrition.",
  },
  {
    question: "Comment contacter l'aide ?",
    answer: "La page Aide du site centralise les réponses utiles et les informations de contact.",
  },
];

export const finalCta: CtaBlock = {
  title: "Téléchargez BeFood et commencez simplement",
  description:
    "Analysez vos repas, obtenez des repères clairs et installez de meilleures habitudes au quotidien.",
  note: "Version iOS disponible dès maintenant. Google Play arrive bientôt.",
};
