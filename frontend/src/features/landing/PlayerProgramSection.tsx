import { ArrowUpRight } from 'lucide-react';

const playerSteps = [
  {
    title: 'JE ME CONNAIS',
    lead: 'Je comprends qui je suis comme joueur.',
    text: 'Mon parcours, mon poste, mes qualités, mes difficultés, mes habitudes, mon environnement et ce que je ressens.',
  },
  {
    title: 'JE COMPRENDS',
    lead: 'Je comprends mieux mon jeu et mon fonctionnement.',
    text: 'J’apprends à identifier ce qui m’aide à réussir, ce qui me met en difficulté et comment je réagis dans différentes situations.',
  },
  {
    title: 'JE PROGRESSE',
    lead: 'Je travaille mes priorités.',
    text: 'Technique, compréhension du jeu, physique, mental, confiance ou spécificité du poste : le travail est adapté à mes besoins.',
  },
  {
    title: 'J’OPTIMISE',
    lead: 'J’apprends à mieux utiliser mes ressources.',
    text: 'Je consolide mes points forts, je travaille mes axes de progression et j’apprends à mieux répondre aux exigences de mon environnement.',
  },
  {
    title: 'JE DEVIENS AUTONOME',
    lead: 'Je deviens acteur de ma progression.',
    text: 'J’apprends à analyser, comprendre, ajuster et poursuivre mon développement avec de plus en plus d’autonomie.',
  },
];

const accompaniment = [
  ['1 — BILAN DÉCOUVERTE', 'Nous commençons par comprendre le jeune : son parcours, son environnement, ses qualités, ses difficultés, son ressenti et ses objectifs.'],
  ['2 — ENTRETIEN & PRIORITÉS', 'Nous échangeons sur ses réponses et identifions ensemble les priorités de travail. Le jeune reste acteur de son projet.'],
  ['3 — ACCOMPAGNEMENT PERSONNALISÉ', 'Un parcours adapté lui est proposé : CIBLÉ, ÉVOLUTION ou OPTIMISATION, selon ses besoins et non selon son niveau.'],
  ['4 — 1 SÉANCE PAR SEMAINE', 'DISTANCIEL OU PRÉSENTIEL — DEUX MODALITÉS DISTINCTES. À distance, en français ou en anglais, selon ton pays et ton fuseau horaire. En présentiel, les lieux, déplacements et modalités sont convenus ensemble avant tout engagement. Le format et le contenu sont précisés lors de l’entretien découverte.'],
  ['5 — SUIVI & AJUSTEMENTS', 'Les priorités évoluent avec le joueur. L’accompagnement est ajusté en fonction de ses progrès, de ses difficultés et de son environnement.'],
  ['6 — BILAN D’ÉVOLUTION', 'À la fin du parcours, nous faisons le point sur les progrès réalisés et la suite : autonomie, nouveau besoin ou poursuite adaptée.'],
];

const pathways = [
  { name: 'CIBLÉ', duration: '12 semaines — 390 €', text: 'Pour travailler une priorité clairement identifiée.' },
  { name: 'ÉVOLUTION', duration: '16 semaines — 520 €', text: 'Pour travailler plusieurs dimensions et bénéficier d’un suivi plus régulier.' },
  { name: 'OPTIMISATION', duration: '20 semaines — 650 €', text: 'Pour un accompagnement global orienté vers l’optimisation de la performance, avec suivi renforcé et 1 visite en structure incluse.' },
];

const playerDimensions = [
  ['⚽ LE JOUEUR', 'Technique • compréhension du jeu • spécificité du poste'],
  ['💪 LE PHYSIQUE', 'Mobilité • coordination • qualités athlétiques • récupération'],
  ['🧠 LE MENTAL', 'Confiance • concentration • motivation • gestion des émotions et de l’erreur'],
  ['🎯 LE PROJET', 'Objectifs • progression • habitudes • autonomie'],
  ['🌍 SON ENVIRONNEMENT', 'Club • entraîneur • famille • concurrence • études • pression • plaisir de jouer'],
];

