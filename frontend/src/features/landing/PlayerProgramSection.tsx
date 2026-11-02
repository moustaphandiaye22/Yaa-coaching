import { ArrowRight, Check, Lightbulb, UsersRound } from 'lucide-react';
import { funnelLinks } from '../../shared/funnel-links.js';
import { defaultPlayerProgram } from '../../shared/player-program.js';

type Content = Record<string, unknown>;
type Offer = { title: string; price: string; description: string };

const journey = [
  ['Me connaître', 'Repérer mes forces, mes besoins et mon environnement sportif.'],
  ['Comprendre', 'Identifier ce qui m’aide et ce qui me freine.'],
  ['Progresser', 'Travailler les priorités définies avec le jeune.'],
  ['Optimiser', 'Mieux mobiliser mes ressources dans ma discipline.'],
  ['Devenir autonome', 'Poursuivre ma progression avec confiance.'],
];

export default function PlayerProgramSection({ content }: { content: Content }) {
  const offers = Array.isArray(content.offers)
    ? (content.offers as Offer[])
    : defaultPlayerProgram.offers;
  const intro =
    typeof content.programmeDescription === 'string'
      ? content.programmeDescription
      : defaultPlayerProgram.programmeDescription;
  const inspiration =
    typeof content.inspirationDescription === 'string'
      ? content.inspirationDescription
      : defaultPlayerProgram.inspirationDescription;
  const parents =
    typeof content.parentsDescription === 'string'
      ? content.parentsDescription
      : defaultPlayerProgram.parentsDescription;

  return (
    <div className="player-program-page">
      <section className="player-program-hero section-pad">
        <p className="eyebrow">YAA PLAYER · JEUNES SPORTIFS · 9–18 ANS</p>
        <h1>
          Optimiser sa <em>performance mentale</em>
        </h1>
        <p className="player-program-lead">{intro}</p>
        <a className="button button-dark" href="#offres-player">
          Voir les offres <ArrowRight size={16} />
        </a>
      </section>

      <section className="player-program-journey section-pad">
        <div className="player-program-heading">
          <p className="eyebrow">UN PARCOURS QUI ÉVOLUE AVEC TOI</p>
          <h2>De la connaissance de soi à l’autonomie</h2>
        </div>
        <ol className="player-program-steps">
          {journey.map(([title, description], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="player-program-offers section-pad" id="offres-player">
        <div className="player-program-heading">
          <p className="eyebrow">APRÈS LE BILAN DÉCOUVERTE</p>
          <h2>Deux accompagnements selon tes besoins</h2>
        </div>
        <div className="player-program-offer-grid">
          {offers.map((offer) => (
            <article key={offer.title}>
              <span>{offer.title}</span>
              <strong className="player-program-price">{offer.price}</strong>
              <p>{offer.description}</p>
            </article>
          ))}
        </div>
        <p className="player-program-format">
          1 séance individuelle d’une heure par semaine · 3 mois minimum · présentiel ou distance ·
          français ou anglais
        </p>
        <p className="player-program-options">
          Options possibles : analyse vidéo, échange avec le club et accompagnement parental.
          Modalités, tarif et frais éventuels annoncés avant tout engagement.
        </p>
      </section>

      <section className="player-program-extras section-pad">
        <article>
          <span className="player-program-extra-icon">
            <Lightbulb size={20} />
          </span>
          <div>
            <h2>Instant inspiration</h2>
            <p>{inspiration}</p>
          </div>
        </article>
        <article>
          <span className="player-program-extra-icon">
            <UsersRound size={20} />
          </span>
          <div>
            <h2>La place des parents</h2>
            <p>{parents}</p>
            <p className="player-program-parent-note">
              Le jeune reste au centre de son projet et des décisions.
            </p>
          </div>
        </article>
      </section>

      <section className="player-program-cta section-pad">
        <p className="eyebrow">BILAN DÉCOUVERTE GRATUIT</p>
        <h2>Faisons le point sur ton parcours</h2>
        <a className="button button-dark" href={funnelLinks.player}>
          Faire mon bilan gratuit <Check size={16} />
        </a>
      </section>
    </div>
  );
}
