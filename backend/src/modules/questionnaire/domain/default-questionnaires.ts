import type { ServiceName } from './questionnaire.js';

type QuestionType = 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'select' | 'multi';
type Question = {
  key: string;
  label: string;
  type?: QuestionType;
  required?: boolean;
  min?: number;
  maxValue?: number;
  step?: number;
  options?: readonly string[];
  max?: number;
  condition?: { key: string; equals?: string; notEquals?: string };
};

const playerPositions = [
  'Gardien de but',
  'Défenseur central',
  'Latéral droit',
  'Latéral gauche',
  'Piston droit',
  'Piston gauche',
  'Milieu défensif / sentinelle',
  'Milieu relayeur',
  'Milieu offensif / meneur de jeu',
  'Ailier droit',
  'Ailier gauche',
  'Attaquant de soutien / deuxième attaquant',
  'Avant-centre',
  'Polyvalent / plusieurs postes',
  'Je cherche encore mon poste',
];

const common = [
  {
    key: 'approach',
    label: 'Votre démarche',
    type: 'select',
    required: true,
    options: ['Pour moi-même', 'Pour mon enfant', 'Pour un proche'],
  },
  { key: 'firstName', label: 'Prénom et nom de la personne à accompagner', required: true },
  {
    key: 'age',
    label: 'Âge de la personne à accompagner',
    type: 'number',
    required: true,
    min: 1,
    maxValue: 120,
    step: 1,
  },
  {
    key: 'representative',
    label: 'Votre prénom et votre lien avec la personne',
    condition: { key: 'approach', notEquals: 'Pour moi-même' },
  },
  { key: 'city', label: 'Ville et pays', required: true },
  {
    key: 'situation',
    label: 'Quelle situation correspond le mieux à votre recherche ?',
    type: 'select',
    required: true,
    options: [
      'Commencer / reprendre une activité et développer mes ressources',
      'Être accompagné dans mon parcours de jeune footballeur',
      'Préserver mon autonomie au quotidien',
      'Je ne sais pas encore, aidez-moi à préciser',
    ],
  },
];

const priorities = [
  'Remettre mon corps en mouvement',
  'Cardio / endurance',
  'Renforcement musculaire',
  'Équilibre / mobilité / coordination',
  'Compréhension et gestion des émotions',
  'Concentration / attention / mémoire',
  'Confiance / estime / affirmation de soi',
  'Motivation / discipline / persévérance',
  'Fixation d’objectifs',
  'Progression dans le football',
  'Autonomie au quotidien',
  'Garder du lien',
];
const playerPriorities = [
  'Confiance et réaction à l’erreur',
  'Gestion de la pression et des émotions',
  'Concentration et prise d’initiative',
  'Vitesse, appuis et efforts répétés',
  'Technique avec le ballon',
  'Tactique et compréhension du jeu',
  'Spécificités de mon poste',
  'Analyse de mes matchs',
  'Motivation, rigueur et persévérance',
  'Organisation, récupération et habitudes de vie',
  'Fixation de mes objectifs',
];

const generalQuestions: Question[] = [
  {
    key: 'activity',
    label: 'Votre activité actuelle',
    type: 'select',
    options: [
      'Je commence une activité',
      'Je reprends une activité',
      'Je ne pratique plus d’activité depuis un moment',
      'J’ai une activité occasionnelle',
      'J’ai une activité régulière',
    ],
  },
  { key: 'activityDetails', label: 'À quoi ressemble votre activité actuelle ?' },
  {
    key: 'difficulties',
    label: 'Qu’est-ce qui est difficile pour vous en ce moment ?',
    type: 'textarea',
    required: true,
  },
  {
    key: 'coping',
    label: 'Comment faites-vous actuellement pour faire face à ces difficultés ?',
    type: 'textarea',
  },
  {
    key: 'strengths',
    label: 'Sur quelles forces, habitudes ou personnes pouvez-vous vous appuyer ?',
    type: 'textarea',
  },
  {
    key: 'needType',
    label: 'Quel type de besoin identifiez-vous ?',
    type: 'select',
    options: ['Physique et mental', 'Plutôt physique', 'Plutôt mental', 'À préciser ensemble'],
  },
  {
    key: 'priorities',
    label: 'Quelles sont vos priorités ? Choisissez jusqu’à 3 réponses.',
    type: 'multi',
    options: priorities,
    max: 3,
  },
];

