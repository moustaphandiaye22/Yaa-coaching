import { useEffect, useState } from 'react';
import { Images, Play, X } from 'lucide-react';
import { API } from '../../shared/site-content.js';
import { requestJson } from '../../shared/api-client.js';

type GalleryMedia = {
  id: string;
  kind: 'PHOTO' | 'VIDEO';
  service: string;
  url: string;
  alt: string;
  caption: string;
  position: number;
};

export default function GallerySection() {
  const [tab, setTab] = useState<'PHOTO' | 'VIDEO'>('PHOTO');
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<GalleryMedia | null>(null);

  useEffect(() => {
    requestJson<GalleryMedia[]>('/api/public/media')
      .then((result: GalleryMedia[]) => setMedia(Array.isArray(result) ? result : []))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleMedia = media.filter((item) => item.kind === tab);
  const photoCount = media.filter((item) => item.kind === 'PHOTO').length;
  const videoCount = media.filter((item) => item.kind === 'VIDEO').length;

  return (
    <>
      <section className="gallery-section section-pad" id="galerie">
        <div className="section-heading">
          <div>
            <p className="eyebrow">UN APERÇU VISUEL DES TROIS ACCOMPAGNEMENTS</p>
            <h2>
              Photos <em>& vidéos.</em>
            </h2>
          </div>
          <p className="section-intro">
            Écouter, bouger, progresser et garder le lien. Chaque parcours commence par une
            rencontre.
          </p>
        </div>
        <div className="gallery-tabs">
          <span>GALERIE YAA</span>
          <div role="tablist" aria-label="Type de média">
            <button
              role="tab"
              aria-selected={tab === 'PHOTO'}
              className={tab === 'PHOTO' ? 'active' : ''}
              onClick={() => setTab('PHOTO')}
            >
              Photos <span>{String(photoCount).padStart(2, '0')}</span>
            </button>
            <button
              role="tab"
              aria-selected={tab === 'VIDEO'}
              className={tab === 'VIDEO' ? 'active' : ''}
              onClick={() => setTab('VIDEO')}
            >
              Vidéos <span>{String(videoCount).padStart(2, '0')}</span>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="gallery-empty" role="status">
            Chargement de la galerie…
          </div>
        ) : visibleMedia.length ? (
          <div className="gallery-grid gallery-live-grid">
            {visibleMedia.map((item) => (
              <article className="gallery-live-card" key={item.id}>
                {item.kind === 'PHOTO' ? (
                  <button
                    type="button"
                    className="gallery-live-image"
                    onClick={() => setModal(item)}
                    aria-label={`Agrandir : ${item.alt}`}
                  >
                    <img src={`${API}${item.url}`} alt={item.alt} loading="lazy" />
                    <span className="gallery-zoom">
                      <Images size={16} />
                    </span>
                  </button>
                ) : (
                  <div className="gallery-live-video">
                    <video
                      src={`${API}${item.url}`}
                      controls
                      preload="metadata"
                      aria-label={item.alt}
                    />
                    <span className="video-tag">
                      <Play size={13} /> VIDÉO
                    </span>
                  </div>
                )}
                <div className="gallery-live-caption">
                  <b>{item.service}</b>
                  <p>{item.caption || item.alt}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="gallery-empty">
            <span>
              <Images size={19} />
            </span>
            <div>
              <h3>
                {tab === 'PHOTO' ? 'Les photos arrivent bientôt.' : 'Les vidéos arrivent bientôt.'}
              </h3>
              <p>Les médias publiés par YAA COACHING apparaîtront ici.</p>
            </div>
          </div>
        )}
      </section>
      {modal && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photo"
          onClick={() => setModal(null)}
          onKeyDown={(event) => event.key === 'Escape' && setModal(null)}
          tabIndex={-1}
        >
          <button aria-label="Fermer" onClick={() => setModal(null)}>
            <X />
          </button>
          <img src={`${API}${modal.url}`} alt={modal.alt} />
          <span>{modal.caption || modal.alt}</span>
        </div>
      )}
    </>
  );
}
