import { ArrowUpRight } from 'lucide-react';
import { usePublicContact } from '../use-public-contact.js';

export default function SiteFooter() {
  const { email, phone, phoneLink, footerCoaching, footerPlayer, footerSignature } =
    usePublicContact();

  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="/">
        <span className="brand-mark">Y</span>
        <span>
          <b>YAA COACHING</b>
          <small>LE CORPS · L’ESPRIT · VOUS</small>
        </span>
      </a>
      <div>
        <p>{footerCoaching}</p>
        <p>{footerPlayer}</p>
      </div>
      <div className="footer-contact">
        {email && (
          <a href={`mailto:${email}`}>
            {email} <ArrowUpRight size={14} />
          </a>
        )}
        {phone && phoneLink && (
          <a href={`tel:${phoneLink}`}>
            {phone} <ArrowUpRight size={14} />
          </a>
        )}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} YAA COACHING</span>
        {email && <a href={`mailto:${email}?subject=Demande%20RGPD`}>Données personnelles</a>}
        <span>{footerSignature}</span>
      </div>
    </footer>
  );
}
