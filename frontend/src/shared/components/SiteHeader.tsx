import { ArrowUpRight, Menu, X } from 'lucide-react';

type Props = { mobileNavOpen: boolean; onToggle: () => void; onNavigate: () => void };

export default function SiteHeader({ mobileNavOpen, onToggle, onNavigate }: Props) {
  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span className="brand-mark">Y</span>
        <span>
          <b>YAA COACHING</b>
          <small>LE CORPS · L’ESPRIT · VOUS</small>
        </span>
      </a>
      <button
        className="nav-toggle"
        aria-label={mobileNavOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={mobileNavOpen}
        onClick={onToggle}
      >
        {mobileNavOpen ? <X /> : <Menu />}
      </button>
      <nav className={mobileNavOpen ? 'nav-open' : ''}>
        <a href="#accompagnements" onClick={onNavigate}>
          Les accompagnements
        </a>
        <a href="#methode" onClick={onNavigate}>
          La méthode
        </a>
        <a href="#coach" onClick={onNavigate}>
          Votre coach
        </a>
        <a href="#galerie" onClick={onNavigate}>
          Photos & vidéos
        </a>
        <a href="#avis" onClick={onNavigate}>
          Les avis
        </a>
        <a className="nav-cta" href="#questionnaire" onClick={onNavigate}>
          Faire le premier pas <ArrowUpRight size={15} />
        </a>
      </nav>
    </header>
  );
}
