export const services = [
  {
    slug: 'coaching',
    name: 'YAA COACHING',
    accent: 'sage',
    image: '/images/coaching.webp',
    alt: 'Un coach à l’écoute d’une personne accompagnée, lors d’un échange dans un parc.',
    link: 'Faire mon bilan découverte →',
    questionnaireSituations: [
      'Commencer / reprendre une activité et développer mes ressources',
      'Je ne sais pas encore, aidez-moi à préciser',
    ],
    type: 'PHYSIQUE & MENTAL',
    title: 'YAA COACHING',
    zone: 'Vierzon et alentours',
    presentation:
      'Accompagnement physique et mental individualisé pour reprendre une activité, développer votre confiance et avancer dans votre quotidien.',
    offerHighlight: '140 € les 2 séances',
    offerDetails:
      ' (70 € par séance). Repère sur 3 mois : 6 séances, soit 420 €. Le rythme est défini ensemble.',
    description:
      'Retrouver des possibilités d’action à votre rythme, sans mesurer votre valeur à vos performances. Sportif ou non, bénéficiez d’un accompagnement physique et mental adapté à vos capacités et à vos besoins.',
  },
  {
    slug: 'player',
    name: 'YAA PLAYER',
    accent: 'ochre',
    image: '/images/player.webp',
    alt: 'Un jeune sportif échange avec un coach à son écoute après une séance.',
    link: 'Découvrir YAA PLAYER →',
    questionnaireSituations: ['Être accompagné dans mon parcours de jeune sportif'],
    type: 'JEUNES SPORTIFS · 9–18 ANS',
    title: 'YAA PLAYER',
    zone: 'Sans limite géographique',
    presentation:
      'Accompagnement individualisé des jeunes sportifs de 9 à 18 ans, toutes disciplines. Le parcours travaille la performance mentale, les habitudes de progression et l’autonomie, en lien avec la discipline et le projet du jeune.',
    offerHighlight: 'CIBLÉ : 45 € / séance · PERFORMANCE : 60 € / séance',
    offerDetails:
      ' Séances individuelles d’une heure, une fois par semaine, sur 3 mois minimum. Le parcours est proposé après le bilan découverte.',
    description:
      'Pour les jeunes sportifs de 9 à 18 ans, toutes disciplines : optimiser la performance mentale, les habitudes de progression et l’autonomie, sans réduire le jeune à ses résultats.',
  },
  {
    slug: 'autonomie',
    name: 'YAA AUTONOMIE',
    accent: 'plum',
    image: '/images/autonomie.webp',
    alt: 'Une personne âgée réalise un mouvement doux assis avec un coach attentif à ses côtés.',
    link: 'Découvrir YAA AUTONOMIE →',
    questionnaireSituations: ['Préserver mon autonomie au quotidien'],
    type: 'À DOMICILE',
    title: 'YAA AUTONOMIE',
    zone: 'Vierzon et alentours',
    presentation:
      'Accompagnement personnalisé à domicile pour les personnes âgées ou en perte d’autonomie, à Vierzon et aux alentours.',
    offerHighlight: 'Bouger · Stimuler · Rassurer · Créer du lien.',
    offerDetails:
      ' Parcours initial de 12 semaines, avec 2 visites de 45 à 60 minutes par semaine et un bilan initial et final. Proposition personnalisée après échange.',
    description:
      'À domicile, un accompagnement pour stimuler, rassurer et garder le lien au quotidien.',
  },
] as const;
