import { useEffect, useState } from 'react';
import { ArrowUpRight, MessageCircle, Star } from 'lucide-react';
import { ApiError, requestJson } from '../../shared/api-client.js';
import { services } from '../../shared/service-catalog.js';

type Review = { id: string; pseudonym: string; service: string; rating: number; message: string };
type Props = { onNotice: (message: string) => void };

export default function ReviewsSection({ onNotice }: Props) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    requestJson<Review[]>('/api/public/reviews')
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function sendReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload = {
      pseudonym: fd.get('pseudonym'),
      service: fd.get('service'),
      rating: Number(fd.get('rating')),
      message: fd.get('message'),
      email: fd.get('email'),
      consent: fd.get('consent') === 'on',
    };
    setSending(true);
    try {
      const result = await requestJson<{ message: string }>('/api/public/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onNotice(result.message);
      form.reset();
      setReviewOpen(false);
    } catch (error) {
      onNotice(
        error instanceof ApiError
          ? error.message
          : 'Le service est momentanément indisponible. Votre avis est toujours dans le formulaire : réessayez.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="reviews-section section-pad" id="avis">
      <div className="reviews-heading">
        <div>
          <p className="eyebrow">VOS RETOURS D’EXPÉRIENCE</p>
          <h2>
            Chaque parcours
            <br />
            <em>a sa voix.</em>
          </h2>
          <p>
            Découvrez les avis publiés avec l’accord des personnes accompagnées, ou partagez votre
            propre expérience.
          </p>
        </div>
        <div className="review-stat">
          <span>AVIS PUBLIÉS</span>
          <b>{String(reviews.length).padStart(2, '0')}</b>
          <small>avec votre accord</small>
        </div>
      </div>
      <div className="reviews-body">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <span className="no-review-icon">
              <MessageCircle size={19} />
            </span>
            <div>
              <h3>Aucun avis publié pour le moment.</h3>
              <p>Vous avez été accompagné ? Vous pouvez partager votre expérience ci-dessous.</p>
            </div>
            <button className="button button-outline" onClick={() => setReviewOpen(!reviewOpen)}>
              Partager mon expérience <ArrowUpRight size={15} />
            </button>
          </div>
        ) : (
          <div className="review-grid">
            {reviews.map((r) => (
              <article className="review-card" key={r.id}>
                <div className="review-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={15} fill={i < r.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p>« {r.message} »</p>
                <div>
                  <b>{r.pseudonym}</b>
                  <small>{r.service}</small>
                </div>
              </article>
            ))}
          </div>
        )}
        {reviewOpen && (
          <form className="review-form" onSubmit={sendReview}>
            <div className="fields-grid">
              <label className="field">
                <span>Prénom ou pseudonyme affiché *</span>
                <input name="pseudonym" required minLength={2} maxLength={60} />
              </label>
              <label className="field">
                <span>Accompagnement concerné *</span>
                <select name="service" required>
                  <option value="">Choisissez</option>
                  {services.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Votre appréciation *</span>
                <select name="rating" required>
                  <option value="">Choisissez une note</option>
                  <option value="5">5 / 5 — Très satisfait</option>
                  <option value="4">4 / 5 — Satisfait</option>
                  <option value="3">3 / 5 — Mitigé</option>
                  <option value="2">2 / 5 — Peu satisfait</option>
                  <option value="1">1 / 5 — Insatisfait</option>
                </select>
              </label>
              <label className="field">
                <span>Adresse e-mail (ne sera pas publiée) *</span>
                <input name="email" type="email" required />
              </label>
              <label className="field field-wide">
                <span>Votre expérience, avec vos mots * (20 à 1 200 caractères)</span>
                <textarea name="message" required minLength={20} maxLength={1200} rows={4} />
              </label>
              <label className="consent-row">
                <input name="consent" type="checkbox" required />
                <span>
                  J’accepte que mon avis, mon prénom ou pseudonyme et ma note soient publiés après
                  validation. Je peux demander leur retrait à{' '}
                  <a href="mailto:yanmane29@gmail.com">yanmane29@gmail.com</a>.
                </span>
              </label>
            </div>
            <button className="button button-dark" disabled={sending}>
              {sending ? 'Envoi…' : 'Déposer mon avis'} <ArrowUpRight size={15} />
            </button>
          </form>
        )}
        <p className="review-note">
          Votre avis sera visible après validation par le coach. Utilisez un pseudonyme et évitez
          les informations personnelles ou médicales. Pour un jeune mineur, le dépôt se fait avec
          son parent ou responsable légal.
        </p>
      </div>
    </section>
  );
}
