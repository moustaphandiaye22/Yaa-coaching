import {
  Brain,
  Dumbbell,
  Globe2,
  GraduationCap,
  Heart,
  Search,
  ShieldCheck,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react';
import { funnelLinks } from '../../shared/funnel-links.js';
import { mediaUrl } from '../../shared/site-content.js';
import { defaultCoachJourney, defaultCoachQualifications } from '../../shared/coach-journey.js';

type CoachContent = Record<string, unknown>;
type Experience = { label?: string; title?: string; description?: string };
type JourneyItem = { title?: string; description?: string };

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export default function PlayerCoachSection({ content }: { content: CoachContent }) {
  const paragraphs = Array.isArray(content.paragraphs)
    ? content.paragraphs.map(stringValue).filter(Boolean)
    : [];
  const experiences = Array.isArray(content.experiences)
    ? content.experiences.filter(
        (item): item is Experience =>
          item !== null && typeof item === 'object' && !Array.isArray(item),
      )
    : [];
  const photo = stringValue(content.photo);
  const role = stringValue(content.title).replace(/^Yakhouba\s+Mane\s*[—–-]\s*/i, '');
  const icons = [Target, Brain, Heart];
  const journey: JourneyItem[] = Array.isArray(content.journey)
    ? content.journey.filter(
        (item): item is JourneyItem =>
          item !== null && typeof item === 'object' && !Array.isArray(item),
      )
    : defaultCoachJourney;
  const qualifications = Array.isArray(content.qualifications)
    ? content.qualifications.map(stringValue).filter(Boolean)
    : defaultCoachQualifications;
  const journeyIcons = [Heart, ShieldCheck, UsersRound];
  const qualificationIcons = [Target, Globe2, GraduationCap, Brain, Dumbbell, Trophy, Search];

  return (
    <section
      className="player-coach-section section-pad"
      id="coach"
      aria-labelledby="player-coach-title"
    >
      <figure className="player-coach-photo">
        <img
          src={photo ? mediaUrl(photo) : '/images/yakhouba-mane-coach.jpg'}
          alt="Portrait de Yakhouba MANE"
          loading="lazy"
        />
        {stringValue(content.photoSeal) && (
          <span className="player-coach-photo-seal">{stringValue(content.photoSeal)}</span>
        )}
        {(stringValue(content.photoCaption) || stringValue(content.photoLocation)) && (
          <figcaption>
            {stringValue(content.photoCaption)}
            {stringValue(content.photoCaption) && stringValue(content.photoLocation) && ' · '}
            {stringValue(content.photoLocation)}
          </figcaption>
        )}
      </figure>
      <div className="player-coach-copy">
        {stringValue(content.eyebrow) && <p className="eyebrow">{stringValue(content.eyebrow)}</p>}
        <h1 id="player-coach-title">Yakhouba MANE</h1>
        {role && <p className="player-coach-role">{role}</p>}
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        {stringValue(content.callToAction) && (
          <a className="player-coach-link" href={funnelLinks.coaching}>
            {stringValue(content.callToAction)}
          </a>
        )}
      </div>
      {journey.length > 0 && (
        <div className="player-coach-journey">
          <h2>UNE EXPÉRIENCE DE TERRAIN AU SERVICE DE LA PERSONNE</h2>
          <div className="player-coach-journey-grid">
            {journey.map((item, index) => {
              const Icon = journeyIcons[index % journeyIcons.length];
              return (
                <article key={`${item.title ?? ''}-${index}`}>
                  <span className="player-coach-qualification-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <div>
                    {stringValue(item.title) && <h3>{stringValue(item.title)}</h3>}
                    {stringValue(item.description) && <p>{stringValue(item.description)}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
      {experiences.length > 0 && (
        <div className="player-coach-qualifications">
          <h2>REPÈRES DU PARCOURS</h2>
          <ul>
            {experiences.map((experience, index) => {
              const Icon = icons[index % icons.length];
              return (
                <li key={index}>
                  <span className="player-coach-qualification-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span>
                    {stringValue(experience.label) && (
                      <strong>{stringValue(experience.label)} · </strong>
                    )}
                    {stringValue(experience.title) && (
                      <strong>{stringValue(experience.title)}</strong>
                    )}
                    {stringValue(experience.description) && (
                      <span> {stringValue(experience.description)}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {qualifications.length > 0 && (
        <div className="player-coach-qualifications">
          <h2>EXPÉRIENCES ET QUALIFICATIONS DANS LE FOOTBALL</h2>
          <ul>
            {qualifications.map((qualification, index) => {
              const Icon = qualificationIcons[index % qualificationIcons.length];
              return (
                <li key={`${qualification}-${index}`}>
                  <span className="player-coach-qualification-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span>{qualification}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
