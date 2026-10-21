import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { API, faqs } from '../../shared/site-content.js';

type Faq = { question: string; answer: string };

export default function FaqSection() {
  const [items, setItems] = useState(faqs.map(([question, answer]) => [question, answer]));
  useEffect(() => {
    fetch(`${API}/api/faqs/public`).then((response) => response.json())
      .then((data: Faq[]) => { if (Array.isArray(data) && data.length) setItems(data.map((item) => [item.question, item.answer])); })
      .catch(() => {});
  }, []);
  return (<section className="faq-section section-pad"><div className="faq-title"><p className="eyebrow">AVANT DE SE LANCER</p><h2>Vos<br/><em>questions.</em></h2><a className="text-link" href="mailto:yanmane29@gmail.com">Vous avez une autre question ? <ArrowUpRight size={15}/></a></div><div className="faq-list">{items.map(([q,a],i)=><details key={q} open={i===0}><summary><span>0{i+1}</span><b>{q}</b><ChevronDown size={17}/></summary><p>{a}</p></details>)}</div></section>);
}
