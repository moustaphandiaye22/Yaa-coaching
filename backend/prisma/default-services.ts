export const services = [
  {
    slug: 'coaching',
    name: 'YAA COACHING',
    accent: 'sage',
    image: '/images/coaching.webp',
    alt: 'Un coach à l’écoute d’une personne accompagnée, lors d’un échange dans un parc.',
    link: 'Retrouver mon élan',
    questionnaireSituations: [
      'Commencer / reprendre une activité et développer mes ressources',
      'Je ne sais pas encore, aidez-moi à préciser',
    ],
    type: 'PHYSIQUE & MENTAL',
    title: 'Reprendre une activité à votre rythme',
    zone: 'Vierzon et alentours',
    description:
      'Retrouver des possibilités d’action à votre rythme, sans mesurer votre valeur à vos performances. Sportif ou non, bénéficiez d’un accompagnement physique et mental adapté à vos capacités et à vos besoins.',
  },
  {
    slug: 'player',
    name: 'YAA PLAYER',
    accent: 'ochre',
    image: '/images/player.webp',
    alt: 'Un jeune footballeur échange avec un coach à son écoute au bord du terrain.',
    link: 'Progresser au football',
    questionnaireSituations: ['Être accompagné dans mon parcours de jeune footballeur'],
    type: 'JEUNE FOOTBALLEUR',
    title: 'Ton potentiel mérite de s’exprimer.',
    zone: 'Sans limite géographique',
    description:
      'Tu veux franchir un cap, gagner en confiance et mieux exprimer tes qualités sur le terrain ? Un accompagnement individuel pour avancer avec un cap qui te ressemble.',
  },
  {
    slug: 'autonomie',
    name: 'YAA AUTONOMIE',
    accent: 'plum',
    image: '/images/autonomie.webp',
    alt: 'Une personne âgée réalise un mouvement doux assis avec un coach attentif à ses côtés.',
    link: 'Préserver l’autonomie',
    questionnaireSituations: ['Préserver mon autonomie au quotidien'],
    type: 'À DOMICILE',
    title: 'Cultiver l’autonomie, garder le lien.',
    zone: 'Vierzon et alentours',
    description:
      'À domicile, un accompagnement pour stimuler, rassurer et garder le lien au quotidien.',
  },
] as const;
