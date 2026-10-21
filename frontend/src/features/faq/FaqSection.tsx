import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { requestJson } from '../../shared/api-client.js';
import { usePublicContact } from '../../shared/use-public-contact.js';

type Faq = { question: string; answer: string };

export default function FaqSection() {
  const [items, setItems] = useState<[string, string][]>([]);
  const { email } = usePublicContact();
  useEffect(() => {
    requestJson<Faq[]>('/api/public/faqs')
      .then((data: Faq[]) => {
        if (Array.isArray(data)) setItems(data.map((item) => [item.question, item.answer]));
      })
      .catch(() => {});
  }, []);
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
        {items.map(([q, a], i) => (
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
