import { ArrowUpRight } from 'lucide-react';

const bilanUrl = 'https://yanmane29.systeme.io/dabd2704';

const offers = [
  {
    title: 'Bouger',
    text: 'Mobiliser le corps selon les capacités du jour : gestes du quotidien, coordination, équilibre et mouvements adaptés.',
  },
  {
    title: 'Stimuler',
    text: 'Solliciter l’attention, la mémoire et la curiosité à travers des activités qui ont du sens pour la personne.',
  },
  {
    title: 'Rassurer et créer du lien',
    text: 'Prendre le temps d’écouter, accueillir les émotions, préserver des repères et retrouver des moments de plaisir partagé.',
  },
];

const steps = [
  'Un bilan découverte pour connaître la personne et ses attentes.',
  'Un entretien avec elle et, si elle le souhaite, son proche.',
  'Un accompagnement adapté : bouger, stimuler, rassurer et créer du lien.',
  'Des points réguliers pour ajuster le rythme et apprécier ce qui devient plus facile.',
];

export default function AutonomieProgramSection({
  onStartQuestionnaire,
}: {
  onStartQuestionnaire: () => void;
}) {
  return (
    <div className="autonomie-program" id="autonomie-details">
      <section className="autonomie-hero section-pad">
        <p className="eyebrow">YAA AUTONOMIE · À DOMICILE · VIERZON ET ALENTOURS</p>
        <h2>Vous vivez loin de votre parent ? Un accompagnement de proximité à Vierzon.</h2>
        <p className="autonomie-lead">
          Votre parent vit à Vierzon ou aux alentours et vous habitez dans une autre ville, une
          autre région ou à l’étranger ? YAA AUTONOMIE lui propose un accompagnement personnalisé
          à domicile pour bouger, stimuler sa mémoire, renforcer sa confiance et garder le lien, à
          son rythme.
        </p>
        <a className="button button-dark" href={bilanUrl} target="_blank" rel="noreferrer">
          Parlons des besoins de votre parent <ArrowUpRight size={17} />
        </a>
        <p className="autonomie-reassurance">
          Vous pouvez initier la demande, même à distance. Questionnaire puis entretien gratuit,
          sans engagement. L’accompagnement se construit avec votre parent et avec son accord.
        </p>
        <button className="button button-outline" type="button" onClick={onStartQuestionnaire}>
          Remplir le questionnaire YAA AUTONOMIE <ArrowUpRight size={16} />
        </button>
      </section>

      <section className="autonomie-distance section-pad">
        <div className="autonomie-section-heading">
          <p className="eyebrow">UN ACCOMPAGNEMENT DE PROXIMITÉ</p>
          <h2>Être présent pour votre parent, même quand vous êtes loin</h2>
        </div>
        <div>
          <p>
            La distance ne vous permet pas toujours d’être là aussi souvent que vous le souhaiteriez.
            Vous cherchez un interlocuteur de proximité pour accompagner votre parent dans des
            activités adaptées et des moments d’échange.
          </p>
          <p>
            YAA AUTONOMIE s’adresse aux personnes âgées ou à mobilité réduite et à leurs familles,
            notamment lorsque les enfants vivent hors de Vierzon et de ses alentours. Les visites
            ont lieu au domicile du parent, dans le secteur de Vierzon.
          </p>
          <p>
            <b>Votre parent reste au centre des décisions.</b> Ses envies, ses capacités et son
            accord guident l’accompagnement. Vous pouvez participer à l’entretien à distance s’il
            le souhaite ; les modalités des échanges avec les proches sont définies ensemble, dans
            le respect de sa vie privée.
          </p>
        </div>
      </section>

      <section className="autonomie-offer section-pad">
        <div className="autonomie-section-heading">
          <p className="eyebrow">CE QUE COMPREND VOTRE ACCOMPAGNEMENT YAA AUTONOMIE</p>
          <h2>Des activités adaptées à la personne.</h2>
        </div>
        <div className="autonomie-offer-grid">
          {offers.map((offer, index) => (
            <article key={offer.title}>
              <span>0{index + 1}</span>
              <h3>{offer.title}</h3>
              <p>{offer.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="autonomie-person section-pad">
        <p className="eyebrow">UNE PERSONNE, DES CHOIX, UN RYTHME</p>
        <h2>La personne reste au centre de son accompagnement.</h2>
        <p>
          La perte d’autonomie, la fatigue ou le besoin d’aide ne résument pas une personne. Son
          vécu, ses envies, sa dignité et sa place dans les décisions comptent.
        </p>
        <p>
          Nous distinguons ce qu’elle souhaite pour elle-même, ce que sa famille attend et ce qui
          est réalisable ensemble. Aucune comparaison ni mise en échec imposée.
        </p>
      </section>

      <section className="autonomie-path section-pad">
        <div className="autonomie-section-heading">
          <p className="eyebrow">UN PARCOURS ADAPTÉ À LA PERSONNE</p>
          <h2>Un accompagnement qui respecte son rythme.</h2>
        </div>
        <p>
          Parcours initial de <b>12 semaines</b>, avec <b>2 visites par semaine de 45 à 60 minutes</b>,
          un bilan initial et un bilan final. Le contenu est ajusté aux envies, capacités et besoins
          de la personne. Tarif personnalisé et éventuels frais de déplacement annoncés après le
          bilan découverte gratuit, avant tout engagement.
        </p>
      </section>

      <section className="autonomie-how section-pad">
        <div className="autonomie-section-heading">
          <p className="eyebrow">COMMENT CELA SE PASSE ?</p>
          <h2>Quatre étapes, construites avec votre parent.</h2>
        </div>
        <ol>
          {steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className="autonomie-experience section-pad">
        <div className="autonomie-section-heading">
          <p className="eyebrow">UNE EXPÉRIENCE ATTENTIVE AUX FRAGILITÉS</p>
          <h2>Écoute, adaptation et présence de proximité.</h2>
        </div>
        <div>
          <p>
            Yakhouba Mane, coach physique et mental : près de 10 ans d’expérience comme coach au
            sein d’une structure de santé mentale. Une pratique nourrie par l’écoute, la
            bienveillance, la bientraitance et l’adaptation des activités.
          </p>
          <p>
            <b>Sapeur-pompier volontaire depuis plus de 10 ans</b>, j’ai développé le sens de
            l’observation, le calme face aux situations difficiles et une attention particulière
            aux personnes en situation de fragilité. Cette expérience nourrit ma vigilance pendant
            les activités et ma capacité à réagir avec sang-froid face à un imprévu. Pour les
            familles qui vivent loin, elle constitue un repère de confiance dans le choix d’un
            accompagnant de proximité.
          </p>
          <p>
            <b>Président de l’association humanitaire « 2 Bouts – Ici et ailleurs »</b>, je porte
            également un engagement de solidarité, de partage et de respect de chacun. Ces valeurs
            nourrissent ma façon de cheminer aux côtés des personnes.
          </p>
          <p className="autonomie-health-note">
            Le coaching complète les aides existantes et ne remplace ni les soins ni
            l’accompagnement d’un professionnel de santé. Les adaptations et le rythme sont
            précisés avant tout engagement.
          </p>
        </div>
      </section>

      <section className="autonomie-final-cta section-pad">
        <p className="eyebrow">UN PREMIER ÉCHANGE, SANS ENGAGEMENT</p>
        <h2>Faire le point pour votre parent.</h2>
        <a className="button button-dark" href={bilanUrl} target="_blank" rel="noreferrer">
          Faire le point pour mon parent <ArrowUpRight size={17} />
        </a>
        <button className="button button-outline" type="button" onClick={onStartQuestionnaire}>
          Remplir le questionnaire YAA AUTONOMIE <ArrowUpRight size={16} />
        </button>
        <p>
          <a href="mailto:yanmane29@gmail.com">yanmane29@gmail.com</a>
          <span aria-hidden="true"> · </span>
          <a href="tel:+33652281155">06 52 28 11 55</a>
        </p>
      </section>
    </div>
  );
}
