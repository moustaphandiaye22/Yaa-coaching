import { ArrowUpRight } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="#top">
        <span className="brand-mark">Y</span>
        <span>
          <b>YAA COACHING</b>
          <small>LE CORPS · L’ESPRIT · VOUS</small>
        </span>
      </a>
      <div>
        <p>Coaching & autonomie : Vierzon et alentours.</p>
        <p>Player : sans limite géographique.</p>
      </div>
      <div className="footer-contact">
        <a href="mailto:yanmane29@gmail.com">
          yanmane29@gmail.com <ArrowUpRight size={14} />
        </a>
        <a href="tel:+33652281155">
          06 52 28 11 55 <ArrowUpRight size={14} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© 2026 YAA COACHING</span>
        <a href="mailto:yanmane29@gmail.com?subject=Demande%20RGPD">Données personnelles</a>
        <span>FAIT AVEC ÉCOUTE · À VIERZON</span>
      </div>
    </footer>
  );
}