const qualifications = [
  '⚽ Formation professionnelle — FC Gueugnon, Ligue 2',
  '🇸🇳 Ancien international jeune du Sénégal — U17/U18',
  '🎓 Entraîneur diplômé UEFA A',
  '🧠 Certifié en préparation mentale',
  '💪 Certifié en préparation athlétique',
  '🏆 Plus de 20 ans d’expérience dans le football et la formation',
  '🎯 Expérience dans la détection et l’accompagnement de jeunes talents',
];

export default function PlayerProgramSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="player-program">
      <section className="player-program-intro section-pad">
        <p className="eyebrow">YAA PLAYER · UN PARCOURS QUI ÉVOLUE AVEC TOI</p>
        <h2>Le joueur de demain se construit aujourd’hui.</h2>
        <p className="player-program-lead">Chaque jeune est différent. Son parcours, son poste, ses qualités, ses difficultés, son environnement et ses objectifs le sont aussi.</p>
        <p>YAA PLAYER s’adresse aux jeunes footballeurs et aux parents qui souhaitent offrir à leur enfant un accompagnement individualisé, adapté à ses besoins et à ses objectifs. Pour mieux se connaître, comprendre son jeu, développer sa confiance et progresser en gardant le plaisir de jouer. Le suivi est accessible à l’international, en français et en anglais, à distance selon les disponibilités et les fuseaux horaires.</p>
        <div className="player-program-tags">{['Technique', 'Intelligence de jeu', 'Physique', 'Mental', 'Poste', 'Autonomie'].map((tag) => <span key={tag}>{tag}</span>)}</div>
        <p className="player-program-motto">Avant de proposer un accompagnement, nous commençons par comprendre le joueur.</p>
      </section>

      <section className="player-journey section-pad">
        <div className="player-program-heading"><p className="eyebrow">MIEUX SE CONNAÎTRE · MIEUX PROGRESSER</p><h2>Un parcours construit avec le joueur.</h2></div>
        <div className="player-journey-grid">{playerSteps.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><b>{step.lead}</b><p>{step.text}</p></article>)}</div>
      </section>

      <section className="player-accompaniment section-pad">
        <div className="player-program-heading"><p className="eyebrow">CE QUE COMPREND TON ACCOMPAGNEMENT YAA PLAYER</p><h2>Du premier échange au bilan d’évolution.</h2></div>
        <div className="player-accompaniment-list">{accompaniment.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        <p className="player-program-motto">Chez YAA PLAYER, le joueur ne suit pas un programme standard : l’accompagnement évolue avec lui.</p>
      </section>

      <section className="player-pathways section-pad">
        <div className="player-program-heading"><p className="eyebrow">QUEL ACCOMPAGNEMENT POUR TON PARCOURS ?</p><h2>Trois parcours selon tes besoins.</h2><p>Chaque joueur est différent. L’accompagnement est proposé après le bilan YAA PLAYER, en fonction de tes besoins, de tes objectifs et de ton parcours — pas de ton niveau de football.</p></div>
        <div className="player-pathway-grid">{pathways.map((path) => <article key={path.name}><h3>{path.name}</h3><b>{path.duration}</b><p>{path.text}</p></article>)}</div>
        <p className="player-included"><b>Ce qui est inclus dans chaque parcours</b><br />1 séance par semaine • Terrain ou visio selon les besoins • Bilan d’évolution • Paiement en plusieurs fois possible</p>
      </section>

      <section className="player-whole-person section-pad">
        <div className="player-program-heading"><p className="eyebrow">POURQUOI YAA PLAYER ?</p><h2>Parce qu’un jeune joueur ne se résume pas à ses performances.</h2><p>YAA PLAYER prend en compte le joueur dans sa globalité :</p></div>
        <div className="player-dimensions">{playerDimensions.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        <p className="player-program-closing">L’objectif n’est pas de fabriquer un joueur selon un modèle. L’objectif est de l’aider à mieux se connaître, progresser et devenir acteur de son propre parcours.</p>
      </section>

      <section className="player-inspiration section-pad">
        <div><p className="eyebrow">INSTANT INSPIRATION YAA PLAYER</p><h2>Un autre regard. Une expérience vécue. Un nouvel élan.</h2></div>
        <div><p>Parfois, quelques mots d’une personne qui a vécu le football peuvent faire la différence.</p><p>Selon les besoins et le moment du parcours, YAA PLAYER peut proposer au jeune un échange ponctuel avec un footballeur, ancien joueur, entraîneur ou professionnel du football.</p><p>Un moment pour partager une expérience, poser des questions, prendre du recul et nourrir sa motivation.</p><small>Les Instants Inspiration sont proposés lorsque cela est pertinent et restent soumis à la disponibilité des intervenants.</small></div>
      </section>

      <section className="player-parents section-pad">
        <div className="player-program-heading"><p className="eyebrow">LES PARENTS, PARTENAIRES DU PARCOURS</p><h2>Accompagner le parent pour qu’il puisse mieux accompagner son jeune.</h2></div>
        <div className="player-parent-copy"><p>Vous êtes parent d’un jeune joueur et vous souhaitez un accompagnement plus personnalisé pour l’aider à progresser, prendre confiance ou mieux vivre les exigences du football ? Vous pouvez initier la demande de bilan découverte. Nous prenons le temps d’écouter votre enfant et vos attentes pour définir ensemble les priorités. Le jeune reste au centre de son projet, dans le respect de son rythme et de sa parole.</p><p>Les parents ont une place importante pour encourager, soutenir et accompagner, sans ajouter de pression supplémentaire.</p><p><b>INCLUS DANS LE BILAN DÉCOUVERTE :</b> le recueil des attentes du jeune et de sa famille, pour comprendre le contexte et choisir ensemble les priorités.</p><p><b>EN OPTION, AVEC SUPPLÉMENT :</b> un accompagnement parental dédié pour clarifier les attentes, mieux communiquer avec le jeune et l’aider à traverser les périodes de doute, de frustration ou de pression. Il est facultatif, disponible à distance en français et en anglais ; son contenu et son tarif sont annoncés avant tout engagement. Le jeune reste au centre de son projet, dans le respect de sa parole et du cadre de confidentialité convenu.</p></div>
      </section>

      <section className="player-bio section-pad">
        <div><p className="eyebrow">QUI T’ACCOMPAGNE ?</p><h2>Yakhouba MANE</h2><p className="player-bio-role">Fondateur de YAA PLAYER</p><p>Ancien joueur et éducateur de football, j’accompagne depuis de nombreuses années des jeunes dans leur développement.</p><p>Mon expérience du terrain, de la formation et de l’encadrement m’a appris une chose essentielle : deux joueurs du même âge et du même niveau peuvent avoir des besoins complètement différents.</p><p>Avec YAA PLAYER, mon rôle n’est pas de décider à la place du jeune de ce qu’il doit devenir. Je l’aide à mieux se connaître, comprendre son jeu, identifier ses priorités, développer ses ressources et devenir progressivement autonome.</p></div>
        <div className="player-qualifications"><p className="eyebrow">MES EXPÉRIENCES ET QUALIFICATIONS</p>{qualifications.map((item) => <p key={item}>{item}</p>)}</div>
      </section>

      <section className="player-final-cta section-pad"><p className="eyebrow">PRÊT À FAIRE LE POINT SUR TON PARCOURS ?</p><h2>Le joueur de demain se construit aujourd’hui.</h2><p>Tout commence par mieux comprendre où tu en es aujourd’hui. Fais ton bilan YAA PLAYER gratuitement et prends le temps d’identifier tes forces, tes difficultés, tes objectifs et tes besoins.</p><button className="button button-dark" type="button" onClick={onStart}>Faire mon bilan gratuit <ArrowUpRight size={17} /></button><small>Chaque jeune avance à son rythme. L’accompagnement évolue en fonction de ses progrès, de ses besoins et de son environnement sportif.</small></section>
    </div>
  );
}