const playerQuestions: Question[] = [
  { key: 'club', label: 'Ton club, ta catégorie et ton niveau de compétition' },
  {
    key: 'position',
    label: 'Quel est ton poste principal ?',
    type: 'select',
    options: playerPositions,
  },
  {
    key: 'secondaryPosition',
    label: 'À quel autre poste joues-tu ?',
    type: 'select',
    options: ['Pas de poste secondaire / à préciser', ...playerPositions],
  },
  {
    key: 'strongFoot',
    label: 'Quel est ton pied fort ?',
    type: 'select',
    options: ['Droit', 'Gauche', 'À l’aise avec les deux pieds', 'Je ne sais pas encore'],
  },
  { key: 'footballStart', label: 'Depuis quand joues-tu au football ?' },
  {
    key: 'footballRhythm',
    label: 'Combien d’entraînements fais-tu par semaine ?',
    type: 'number',
    min: 0,
    maxValue: 14,
    step: 1,
  },
  {
    key: 'weeklyMatches',
    label: 'Combien de matchs joues-tu par semaine ?',
    type: 'number',
    min: 0,
    maxValue: 14,
    step: 1,
  },
  {
    key: 'teamRole',
    label: 'Comment vis-tu ta place dans l’équipe et ton temps de jeu ?',
    type: 'textarea',
  },
  { key: 'mistakeReaction', label: 'Après une erreur, comment réagis-tu ?', type: 'textarea' },
  {
    key: 'pressure',
    label: 'Comment vis-tu la pression et les émotions pendant un match ?',
    type: 'textarea',
  },
  {
    key: 'confidence',
    label: 'Qu’est-ce qui te donne ou te fait perdre confiance ?',
    type: 'textarea',
  },
  {
    key: 'effort',
    label: 'Comment vis-tu les efforts répétés et la fin des matchs ?',
    type: 'textarea',
  },
  { key: 'qualities', label: 'Quelles sont tes trois principales qualités ?', type: 'textarea' },
  {
    key: 'progress',
    label: 'Quels sont les trois points sur lesquels tu souhaites progresser ?',
    type: 'textarea',
  },
  {
    key: 'seasonGoal',
    label: 'Quel est ton objectif pour cette saison et à plus long terme ?',
    type: 'textarea',
  },
  {
    key: 'playerPriorities',
    label: 'Quels domaines souhaites-tu travailler ? Jusqu’à 3 choix.',
    type: 'multi',
    options: playerPriorities,
    max: 3,
  },
];

const autonomyQuestions: Question[] = [
  {
    key: 'dailyActivities',
    label: 'Quels gestes ou activités souhaitez-vous maintenir ou retrouver ?',
    type: 'textarea',
  },
  {
    key: 'reassurance',
    label: 'Dans quelles situations avez-vous besoin d’être rassuré ou accompagné ?',
    type: 'textarea',
  },
  {
    key: 'enjoy',
    label: 'Quelles activités vous plaisent et vous donnent envie de participer ?',
    type: 'textarea',
  },
  {
    key: 'dailyChange',
    label: 'Qu’aimeriez-vous changer en premier dans le quotidien ?',
    type: 'textarea',
  },
  {
    key: 'surroundings',
    label: 'Quel entourage ou accompagnement est déjà présent ?',
    type: 'textarea',
  },
];

const playerStartingQuestions: Question[] = [
  { key: 'playerJourney', label: 'Où en es-tu aujourd’hui dans ton parcours de footballeur ?', type: 'textarea' },
  { key: 'playerEnjoyment', label: 'Qu’est-ce qui te plaît le plus dans le football ?', type: 'textarea' },
  { key: 'playerDifficulties', label: 'Quelles situations te mettent en difficulté sur ou en dehors du terrain ?', type: 'textarea' },
  { key: 'playerSupport', label: 'Sur quelles qualités ou personnes peux-tu t’appuyer ?', type: 'textarea' },
];

const autonomyStartingQuestions: Question[] = [
  { key: 'autonomyDifficulties', label: 'Quelles situations du quotidien sont difficiles en ce moment ?', type: 'textarea' },
  { key: 'autonomySupport', label: 'Quelles aides ou quels accompagnements sont déjà présents ?', type: 'textarea' },
  { key: 'familyDistance', label: 'Dans quelle ville vit la famille, et à quelle distance du parent ?', type: 'textarea' },
];

