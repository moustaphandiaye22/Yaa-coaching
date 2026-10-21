export type Service = 'YAA COACHING' | 'YAA PLAYER' | 'YAA AUTONOMIE';
export type Answers = Record<string, string | string[]>;
export type Question = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'multi' | 'email' | 'tel';
  required?: boolean;
  options?: string[];
  max?: number;
  condition?: [string, string] | { key: string; equals?: string; notEquals?: string };
};
export const API = (
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL ??
  'http://localhost:3000'
).replace(/\/$/, '');
export const priorities = [
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
export const playerPriorities = [
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
export const positions = [
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
export const faqs = [
  [
    'Faut-il être sportif pour commencer ?',
    'Non. Vous pouvez commencer même si vous n’avez pas l’habitude de pratiquer une activité. YAA COACHING vous accompagne pour vous stimuler, vous mettre en mouvement ou reprendre progressivement une activité physique et mentale. Chaque proposition tient compte de vos capacités, de vos besoins et de votre rythme.',
  ],
  [
    'Comment se déroule le début du parcours ?',
    'Le parcours commence par un entretien découverte. Il permet de faire le point, puis de définir ensemble les priorités, le format et les modalités de l’accompagnement.',
  ],
  [
    'Où et sous quel format peut-on être accompagné ?',
    'YAA COACHING et YAA AUTONOMIE interviennent à Vierzon et alentours. YAA PLAYER s’adresse aux jeunes footballeurs sans limite géographique : le suivi à distance et l’accompagnement en présentiel correspondent à des modalités distinctes, à préciser lors de l’entretien découverte.',
  ],
  [
    'Comment connaître les tarifs ?',
    'Le tarif et le contenu sont présentés lors de l’entretien découverte, en fonction de l’accompagnement envisagé.',
  ],
];
