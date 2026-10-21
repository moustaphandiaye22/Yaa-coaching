import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, RefreshCw } from 'lucide-react';
import { requestJson } from '../../shared/api-client.js';
import { usePublicContact } from '../../shared/use-public-contact.js';

type Faq = { question: string; answer: string };

export default function FaqSection() {
  const [items, setItems] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [request, setRequest] = useState(0);
  const { email } = usePublicContact();
  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    requestJson<Faq[]>('/api/public/faqs')
      .then((data: Faq[]) => {
        if (Array.isArray(data)) setItems(data.map((item) => [item.question, item.answer]));
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [request]);
  return (
    <section className="faq-section section-pad">
      <div className="faq-title">
        <p className="eyebrow">AVANT DE SE LANCER</p>
        <h2>
          Vos
          <br />
          <em>questions.</em>
        </h2>
        {email && (
          <a className="text-link" href={`mailto:${email}`}>
            Vous avez une autre question ? <ArrowUpRight size={15} />
          </a>
        )}
      </div>
      <div className="faq-list">
        {loading && (
          <p className="content-list-error" role="status">
            Chargement des questions…
          </p>
        )}
        {loadError && (
          <div className="content-list-error" role="alert">
            <div>
              <h3>Les réponses sont momentanément indisponibles.</h3>
              <p>Réessayez dans un instant pour consulter les questions fréquentes.</p>
            </div>
            <button
              className="button button-outline"
              onClick={() => setRequest((value) => value + 1)}
            >
              Réessayer <RefreshCw size={16} />
            </button>
          </div>
        )}
        {!loading && !loadError && items.length === 0 && (
          <p className="content-list-error">Aucune question publiée pour le moment.</p>
        )}
        {!loading &&
          !loadError &&
          items.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>
                <span>0{i + 1}</span>
                <b>{q}</b>
                <ChevronDown size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
      </div>
    </section>
  );
}