const serviceGoals = (service: ServiceName | undefined) => {
  if (!service || service === 'YAA COACHING') return goals;
  const excluded = new Set(['weightLoss', 'kilos']);
  const labels: Record<string, string> = service === 'YAA PLAYER'
    ? {
        expectations: 'Qu’attends-tu de ton accompagnement YAA PLAYER ?',
        familyExpectations: 'Qu’attend ta famille de cet accompagnement ?',
        goal: 'Quel est ton objectif prioritaire dans ton parcours de footballeur ?',
        success: 'À quoi verras-tu que l’accompagnement t’aide à progresser ?',
        whyGoal: 'Pourquoi cet objectif compte-t-il pour toi ?',
      }
    : {
        expectations: 'Qu’attend la personne de cet accompagnement ?',
        familyExpectations: 'Quelles sont les attentes de la famille ou des proches ?',
        goal: 'Quel changement la personne aimerait-elle voir dans son quotidien ?',
        success: 'À quoi verrez-vous que l’accompagnement lui est utile ?',
        whyGoal: 'Pourquoi cet objectif compte-t-il pour la personne ?',
      };
  return goals
    .filter((question) => !excluded.has(question.key))
    .map((question) => ({ ...question, ...(labels[question.key] ? { label: labels[question.key] } : {}) }));
};

const goals: Question[] = [
  {
    key: 'expectations',
    label: 'Qu’attend la personne accompagnée de cet accompagnement ?',
    type: 'textarea',
    required: true,
  },
  {
    key: 'familyExpectations',
    label: 'Quelles sont les attentes de la famille ou des proches ?',
    type: 'textarea',
  },
  {
    key: 'expectationsShared',
    label: 'Ces attentes sont-elles partagées ?',
    type: 'select',
    options: ['Oui', 'Non', 'À préciser ensemble'],
  },
  {
    key: 'expectationsSharedDetails',
    label: 'Précisez en quoi ces attentes sont partagées.',
    type: 'textarea',
    required: true,
    condition: { key: 'expectationsShared', equals: 'Oui' },
  },
  {
    key: 'goal',
    label: 'Quel objectif aimeriez-vous atteindre en priorité ?',
    type: 'textarea',
    required: true,
  },
  {
    key: 'success',
    label: 'À quoi verrez-vous que l’accompagnement vous aide ?',
    type: 'textarea',
  },
  {
    key: 'deadline',
    label: 'Avez-vous une échéance ou un événement en tête ?',
    type: 'select',
    options: ['Oui', 'Non', 'À préciser ensemble'],
  },
  {
    key: 'deadlineDetails',
    label: 'Quelle est cette échéance ou cet événement ?',
    required: true,
    condition: { key: 'deadline', equals: 'Oui' },
  },
  {
    key: 'weightLoss',
    label: 'La perte de poids fait-elle partie de vos objectifs ?',
    type: 'select',
    options: ['Oui', 'Non', 'Je préfère en discuter', 'Je préfère ne pas répondre'],
  },
  {
    key: 'kilos',
    label: 'Combien de kilos aimeriez-vous perdre ?',
    type: 'number',
    required: true,
    min: 1,
    maxValue: 300,
    step: 1,
    condition: { key: 'weightLoss', equals: 'Oui' },
  },
  { key: 'whyGoal', label: 'Pourquoi cet objectif compte-t-il pour vous ?', type: 'textarea' },
  {
    key: 'pastSupport',
    label: 'Avez-vous déjà été accompagné ou essayé une démarche similaire ?',
    type: 'select',
    options: ['Oui', 'Non', 'Je préfère ne pas répondre'],
  },
  {
    key: 'pastSupportDetails',
    label: 'Qu’avez-vous essayé et qu’en avez-vous retenu ?',
    type: 'textarea',
    required: true,
    condition: { key: 'pastSupport', equals: 'Oui' },
  },
];

const organization: Question[] = [
  {
    key: 'format',
    label: 'Quel format préférez-vous ?',
    type: 'select',
    options: ['Présentiel', 'Distanciel', 'Présentiel et distanciel', 'À définir ensemble'],
  },
  {
    key: 'availability',
    label: 'Quels jours, horaires et quelle fréquence pourraient vous convenir ?',
    type: 'textarea',
  },
  {
    key: 'constraints',
    label: 'Quelles contraintes ou adaptations souhaitez-vous que je prenne en compte ?',
    type: 'textarea',
  },
  { key: 'supportStyle', label: 'Comment souhaitez-vous être accompagné ?', type: 'textarea' },
  { key: 'otherInfo', label: 'Y a-t-il autre chose d’important à préciser ?', type: 'textarea' },
  {
    key: 'contactEmail',
    label: 'Adresse e-mail pour vous recontacter',
    type: 'email',
    required: true,
  },
  { key: 'contactPhone', label: 'Numéro de téléphone', type: 'tel' },
];

