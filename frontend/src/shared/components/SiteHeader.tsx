import type { MouseEvent } from 'react';
import { ArrowUpRight, LogIn, Menu, X } from 'lucide-react';

type Props = {
  activeRoute: string;
  mobileNavOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
};

const links = [
  { path: '/', label: 'Accueil' },
  { path: '/accompagnements', label: 'Accompagnements' },
  { path: '/methode', label: 'La méthode' },
  { path: '/coach', label: 'Votre coach' },
  { path: '/galerie', label: 'Photos & vidéos' },
  { path: '/avis', label: 'Avis & FAQ' },
];

export default function SiteHeader({ activeRoute, mobileNavOpen, onToggle, onNavigate }: Props) {
  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <header className="site-header">
      <a className="brand" href="/" onClick={(event) => handleNavigate(event, '/')}>
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
        aria-controls="public-navigation"
        onClick={onToggle}
      >
        {mobileNavOpen ? <X /> : <Menu />}
      </button>
      <nav
        id="public-navigation"
        className={mobileNavOpen ? 'nav-open' : ''}
        aria-label="Navigation principale"
      >
        {links.map(({ path, label }) => (
          <a
            key={path}
            href={path}
            aria-current={activeRoute === path ? 'page' : undefined}
            onClick={(event) => handleNavigate(event, path)}
          >
            {label}
          </a>
        ))}
        <a className="nav-login" href="/admin" onClick={(event) => handleNavigate(event, '/admin')}>
          <LogIn size={15} /> Connexion
        </a>
        <a
          className="nav-cta"
          href="/questionnaire"
          onClick={(event) => handleNavigate(event, '/questionnaire')}
        >
          Faire le premier pas <ArrowUpRight size={15} />
        </a>
      </nav>
    </header>
  );
}
