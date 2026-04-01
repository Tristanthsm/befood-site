export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuidePage {
  slug: string;
  title: string;
  description: string;
  intro: string;
  intent: string;
  publishedAt: string;
  updatedAt: string;
  sections: GuideSection[];
  relatedSlugs: string[];
}

export const guidePages: GuidePage[] = [
  {
    slug: "analyser-un-repas-en-photo",
    title: "Analyser un repas en photo : méthode, intérêt et limites",
    description:
      "Méthode simple pour analyser un repas en photo, comprendre ce que l'IA peut réellement apporter, et éviter les conclusions trompeuses.",
    intro:
      "L'analyse d'un repas en photo fait gagner du temps, mais elle n'a de valeur que si elle débouche sur des décisions concrètes, dans votre contexte réel.",
    intent: "Savoir comment analyser un repas en photo sans surpromesse.",
    publishedAt: "2026-03-30",
    updatedAt: "2026-03-31",
    sections: [
      {
        heading: "Pourquoi utiliser une photo plutôt qu'un journal manuel",
        paragraphs: [
          "Le principal avantage d'une photo est la rapidité. En quelques secondes, on capte le contexte réel du repas sans friction de saisie.",
          "Ce format favorise la régularité: quand la collecte devient plus simple, il devient plus facile d'observer ses habitudes sur plusieurs semaines avec un coach cohérent.",
        ],
      },
      {
        heading: "Les limites à connaître avant d'interpréter",
        paragraphs: [
          "Une image ne donne jamais une mesure absolue. Les portions exactes, les ingrédients cachés ou les modes de cuisson peuvent rester partiels.",
          "Le bon usage n'est donc pas d'obtenir un chiffre parfait, mais un repère décisionnel: quoi ajuster au prochain repas.",
        ],
      },
      {
        heading: "Méthode BeFood en 4 étapes",
        paragraphs: [
          "BeFood combine lecture visuelle, repères nutritionnels et interprétation orientée action.",
        ],
        bullets: [
          "1) Capturer le repas avec une image nette.",
          "2) Recevoir une lecture des grands équilibres du repas.",
          "3) Relier l'analyse à votre contexte (moment, rythme, objectif).",
          "4) Décider d'un ajustement simple pour le repas suivant.",
        ],
      },
    ],
    relatedSlugs: [
      "comprendre-ce-que-je-mange",
      "comprendre-l-equilibre-d-un-repas",
      "ameliorer-ses-habitudes-alimentaires",
    ],
  },
  {
    slug: "comprendre-ce-que-je-mange",
    title: "Comprendre ce que je mange : passer des données aux décisions",
    description:
      "Comment transformer l'analyse d'un repas en décisions concrètes pour mieux manger, sans rigidité et sans obsession des chiffres.",
    intro:
      "Comprendre ce que l'on mange ne se résume pas à compter. Le but est d'interpréter un repas avec une guidance cohérente, puis de décider quoi faire ensuite.",
    intent: "Mieux interpréter ses repas au quotidien.",
    publishedAt: "2026-03-30",
    updatedAt: "2026-03-31",
    sections: [
      {
        heading: "Lire un repas comme un ensemble",
        paragraphs: [
          "Un repas utilement compris combine plusieurs dimensions: satiété, qualité nutritionnelle globale, contexte de la journée, et capacité à tenir dans le temps.",
          "Cette logique évite l'effet 'bon/mauvais repas' et favorise des ajustements progressifs.",
        ],
      },
      {
        heading: "Les repères qui aident vraiment",
        paragraphs: [
          "Les repères les plus utiles sont actionnables immédiatement: équilibre de l'assiette, régularité, niveau de transformation, et cohérence avec l'objectif personnel.",
        ],
        bullets: [
          "Repère 1: composition globale du repas.",
          "Repère 2: qualité perçue des ingrédients.",
          "Repère 3: fréquence et régularité sur la semaine.",
          "Repère 4: adaptabilité au rythme de vie réel.",
        ],
      },
      {
        heading: "Comment BeFood guide l'interprétation",
        paragraphs: [
          "BeFood reformule les informations en langage clair et propose des actions courtes. L'objectif est de réduire la charge mentale et d'améliorer la constance.",
          "Le même coach suit votre progression dans le temps, ce qui rend les recommandations plus cohérentes d'un repas à l'autre.",
        ],
      },
    ],
    relatedSlugs: [
      "analyser-un-repas-en-photo",
      "journal-alimentaire-photo",
      "alternative-calorie-tracker",
    ],
  },
  {
    slug: "journal-alimentaire-photo",
    title: "Journal alimentaire photo : une alternative au calorie tracker",
    description:
      "Pourquoi un journal alimentaire par photo peut être plus simple à tenir qu'un suivi manuel classique, tout en restant utile pour progresser.",
    intro:
      "Le journal alimentaire photo cherche un équilibre: garder une trace fiable de ses habitudes sans passer son temps à tout saisir manuellement.",
    intent: "Mettre en place un journal alimentaire durable.",
    publishedAt: "2026-03-30",
    updatedAt: "2026-03-30",
    sections: [
      {
        heading: "Ce qu'on attend d'un journal alimentaire moderne",
        paragraphs: [
          "Un journal utile doit être rapide, lisible et suffisamment précis pour orienter les décisions. S'il devient trop lourd, il finit par être abandonné.",
        ],
      },
      {
        heading: "Avantages du format photo",
        paragraphs: [
          "La photo capte le repas réel, le contexte et la régularité. Elle réduit les oublis fréquents des journaux textuels.",
        ],
        bullets: [
          "Moins de friction qu'une saisie complète ingrédient par ingrédient.",
          "Meilleure continuité dans le temps.",
          "Lecture plus contextuelle d'un repas.",
        ],
      },
      {
        heading: "Points de vigilance",
        paragraphs: [
          "Le format photo doit rester un outil de compréhension, pas un outil de contrôle excessif. La progression vient de la régularité et des ajustements, pas de la perfection quotidienne.",
        ],
      },
    ],
    relatedSlugs: [
      "alternative-calorie-tracker",
      "ameliorer-ses-habitudes-alimentaires",
      "comprendre-l-equilibre-d-un-repas",
    ],
  },
  {
    slug: "alternative-calorie-tracker",
    title: "Alternative calorie tracker : une approche orientée compréhension",
    description:
      "Comparer les limites du calorie tracking classique avec une approche centrée sur la compréhension du repas, la guidance et la progression durable.",
    intro:
      "Le calorie tracker peut être utile dans certains contextes. Mais beaucoup d'utilisateurs recherchent une alternative plus pédagogique, contextualisée et moins contraignante.",
    intent: "Trouver une alternative crédible au suivi calories classique.",
    publishedAt: "2026-03-30",
    updatedAt: "2026-03-31",
    sections: [
      {
        heading: "Pourquoi certaines personnes décrochent du tracking classique",
        paragraphs: [
          "La saisie détaillée prend du temps et peut renforcer une relation trop quantitative à l'alimentation.",
          "Quand la charge mentale augmente, l'adhérence baisse, même avec de la motivation.",
        ],
      },
      {
        heading: "Ce qu'une alternative doit apporter",
        paragraphs: [
          "Une alternative robuste doit conserver l'utilité décisionnelle sans imposer un contrôle permanent.",
        ],
        bullets: [
          "Moins de friction de saisie.",
          "Plus d'interprétation contextuelle.",
          "Un coach plus cohérent dans le temps.",
          "Des actions simples à appliquer rapidement.",
        ],
      },
      {
        heading: "Positionnement BeFood",
        paragraphs: [
          "BeFood n'essaie pas d'être un compteur de calories de plus. Le produit privilégie la lecture du repas réel, la guidance contextualisée et la progression dans le temps.",
        ],
      },
    ],
    relatedSlugs: [
      "journal-alimentaire-photo",
      "comprendre-ce-que-je-mange",
      "ameliorer-ses-habitudes-alimentaires",
    ],
  },
  {
    slug: "ameliorer-ses-habitudes-alimentaires",
    title: "Améliorer ses habitudes alimentaires : stratégie simple et durable",
    description:
      "Plan d'action concret pour améliorer ses habitudes alimentaires sans régime extrême, avec des ajustements réalistes dans la durée.",
    intro:
      "Améliorer ses habitudes alimentaires repose moins sur des actions parfaites que sur une routine soutenable semaine après semaine.",
    intent: "Construire une routine alimentaire durable.",
    publishedAt: "2026-03-30",
    updatedAt: "2026-03-30",
    sections: [
      {
        heading: "Prioriser la constance avant l'intensité",
        paragraphs: [
          "Une petite action répétée quotidiennement a souvent plus d'impact qu'un plan ambitieux difficile à tenir.",
        ],
      },
      {
        heading: "Plan d'amélioration en 3 niveaux",
        paragraphs: [
          "Commencez par un socle minimal, puis ajoutez des raffinements quand la base est stabilisée.",
        ],
        bullets: [
          "Niveau 1: régularité des repas et hydratation.",
          "Niveau 2: composition plus équilibrée des assiettes.",
          "Niveau 3: ajustements précis selon les retours observés.",
        ],
      },
      {
        heading: "Rôle de l'IA et de la guidance",
        paragraphs: [
          "La valeur de l'IA n'est pas de dicter une conduite rigide. Elle sert à clarifier les options et à réduire l'incertitude dans les décisions quotidiennes.",
        ],
      },
    ],
    relatedSlugs: [
      "comprendre-ce-que-je-mange",
      "comprendre-l-equilibre-d-un-repas",
      "coach-nutrition-ia",
    ],
  },
  {
    slug: "coach-nutrition-ia",
    title: "Coach nutrition IA cohérent : comment BeFood interprète vos repas",
    description:
      "Ce qu'un coach nutrition IA cohérent peut apporter concrètement: interprétation des repas, guidance contextualisée et suivi des habitudes.",
    intro:
      "Un coach nutrition IA est utile s'il reste cohérent d'une interaction à l'autre. Il ne remplace pas un professionnel de santé et ne délivre pas de diagnostic.",
    intent: "Comprendre la valeur réelle d'un coach nutrition IA.",
    publishedAt: "2026-03-30",
    updatedAt: "2026-03-31",
    sections: [
      {
        heading: "Ce qu'un coach IA fait bien",
        paragraphs: [
          "Le coach IA peut structurer l'information, fournir un feedback rapide et proposer des ajustements pratiques dans un langage clair.",
          "Quand il tient compte de votre contexte et de votre historique, les recommandations deviennent plus utiles au quotidien.",
        ],
      },
      {
        heading: "Ce qu'il ne doit pas prétendre faire",
        paragraphs: [
          "L'outil ne doit pas se substituer à un avis médical. Les limites doivent être explicites, en particulier sur les sujets de santé.",
        ],
      },
      {
        heading: "Approche BeFood",
        paragraphs: [
          "BeFood associe analyse photo, interprétation contextualisée, coach identifiable et parcours social pour soutenir des habitudes durables.",
        ],
      },
    ],
    relatedSlugs: [
      "comprendre-l-equilibre-d-un-repas",
      "ameliorer-ses-habitudes-alimentaires",
      "analyser-un-repas-en-photo",
    ],
  },
  {
    slug: "comprendre-l-equilibre-d-un-repas",
    title: "Comprendre l'équilibre d'un repas : repères simples à appliquer",
    description:
      "Repères concrets pour évaluer l'équilibre d'un repas et ajuster simplement ses choix sans logique punitive.",
    intro:
      "L'équilibre d'un repas se juge mieux par repères pratiques que par règles rigides. L'objectif est de décider simplement ce qui améliore le repas suivant.",
    intent: "Savoir évaluer l'équilibre d'un repas au quotidien.",
    publishedAt: "2026-03-30",
    updatedAt: "2026-03-30",
    sections: [
      {
        heading: "Les dimensions d'un repas équilibré",
        paragraphs: [
          "Un repas équilibré combine satiété, densité nutritionnelle, praticité et cohérence avec votre rythme de vie.",
        ],
      },
      {
        heading: "Repères visuels rapides",
        paragraphs: [
          "Des repères visuels simples permettent d'ajuster sans suranalyse.",
        ],
        bullets: [
          "Présence d'une source de protéines.",
          "Part végétale identifiable.",
          "Source d'énergie adaptée à l'activité et au moment de la journée.",
          "Niveau de transformation global du repas.",
        ],
      },
      {
        heading: "Ajuster sans culpabiliser",
        paragraphs: [
          "L'amélioration durable passe par des micro-ajustements successifs. Un repas imparfait n'annule pas la progression globale.",
        ],
      },
    ],
    relatedSlugs: [
      "comprendre-ce-que-je-mange",
      "journal-alimentaire-photo",
      "ameliorer-ses-habitudes-alimentaires",
    ],
  },
];

export const guidePagesBySlug = Object.fromEntries(
  guidePages.map((guide) => [guide.slug, guide]),
) as Record<string, GuidePage>;
