import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  Dumbbell,
  Heart,
  Info,
  RefreshCw,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import SiteHeader from '../../shared/components/SiteHeader.js';
import SiteFooter from '../../shared/components/SiteFooter.js';
import GallerySection from '../gallery/GallerySection.js';
import ReviewsSection from '../reviews/ReviewsSection.js';
import FaqSection from '../faq/FaqSection.js';
import PlayerCoachSection from './PlayerCoachSection.js';
import { mediaUrl } from '../../shared/site-content.js';
import { funnelLinkForService, funnelLinks } from '../../shared/funnel-links.js';
import { usePublicSiteContent } from './usePublicSiteContent.js';

function PublicSite({
  route,
  onNavigate,
  mobileNav,
  setMobileNav,
}: {
  route: string;
  onNavigate: (path: string) => void;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
}) {
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error' | 'info'>('info');
  const {
    heroValue,
    heroAvailable,
    contentFor,
    extraContent,
    serviceContent,
    mediaFor,
    contentStatus,
    reloadContent,
  } = usePublicSiteContent();
  const page = route === '/' ? 'home' : route.slice(1);
  const pageTitles: Record<string, string> = {
    home: 'Accueil',
    accompagnements: 'Nos accompagnements',
    methode: 'Notre méthode',
    coach: 'Votre coach',
    galerie: 'Photos & vidéos',
    avis: 'Avis & questions fréquentes',
    questionnaire: 'Entretien découverte',
  };
  const pageTitle = pageTitles[page] ?? pageTitles.home;
  const openStreetMapEmbedUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=2.01%2C47.17%2C2.13%2C47.27&layer=mapnik&marker=47.221%2C2.069';
  const ServicesTitle = page === 'accompagnements' ? 'h1' : 'h2';
  const show = (...pages: string[]) => pages.includes(page);
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotice(message);
    setNoticeType(type);
  };
  const methodContent = contentFor('methode');
  const playerContent = contentFor('player');
  const coachContent = contentFor('coach');
  const zonesContent = contentFor('zones');
  const contactContent = contentFor('contacts');
  const zonesContactEmail =
    typeof zonesContent.contactEmail === 'string' && zonesContent.contactEmail.trim()
      ? zonesContent.contactEmail.trim()
      : typeof contactContent.email === 'string'
        ? contactContent.email.trim()
        : '';
  const servicesBlock = contentFor('services');
  const servicesSection = (servicesBlock.section ?? {}) as Record<string, unknown>;
  const closingContent = contentFor('closing');
  const closingValue = (key: string, fallback: string) => {
    const value = closingContent[key];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };

  useEffect(() => {
    document.title = `${pageTitle} — YAA COACHING`;
  }, [pageTitle]);

  return (
    <>
      <SiteHeader
        activeRoute={route}
        mobileNavOpen={mobileNav}
        onToggle={() => setMobileNav(!mobileNav)}
        onNavigate={onNavigate}
      />
      <main id="top" className={`public-page public-page-${page}`}>
        {show('home', 'accompagnements', 'methode', 'coach') && contentStatus !== 'ready' && (
          <section className="content-state section-pad" role="status" aria-live="polite">
            <div className="content-state-card">
              <span className="content-state-icon">
                <RefreshCw size={22} />
              </span>
              <div>
                <p className="eyebrow">CONTENU DU SITE</p>
                <h1>
                  {contentStatus === 'loading'
                    ? 'Nous préparons cette page.'
                    : 'Contenu momentanément indisponible.'}
                </h1>
                <p>
                  {contentStatus === 'loading'
                    ? 'Les informations sont en cours de chargement.'
                    : 'La connexion aux informations du site a échoué. Vous pouvez réessayer dans un instant.'}
                </p>
                {contentStatus === 'error' && (
                  <button className="button button-dark" type="button" onClick={reloadContent}>
                    Réessayer <RefreshCw size={16} />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
        {show('home') && contentStatus === 'ready' && !heroAvailable && (
          <section className="content-state section-pad" role="status">
            <div className="content-state-card">
              <span className="content-state-icon">
                <Info size={22} />
              </span>
              <div>
                <p className="eyebrow">ACCUEIL</p>
                <h1>La présentation de l’accueil est momentanément indisponible.</h1>
                <p>
                  Les autres informations du site restent consultables. Revenez bientôt pour
                  retrouver cette présentation.
                </p>
              </div>
            </div>
          </section>
        )}
        {show('home') && contentStatus === 'ready' && heroAvailable && (
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-dot" /> {heroValue('eyebrow')}
              </p>
              <h1>
                {heroValue('title')}
                <br />
                <em>{heroValue('accent')}</em>
              </h1>
              <p className="hero-lead">{heroValue('description')}</p>
              <p className="hero-loc">{heroValue('location')}</p>
              <div className="hero-actions">
                <a className="button button-dark" href={funnelLinks.offers}>
                  {heroValue('buttonLabel')} <ArrowUpRight size={16} />
                </a>
                <span className="hero-caption">
                  Tous niveaux <i /> À chaque étape de la vie
                </span>
              </div>
              <div className="hero-shortcuts">
                <a href={funnelLinks.coaching}>
                  <span>Reprendre une activité</span> <ArrowUpRight size={14} />
                </a>
                <a href={funnelLinks.player}>
                  <span>Progresser au football</span> <ArrowUpRight size={14} />
                </a>
                <a href={funnelLinks.autonomie}>
                  <span>Préserver l’autonomie</span> <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
            <div className="hero-visual">
              {mediaFor('YAA COACHING') ? (
                <div
                  className="hero-image hero-image-loaded"
                  style={{
                    backgroundImage: `linear-gradient(145deg,rgba(35,45,36,.05),rgba(72,65,46,.2)),url("${mediaUrl(mediaFor('YAA COACHING')!.url)}")`,
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
                <Sparkles size={13} aria-hidden="true" />
                <span>COMPRENDRE</span>
                <Sparkles size={13} aria-hidden="true" />
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
              <span>
                BOUGER AVEC CONFIANCE <i /> COMPRENDRE SON FONCTIONNEMENT <i /> CHOISIR SES
                OBJECTIFS <i /> DEVENIR AUTONOME
              </span>
            </div>
          </section>
        )}
        {show('home') &&
          contentStatus === 'ready' &&
          extraContent.map((block) => (
            <section className="published-content-block section-pad" key={block.key}>
              <p className="eyebrow">YAA COACHING</p>
              <h2>{block.title}</h2>
              <p>{block.body}</p>
            </section>
          ))}
        {show('home', 'accompagnements') && contentStatus === 'ready' && (
          <section className="services-section section-pad" id="accompagnements">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{String(servicesSection.eyebrow ?? '')}</p>
                <ServicesTitle>
                  {String(servicesSection.title ?? '')}
                  <br />
                  <em>{String(servicesSection.accent ?? '')}</em>
                </ServicesTitle>
              </div>
              <p className="section-intro">{String(servicesSection.introduction ?? '')}</p>
            </div>
            <div className="service-grid">
              {serviceContent.map((s, i) => {
                const photo = mediaFor(s.name);
                const serviceImage = s.image && (s.image.startsWith('/') || /^https?:\/\//i.test(s.image))
                  ? s.image
                  : '';
                return (
                  <article key={s.name} id={s.slug} className={`service-card ${s.accent}`}>
                    <div className="service-image-wrap">
                      {photo || serviceImage ? (
                        <img
                          src={mediaUrl(photo?.url ?? serviceImage)}
                          alt={photo?.alt ?? s.alt}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={`service-image-placeholder ${s.accent}`}
                          aria-hidden="true"
                        />
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
                      <h3>{s.heading || s.name}</h3>
                      <p>{s.presentation || s.body}</p>
                      {(s.offerHighlight || s.offerDetails) && (
                        <p className="service-offer-details">
                          {s.offerHighlight && <strong>{s.offerHighlight}</strong>}
                          {s.offerDetails && (
                            <>
                              {s.offerHighlight && !/^\s/.test(s.offerDetails) ? ' ' : ''}
                              {s.offerDetails.trimStart()}
                            </>
                          )}
                        </p>
                      )}
                      <div className="service-foot">
                        <span>{s.zone}</span>
                        <a href={funnelLinkForService(s.slug)}>
                          {s.link}
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
        {show('methode') && contentStatus === 'ready' && (
          <section className="pillars section-pad">
            <div className="pillar-top">
              <p className="eyebrow">{String(methodContent.pillarsEyebrow ?? '')}</p>
              <h1>
                {String(methodContent.pillarsTitle ?? '')}
                <br />
                <em>{String(methodContent.pillarsAccent ?? '')}</em>
              </h1>
              <p>{String(methodContent.pillarsIntroduction ?? '')}</p>
            </div>
            <div className="pillar-list">
              {Array.isArray(methodContent.pillars) &&
                methodContent.pillars.map((item, index) => {
                  const pillar = item as { title?: string; description?: string };
                  const icons = [Sparkles, Heart, Target];
                  const Icon = icons[index % icons.length] ?? Sparkles;
                  return (
                    <article key={pillar.title ?? index}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{pillar.title}</h3>
                        <p>{pillar.description}</p>
                      </div>
                      <Icon />
                    </article>
                  );
                })}
            </div>
          </section>
        )}
        {show('accompagnements') && contentStatus === 'ready' && (
          <section className="player-feature section-pad">
            <div className="player-visual">
              {mediaFor('YAA PLAYER') ? (
                <img
                  src={mediaUrl(mediaFor('YAA PLAYER')!.url)}
                  alt={mediaFor('YAA PLAYER')!.alt}
                  loading="lazy"
                />
              ) : (
                <div
                  className="editorial-image-placeholder player-placeholder"
                  aria-hidden="true"
                />
              )}
              <div className="player-label">
                <span>{String(playerContent.serviceLabel ?? 'YAA PLAYER')}</span>
                <small>{String(playerContent.mediaLabel ?? '')}</small>
              </div>
              <div className="player-number">02</div>
            </div>
            <div className="player-copy">
              <p className="eyebrow">
                <span className="eyebrow-dot ochre-dot" /> {String(playerContent.eyebrow ?? '')}
              </p>
              <h2 className="copy-preserve-lines">{String(playerContent.title ?? '')}</h2>
              <p>{String(playerContent.description ?? '')}</p>
              <p>{String(playerContent.audience ?? '')}</p>
              <div className="player-tags">
                {Array.isArray(playerContent.tags) &&
                  playerContent.tags.map((tag) => <span key={String(tag)}>{String(tag)}</span>)}
              </div>
              <a
                className="text-link"
                href={funnelLinks.player}
              >
                {String(playerContent.callToAction ?? '')} <ArrowUpRight size={16} />
              </a>
              <small className="small-note">{String(playerContent.note ?? '')}</small>
            </div>
          </section>
        )}
        {show('methode') && contentStatus === 'ready' && (
          <section className="method-section section-pad" id="methode">
            <div className="method-heading">
              <p className="eyebrow">{String(methodContent.methodEyebrow ?? '')}</p>
              <h2>
                {String(methodContent.methodTitle ?? '')}
                <br />
                <em>{String(methodContent.methodAccent ?? '')}</em>
              </h2>
              <p>{String(methodContent.methodDescription ?? '')}</p>
            </div>
            <div className="method-steps">
              {Array.isArray(methodContent.steps) &&
                methodContent.steps.map((item, index) => {
                  const step = item as { title?: string; description?: string };
                  return (
                    <article key={step.title ?? index}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                      <ArrowUpRight size={17} />
                    </article>
                  );
                })}
            </div>
          </section>
        )}
        {show('coach') && contentStatus === 'ready' && (
          <PlayerCoachSection content={coachContent} />
        )}
        {show('accompagnements') && contentStatus === 'ready' && (
          <section className="zones-section section-pad">
            <div className="zones-left">
              <p className="eyebrow">{String(zonesContent.eyebrow ?? '')}</p>
              <h2>
                {String(zonesContent.title ?? '')}
                <br />
                <em>{String(zonesContent.accent ?? '')}</em>
              </h2>
              <p>{String(zonesContent.introduction ?? '')}</p>
              {zonesContactEmail && (
                <a className="text-link" href={`mailto:${zonesContactEmail}`}>
                  {String(zonesContent.contactLabel ?? '')} <ArrowUpRight size={15} />
                </a>
              )}
            </div>
            <div className="zones-list">
              {Array.isArray(zonesContent.items) &&
                zonesContent.items.map((item, index) => {
                  const zone = item as { title?: string; description?: string };
                  return (
                    <article key={zone.title ?? index}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{zone.title}</h3>
                        <p>{zone.description}</p>
                      </div>
                      <ArrowUpRight size={16} />
                    </article>
                  );
                })}
              <div className="service-area-map">
                <div className="service-area-map-heading">
                  <b>Zone d’intervention autour de Vierzon</b>
                  <a
                    href="https://www.openstreetmap.org/?mlat=47.221&mlon=2.069#map=13/47.221/2.069"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ouvrir OpenStreetMap <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
                <iframe
                  title="Carte OpenStreetMap de Vierzon et des alentours"
                  src={openStreetMapEmbedUrl}
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        )}
        {show('galerie') && <GallerySection />}
        {show('avis') && <ReviewsSection onNotice={notify} />}
        {show('avis') && <FaqSection />}
        {show(
          'home',
          'accompagnements',
          'methode',
          'galerie',
          'avis',
        ) && (
          <section className="closing-cta" aria-labelledby="public-closing-title">
            <p className="eyebrow">{closingValue('eyebrow', 'UN PREMIER ÉCHANGE')}</p>
            <h2 className="copy-preserve-lines" id="public-closing-title">
              {closingValue('title', 'Votre premier pas vers le changement')}
              <br />
              <em>{closingValue('accent', 'commence ici.')}</em>
            </h2>
            <a
              className="button button-cream"
              href={funnelLinks.offers}
            >
              {closingValue('buttonLabel', 'Faire le premier pas')} <ArrowUpRight size={16} />
            </a>
            <span className="closing-star" aria-hidden="true">
              <Sparkles size={38} strokeWidth={1.2} />
            </span>
          </section>
        )}
      </main>
      <SiteFooter />
      {notice && (
        <div
          className={`toast toast-${noticeType}`}
          role={noticeType === 'error' ? 'alert' : 'status'}
        >
          {noticeType === 'error' ? (
            <CircleAlert size={18} />
          ) : noticeType === 'success' ? (
            <CircleCheck size={18} />
          ) : (
            <Info size={18} />
          )}
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
