import { useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  CircleCheck,
  Dumbbell,
  Heart,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import SiteHeader from '../../shared/components/SiteHeader.js';
import SiteFooter from '../../shared/components/SiteFooter.js';
import GallerySection from '../gallery/GallerySection.js';
import ReviewsSection from '../reviews/ReviewsSection.js';
import FaqSection from '../faq/FaqSection.js';
import QuestionnaireSection from '../questionnaire/QuestionnaireSection.js';
import { API } from '../../shared/site-content.js';
import { usePublicSiteContent } from './usePublicSiteContent.js';

function PublicSite({
  mobileNav,
  setMobileNav,
}: {
  onNavigate: (p: string) => void;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
}) {
  const [notice, setNotice] = useState('');
  const [initialSituation, setInitialSituation] = useState('');
  const { heroValue, extraContent, serviceContent, mediaFor } = usePublicSiteContent();
  const selectAccompaniment = (situation: string) => setInitialSituation(situation);

  return (
    <>
      <SiteHeader
        mobileNavOpen={mobileNav}
        onToggle={() => setMobileNav(!mobileNav)}
        onNavigate={() => setMobileNav(false)}
      />
      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot" />{' '}
              {heroValue('eyebrow', 'COACHING · FOOTBALL · AUTONOMIE')}
            </p>
            <h1>
              {heroValue('title', 'Accompagnement physique & mental.')}
              <br />
              <em>{heroValue('accent', 'À votre rythme.')}</em>
            </h1>
            <p className="hero-lead">
              {heroValue(
                'description',
                'Accompagner, c’est cheminer à vos côtés en tenant compte de vos besoins. Que vous soyez sportif ou non, commencez à vous stimuler ou reprenez une activité adaptée à vos capacités, à vos besoins et à votre rythme.',
              )}
            </p>
            <p className="hero-loc">
              {heroValue(
                'location',
                'YAA COACHING à Vierzon et alentours ; YAA PLAYER sans limite géographique.',
              )}
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#accompagnements">
                {heroValue('buttonLabel', 'Trouver mon accompagnement')} <ArrowUpRight size={16} />
              </a>
              <span className="hero-caption">
                Tous niveaux <i /> À chaque étape de la vie
              </span>
            </div>
            <div className="hero-shortcuts">
              <a href="#coaching">
                Reprendre une activité <ArrowUpRight size={14} />
              </a>
              <a href="#player">
                Progresser au football <ArrowUpRight size={14} />
              </a>
              <a href="#autonomie">
                Préserver l’autonomie <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
          <div className="hero-visual">
            {mediaFor('YAA COACHING') ? (
              <div
                className="hero-image hero-image-loaded"
                style={{
                  backgroundImage: `linear-gradient(145deg,rgba(35,45,36,.05),rgba(72,65,46,.2)),url("${API}${mediaFor('YAA COACHING')!.url}")`,
                }}
                role="img"
                aria-label={mediaFor('YAA COACHING')!.alt}
              />
            ) : (
              <div className="hero-image" aria-hidden="true" />
            )}
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-stamp">
              <span>ÉCOUTER</span>
              <i>✳</i>
              <span>COMPRENDRE</span>
              <i>✳</i>
              <span>AVANCER</span>
            </div>
            <div className="hero-note">
              <span className="note-icon">
                <Heart size={15} />
              </span>
              <span>
                Corps & esprit<small>BOUGER AVEC CONFIANCE</small>
              </span>
              <ArrowUpRight size={16} />
            </div>
            <div className="hero-index">
              01 <span>— 03</span>
            </div>
          </div>
          <div className="hero-bottom">
            <span>01 / 04</span>
            <span>
              BOUGER AVEC CONFIANCE <i /> COMPRENDRE SON FONCTIONNEMENT <i /> CHOISIR SES OBJECTIFS{' '}
              <i /> DEVENIR AUTONOME
            </span>
            <a href="#accompagnements" aria-label="Défiler vers les accompagnements">
              <ArrowDown size={15} />
            </a>
          </div>
        </section>
        {extraContent.map((block) => (
          <section className="published-content-block section-pad" key={block.key}>
            <p className="eyebrow">YAA COACHING</p>
            <h2>{block.title}</h2>
            <p>{block.body}</p>
          </section>
        ))}
        <section className="services-section section-pad" id="accompagnements">
          <div className="section-heading">
            <div>
              <p className="eyebrow">UN ACCOMPAGNEMENT QUI VOUS RESSEMBLE</p>
              <h2>
                Trois portes.
                <br />
                <em>Un même élan.</em>
              </h2>
            </div>
            <p className="section-intro">
              Pas besoin d’être sportif pour commencer. Votre point de départ, vos capacités et vos
              besoins guident chaque étape de l’accompagnement.
            </p>
          </div>
          <div className="service-grid">
            {serviceContent.map((s, i) => {
              const photo = mediaFor(s.name);
              return (
                <article key={s.name} id={s.slug} className={`service-card ${s.accent}`}>
                  <div className="service-image-wrap">
                    {photo ? (
                      <img src={`${API}${photo.url}`} alt={photo.alt} loading="lazy" />
                    ) : (
                      <div className={`service-image-placeholder ${s.accent}`} aria-hidden="true" />
                    )}
                    <span className="image-count">0{i + 1} / 03</span>
                    <span className="service-icon">
                      {i === 0 ? (
                        <Dumbbell size={18} />
                      ) : i === 1 ? (
                        <Target size={18} />
                      ) : (
                        <Heart size={18} />
                      )}
                    </span>
                  </div>
                  <div className="service-content">
                    <p className="eyebrow">
                      {s.name} <span>·</span> {s.tag}
                    </p>
                    <h3>{s.heading}</h3>
                    <p>{s.body}</p>
                    <div className="service-foot">
                      <span>{s.zone}</span>
                      <a
                        href="#questionnaire"
                        onClick={() =>
                          selectAccompaniment(
                            i === 0
                              ? 'Commencer / reprendre une activité et développer mes ressources'
                              : i === 1
                                ? 'Être accompagné dans mon parcours de jeune footballeur'
                                : 'Préserver mon autonomie au quotidien',
                          )
                        }
                      >
                        {s.link}
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="pillars section-pad">
          <div className="pillar-top">
            <p className="eyebrow">YAA COACHING · CORPS & ESPRIT</p>
            <h2>
              Écouter. Comprendre.
              <br />
              <em>Avancer.</em>
            </h2>
            <p>Un chemin qui commence là où vous en êtes.</p>
          </div>
          <div className="pillar-list">
            <article>
              <span>01</span>
              <div>
                <h3>Développer ses capacités</h3>
                <p>
                  Remettre le corps en mouvement, à son rythme. Développer sa force, son endurance
                  et sa mobilité pour retrouver le plaisir d’agir.
                </p>
              </div>
              <Sparkles />
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Développer ses ressources mentales</h3>
                <p>
                  Comprendre et gérer ses émotions. Mobiliser la concentration, l’attention et la
                  mémoire. Cultiver la motivation, la discipline, la rigueur et la persévérance.
                </p>
              </div>
              <Heart />
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Choisir ses objectifs</h3>
                <p>
                  Mieux se connaître, identifier ses forces et ses axes d’amélioration, puis fixer
                  des objectifs qui ont du sens. Définir des étapes concrètes, observer son
                  évolution et ajuster le parcours.
                </p>
              </div>
              <Target />
            </article>
          </div>
        </section>
        <section className="player-feature section-pad" id="player">
          <div className="player-visual">
            {mediaFor('YAA PLAYER') ? (
              <img
                src={`${API}${mediaFor('YAA PLAYER')!.url}`}
                alt={mediaFor('YAA PLAYER')!.alt}
                loading="lazy"
              />
            ) : (
              <div className="editorial-image-placeholder player-placeholder" aria-hidden="true" />
            )}
            <div className="player-label">
              <span>YAA PLAYER</span>
              <small>SANS LIMITE GÉOGRAPHIQUE</small>
            </div>
            <div className="player-number">02</div>
          </div>
          <div className="player-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot ochre-dot" /> POUR LES JEUNES FOOTBALLEURS
            </p>
            <h2>
              Franchir un cap
              <br />
              commence par{' '}
              <em>
                mieux
                <br />
                se connaître.
              </em>
            </h2>
            <p>
              Faire grandir tes points forts. Avancer sur ce qui te freine. Jouer avec plus de
              confiance, sans perdre le plaisir.
            </p>
            <p>
              Jeune joueur ou parent, commençons par un échange sur le parcours, les envies et les
              besoins du joueur.
            </p>
            <div className="player-tags">
              <span>PHYSIQUE</span>
              <span>MENTAL</span>
              <span>TECHNIQUE</span>
              <span>TACTIQUE</span>
            </div>
            <a
              className="text-link"
              href="#questionnaire"
              onClick={() =>
                selectAccompaniment('Être accompagné dans mon parcours de jeune footballeur')
              }
            >
              Découvrir ce qui peut faire la différence <ArrowUpRight size={16} />
            </a>
            <small className="small-note">
              Sans limite géographique. Distanciel et présentiel : modalités précisées ensemble.
            </small>
          </div>
        </section>
        <section className="method-section section-pad" id="methode">
          <div className="method-heading">
            <p className="eyebrow">L’APPROCHE LIBRE PENSÉE</p>
            <h2>
              Accompagner,
              <br />
              <em>c’est cheminer.</em>
            </h2>
            <p>
              Nous prenons le temps de comprendre vos besoins, vos envies et vos capacités. Le coach
              écoute, questionne, reformule et propose des activités adaptées. Vous choisissez vos
              objectifs et avancez à votre rythme, avec un accompagnement qui évolue avec vous.
            </p>
          </div>
          <div className="method-steps">
            {[
              [
                '01',
                'Me connaître',
                'Explorer mon histoire, mes habitudes, mes forces et mes difficultés.',
              ],
              ['02', 'M’activer', 'Mettre mon corps et ma tête en mouvement, à mon rythme.'],
              [
                '03',
                'Me renforcer',
                'Développer mes ressources : confiance, émotions, concentration et motivation, pour mieux avancer.',
              ],
              ['04', 'Me diriger', 'Choisir où je veux aller et pourquoi.'],
              [
                '05',
                'Agir & devenir autonome',
                'Passer à l’action et apprendre à poursuivre par moi-même.',
              ],
            ].map(([n, title, body]) => (
              <article key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
                <ArrowUpRight size={17} />
              </article>
            ))}
          </div>
        </section>
        <section className="coach-section section-pad" id="coach">
          <div className="coach-image">
            {mediaFor('YAA COACHING') ? (
              <img
                src={`${API}${mediaFor('YAA COACHING')!.url}`}
                alt={mediaFor('YAA COACHING')!.alt}
                loading="lazy"
              />
            ) : (
              <div className="editorial-image-placeholder coach-placeholder" aria-hidden="true" />
            )}
            <span className="coach-seal">
              À VOS CÔTÉS <i>✳</i> À VOTRE RYTHME
            </span>
            <span className="coach-caption">
              YAA COACHING <small>VIERZON · FRANCE</small>
            </span>
          </div>
          <div className="coach-copy">
            <p className="eyebrow">VOTRE ACCOMPAGNANT</p>
            <h2>
              De l’expérience.
              <br />
              De l’écoute.
              <br />
              <em>À vos côtés.</em>
            </h2>
            <p>
              Mon parcours réunit le football, la préparation mentale et athlétique,
              l’accompagnement en santé mentale et l’engagement humain.
            </p>
            <p>
              Mon rôle est de cheminer à vos côtés : prendre le temps de comprendre vos besoins,
              identifier avec vous vos ressources et construire des objectifs qui vous ressemblent.
            </p>
            <p>
              Je ne décide pas à votre place. Je vous accompagne avec écoute, bienveillance et
              respect de votre rythme, pour vous aider à avancer et à gagner en autonomie.
            </p>
            <a className="text-link" href="#questionnaire">
              Faisons connaissance <ArrowUpRight size={16} />
            </a>
            <div className="experience-grid">
              <div>
                <small>SPORT & PERFORMANCE</small>
                <b>UEFA A</b>
                <span>
                  Préparation mentale et athlétique
                  <br />
                  Plus de 20 ans d’expérience
                </span>
              </div>
              <div>
                <small>ACCOMPAGNEMENT & ÉCOUTE</small>
                <b>15+ ans</b>
                <span>Coach en clinique de santé mentale</span>
              </div>
              <div>
                <small>ENGAGEMENT HUMAIN</small>
                <b>10 ans</b>
                <span>Pompier volontaire · Association 2 Bouts</span>
              </div>
            </div>
          </div>
        </section>
        <QuestionnaireSection initialSituation={initialSituation} onNotice={setNotice} />
        <section className="zones-section section-pad">
          <div className="zones-left">
            <p className="eyebrow">NOS ZONES D’ACCOMPAGNEMENT</p>
            <h2>
              À Vierzon,
              <br />
              <em>à vos côtés.</em>
            </h2>
            <p>YAA PLAYER, où que vous soyez.</p>
            <a className="text-link" href="mailto:yanmane29@gmail.com">
              Une question ? Écrivez-moi <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="zones-list">
            <article>
              <span>01</span>
              <div>
                <h3>YAA COACHING</h3>
                <p>
                  Un accompagnement physique et mental à Vierzon et alentours : reprise d’activité,
                  émotions, concentration, mémoire, confiance et fixation d’objectifs.
                </p>
              </div>
              <ArrowUpRight size={16} />
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>YAA AUTONOMIE</h3>
                <p>
                  À domicile, pour stimuler, rassurer et garder le lien. La zone précise et les
                  déplacements sont convenus lors du premier échange.
                </p>
              </div>
              <ArrowUpRight size={16} />
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>YAA PLAYER</h3>
                <p>
                  Sans limite géographique. Suivi en distanciel ou en présentiel : lieux et
                  modalités sont définis ensemble.
                </p>
              </div>
              <ArrowUpRight size={16} />
            </article>
            <div className="map-art">
              <div className="map-lines" />
              <span className="map-pin">
                <i /> VIERZON
              </span>
              <span className="map-ring ring-a" />
              <span className="map-ring ring-b" />
              <span className="map-coordinate">47°13' N · 2°04' E</span>
            </div>
          </div>
        </section>
        <GallerySection />
        <ReviewsSection onNotice={setNotice} />
        <FaqSection />
        <section className="closing-cta">
          <p className="eyebrow">LE PREMIER PAS VOUS APPARTIENT</p>
          <h2>
            Votre premier pas
            <br />
            vers le changement
            <br />
            <em>commence ici.</em>
          </h2>
          <a className="button button-cream" href="#questionnaire">
            Faisons le premier pas <ArrowUpRight size={16} />
          </a>
          <span className="closing-star">✳</span>
        </section>
      </main>
      <SiteFooter />
      {notice && (
        <div className="toast" role="status">
          <CircleCheck size={18} />
          {notice}
          <button onClick={() => setNotice('')} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}

export default PublicSite;
