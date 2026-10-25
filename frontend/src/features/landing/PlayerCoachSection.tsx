import { Brain, Dumbbell, Globe2, GraduationCap, Search, Target, Trophy } from 'lucide-react';

const qualifications = [
  { text: 'Formation professionnelle — FC Gueugnon, Ligue 2', Icon: Target },
  { text: 'Ancien international jeune du Sénégal — U17/U18', Icon: Globe2 },
  { text: 'Entraîneur diplômé UEFA A', Icon: GraduationCap },
  { text: 'Certifié en préparation mentale', Icon: Brain },
  { text: 'Certifié en préparation athlétique', Icon: Dumbbell },
  { text: 'Plus de 20 ans d’expérience dans le football et la formation', Icon: Trophy },
  { text: 'Expérience dans la détection et l’accompagnement de jeunes talents', Icon: Search },
];

export default function PlayerCoachSection() {
  return (
    <section className="player-coach-section section-pad" id="coach" aria-labelledby="player-coach-title">
      <div className="player-coach-copy">
        <p className="eyebrow">QUI T’ACCOMPAGNE ?</p>
        <h1 id="player-coach-title">Yakhouba MANE</h1>
        <p className="player-coach-role">Fondateur de YAA PLAYER</p>
        <p>
          Ancien joueur et éducateur de football, j’accompagne depuis de nombreuses années des
          jeunes dans leur développement.
        </p>
        <p>
          Mon expérience du terrain, de la formation et de l’encadrement m’a appris une chose
          essentielle : deux joueurs du même âge et du même niveau peuvent avoir des besoins
          complètement différents.
        </p>
        <p>
          Avec YAA PLAYER, mon rôle n’est pas de décider à la place du jeune de ce qu’il doit
          devenir. Je l’aide à mieux se connaître, comprendre son jeu, identifier ses priorités,
          développer ses ressources et devenir progressivement autonome.
        </p>
      </div>
      <div className="player-coach-qualifications">
        <h3>MES EXPÉRIENCES ET QUALIFICATIONS</h3>
        <ul>
          {qualifications.map(({ text, Icon }) => (
            <li key={text}>
              <span className="player-coach-qualification-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.7} />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
