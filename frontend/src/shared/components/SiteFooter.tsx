import { ArrowUpRight, Facebook, Instagram, Linkedin, Music2 } from 'lucide-react';
import { usePublicContact } from '../use-public-contact.js';

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/yaa_coaching_by_yakhouba/',
    Icon: Instagram,
  },
  { label: 'TikTok', href: 'https://www.tiktok.com/@yaacoaching29', Icon: Music2 },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/p/Yaa-Coaching-by-Yakhouba-100063732535020/',
    Icon: Facebook,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/yaa-coaching-coaching-physique-et-mental-509a97363/',
    Icon: Linkedin,
  },
];

export default function SiteFooter() {
  const { email, phone, phoneLink, footerCoaching, footerPlayer } = usePublicContact();

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
          {socialLinks.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} YAA COACHING</span>
      </div>
    </footer>
  );
}
