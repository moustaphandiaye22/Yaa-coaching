export const publicContentDefaults = [
  {
    key: 'contacts',
    content: {
      email: 'yanmane29@gmail.com',
      phone: '06 52 28 11 55',
      phoneLink: '+33652281155',
      footerCoaching: 'Coaching & autonomie : Vierzon et alentours.',
      footerPlayer: 'Player : sans limite géographique.',
      footerSignature: 'FAIT AVEC ÉCOUTE · À VIERZON',
    },
  },
  {
    key: 'closing',
    content: {
      eyebrow: 'LE PREMIER PAS VOUS APPARTIENT',
      title: 'Votre premier pas\nvers le changement',
      accent: 'commence ici.',
      buttonLabel: 'Faisons le premier pas',
    },
  },
  {
    key: 'methode',
    content: {
      pillarsEyebrow: 'YAA COACHING · CORPS & ESPRIT',
      pillarsTitle: 'Écouter. Comprendre.',
      pillarsAccent: 'Avancer.',
      pillarsIntroduction: 'Un chemin qui commence là où vous en êtes.',
      pillars: [
        {
          title: 'Développer ses capacités',
          description:
            'Remettre le corps en mouvement, à son rythme. Développer sa force, son endurance et sa mobilité pour retrouver le plaisir d’agir.',
        },
        {
          title: 'Développer ses ressources mentales',
          description:
            'Comprendre et gérer ses émotions. Mobiliser la concentration, l’attention et la mémoire. Cultiver la motivation, la discipline, la rigueur et la persévérance.',
        },
        {
          title: 'Choisir ses objectifs',
          description:
            'Mieux se connaître, identifier ses forces et ses axes d’amélioration, puis fixer des objectifs qui ont du sens. Définir des étapes concrètes, observer son évolution et ajuster le parcours.',
        },
      ],
      methodEyebrow: 'L’APPROCHE LIBRE PENSÉE',
      methodTitle: 'Accompagner,',
      methodAccent: 'c’est cheminer.',
      methodDescription:
        'Nous prenons le temps de comprendre vos besoins, vos envies et vos capacités. Le coach écoute, questionne, reformule et propose des activités adaptées. Vous choisissez vos objectifs et avancez à votre rythme, avec un accompagnement qui évolue avec vous.',
      steps: [
        {
          title: 'Me connaître',
          description: 'Explorer mon histoire, mes habitudes, mes forces et mes difficultés.',
        },
        {
          title: 'M’activer',
          description: 'Mettre mon corps et ma tête en mouvement, à mon rythme.',
        },
        {
          title: 'Me renforcer',
          description:
            'Développer mes ressources : confiance, émotions, concentration et motivation, pour mieux avancer.',
        },
        { title: 'Me diriger', description: 'Choisir où je veux aller et pourquoi.' },
        {
          title: 'Agir & devenir autonome',
          description: 'Passer à l’action et apprendre à poursuivre par moi-même.',
        },
      ],
    },
  },
  {
    key: 'player',
    content: {
      serviceLabel: 'YAA PLAYER',
      mediaLabel: 'SANS LIMITE GÉOGRAPHIQUE',
      eyebrow: 'POUR LES JEUNES FOOTBALLEURS',
      title: 'Franchir un cap\ncommence par mieux\nse connaître.',
      description:
        'Faire grandir tes points forts. Avancer sur ce qui te freine. Jouer avec plus de confiance, sans perdre le plaisir.',
      audience:
        'Jeune joueur ou parent, commençons par un échange sur le parcours, les envies et les besoins du joueur.',
      tags: ['PHYSIQUE', 'MENTAL', 'TECHNIQUE', 'TACTIQUE'],
      questionnaireSituation: 'Être accompagné dans mon parcours de jeune footballeur',
      callToAction: 'Découvrir ce qui peut faire la différence',
      note: 'Sans limite géographique. Distanciel et présentiel : modalités précisées ensemble.',
    },
  },
  {
    key: 'coach',
    content: {
      eyebrow: 'VOTRE ACCOMPAGNANT',
      title: 'De l’expérience. De l’écoute. À vos côtés.',
      photoSeal: 'À VOS CÔTÉS · À VOTRE RYTHME',
      photoCaption: 'YAA COACHING',
      photoLocation: 'VIERZON · FRANCE',
      paragraphs: [
        'Mon parcours réunit le football, la préparation mentale et athlétique, l’accompagnement en santé mentale et l’engagement humain.',
        'Mon rôle est de cheminer à vos côtés : prendre le temps de comprendre vos besoins, identifier avec vous vos ressources et construire des objectifs qui vous ressemblent.',
        'Je ne décide pas à votre place. Je vous accompagne avec écoute, bienveillance et respect de votre rythme, pour vous aider à avancer et à gagner en autonomie.',
      ],
      callToAction: 'Faisons connaissance',
      experiences: [
        {
          label: 'SPORT & PERFORMANCE',
          title: 'UEFA A',
          description: 'Préparation mentale et athlétique · Plus de 20 ans d’expérience',
        },
        {
          label: 'ACCOMPAGNEMENT & ÉCOUTE',
          title: '15+ ans',
          description: 'Coach en clinique de santé mentale',
        },
        {
          label: 'ENGAGEMENT HUMAIN',
          title: '10 ans',
          description: 'Pompier volontaire · Association 2 Bouts',
        },
      ],
    },
  },
  {
    key: 'zones',
    content: {
      eyebrow: 'NOS ZONES D’ACCOMPAGNEMENT',
      title: 'À Vierzon,',
      accent: 'à vos côtés.',
      introduction: 'YAA PLAYER, où que vous soyez.',
      contactEmail: 'yanmane29@gmail.com',
      contactLabel: 'Une question ? Écrivez-moi',
      items: [
        {
          title: 'YAA COACHING',
          description:
            'Un accompagnement physique et mental à Vierzon et alentours : reprise d’activité, émotions, concentration, mémoire, confiance et fixation d’objectifs.',
        },
        {
          title: 'YAA AUTONOMIE',
          description:
            'À domicile, pour stimuler, rassurer et garder le lien. La zone précise et les déplacements sont convenus lors du premier échange.',
        },
        {
          title: 'YAA PLAYER',
          description:
            'Sans limite géographique. Suivi en distanciel ou en présentiel : lieux et modalités sont définis ensemble.',
        },
      ],
    },
  },
] as const;