export function getQuestionnaire(service?: ServiceName) {
  const player = service === 'YAA PLAYER';
  const autonomy = service === 'YAA AUTONOMIE';
  const commonQuestions = common.map((question) => {
    const labels: Record<string, string> = player
      ? {
          approach: 'Qui fait la demande de bilan ?',
          firstName: 'Prénom et nom du joueur',
          age: 'Âge du joueur',
          representative: 'Prénom du parent ou responsable légal et lien avec le joueur',
          city: 'Ville et pays où vit le joueur',
          situation: 'Quelle situation correspond le mieux à ta demande ?',
        }
      : autonomy
        ? {
            approach: 'Qui fait la demande de bilan ?',
            firstName: 'Prénom et nom de la personne à accompagner',
            age: 'Âge de la personne',
            representative: 'Votre prénom et votre lien avec la personne',
            city: 'Ville où vit votre parent',
            situation: 'Quelle situation correspond le mieux à votre demande ?',
          }
        : {};
    return { ...question, ...(labels[question.key] ? { label: labels[question.key] } : {}) };
  });
  const branch =
    player
      ? playerQuestions
      : autonomy
        ? autonomyQuestions
        : [
            {
              key: 'activities',
              label: 'Quelles activités vous plaisent ou vous donnent envie d’essayer ?',
              type: 'textarea' as const,
            },
            {
              key: 'helpStarting',
              label: 'Qu’est-ce qui vous aiderait à commencer ou à reprendre ?',
              type: 'textarea' as const,
            },
          ];
  const goalQuestions = serviceGoals(service);
  const playerTitle = 'Bilan découverte YAA PLAYER';
  const autonomyTitle = 'Bilan découverte YAA AUTONOMIE';
  return {
    version: 'v4',
    title: player
      ? playerTitle
      : autonomy
        ? autonomyTitle
        : 'Bilan découverte YAA COACHING',
    introduction: player
      ? 'Un premier échange pour comprendre ton parcours de footballeur, tes envies, tes objectifs et les priorités qui te correspondent. Le bilan est gratuit et sans engagement.'
      : autonomy
        ? 'Un premier échange pour écouter la personne, comprendre ses envies et ses besoins, et prendre en compte sa famille si elle le souhaite. Le bilan est gratuit et sans engagement.'
        : 'Vos besoins physiques et mentaux, vos envies, vos difficultés et votre rythme : construisons un point de départ qui vous ressemble.',
    service: service ?? null,
    maxPriorities: 3,
    steps: [
      {
        number: 1,
        title: player ? 'Faisons connaissance avec le joueur' : autonomy ? 'Faisons connaissance avec la personne' : 'Faisons connaissance',
        questions: commonQuestions,
      },
      {
        number: 2,
        title: player ? 'Ton parcours de footballeur' : autonomy ? 'Le quotidien de votre parent' : 'Votre point de départ',
        questions: player ? playerStartingQuestions : autonomy ? autonomyStartingQuestions : generalQuestions,
      },
      {
        number: 3,
        title: player ? 'Ton football et tes priorités' : autonomy ? 'Ses envies et son autonomie' : 'Précisons votre accompagnement',
        questions: branch,
      },
      {
        number: 4,
        title: player ? 'Tes objectifs de progression' : autonomy ? 'Les attentes de la personne et de ses proches' : 'Vos attentes et vos objectifs',
        questions: goalQuestions,
      },
      {
        number: 5,
        title: player ? 'Organisons ton accompagnement' : autonomy ? 'Organisons les visites et les échanges' : 'Comment cheminer ensemble ?',
        questions: organization,
      },
    ],
    notices: player
      ? [
          'Ce bilan gratuit n’est pas un examen sportif. Réponds avec tes mots ; tu peux aussi répondre « je ne sais pas encore ».',
          'Pour un joueur mineur, la demande doit être initiée par son parent ou responsable légal. Le joueur reste au centre de son projet.',
          'Évite de transmettre des informations médicales.',
        ]
      : autonomy
        ? [
            'La demande peut être initiée par un proche, mais l’accompagnement se construit avec l’accord de la personne concernée.',
            'Les échanges avec la famille sont définis avec la personne, dans le respect de sa vie privée.',
            'Évite de transmettre des informations médicales.',
          ]
        : [
            'Évitez les informations médicales.',
            'Pour un mineur, le premier contact se fait avec un parent ou responsable légal.',
          ],
  };
}
