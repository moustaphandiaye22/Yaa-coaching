import { ArrowUpRight, Facebook, Instagram, Linkedin, MessageCircle, Music2 } from 'lucide-react';
import { usePublicContact } from '../use-public-contact.js';
import { funnelLinks } from '../funnel-links.js';
import { safeSocialUrl, type SocialLinkKey } from '../social-links.js';

const socialLinks: { label: string; key: SocialLinkKey; Icon: typeof Instagram }[] = [
  { label: 'Instagram', key: 'instagramUrl', Icon: Instagram },
  { label: 'TikTok', key: 'tiktokUrl', Icon: Music2 },
  { label: 'Facebook', key: 'facebookUrl', Icon: Facebook },
  { label: 'LinkedIn', key: 'linkedinUrl', Icon: Linkedin },
  { label: 'WhatsApp', key: 'whatsappUrl', Icon: MessageCircle },
];

export default function SiteFooter() {
  const contact = usePublicContact();
  const { email, phone, phoneLink, footerCoaching, footerPlayer, footerSignature } = contact;

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
      <div className="footer-social">
        <b>Réseaux & ressources</b>
        <nav className="footer-social-links" aria-label="Réseaux sociaux et ressources">
          {socialLinks.map(({ label, key, Icon }) => {
            const href = safeSocialUrl(contact[key]);
            return href ? (
              <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </a>
            ) : null;
          })}
          <a href={funnelLinks.offers} target="_blank" rel="noreferrer" aria-label="Offres et bilans Systeme.io">
            <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>Offres et bilans Systeme.io</span>
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} YAA COACHING</span>
        {footerSignature && <span>{footerSignature}</span>}
      </div>
    </footer>
  );
}
