import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import {
  Activity,
  ChevronDown,
  Images,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Route,
  ShieldCheck,
  UserRound,
  House,
  ExternalLink,
  X,
} from 'lucide-react';
import { ApiError, requestJson } from '../api-client.js';

type AuthenticatedUser = { email: string; role: string };

type Props = {
  activeRoute: string;
  mobileNavOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
};

const links = [
  { path: '/', label: 'Accueil', Icon: House },
  { path: '/accompagnements', label: 'Accompagnements', Icon: Activity },
  { path: '/methode', label: 'La méthode', Icon: Route },
  { path: '/coach', label: 'Votre coach', Icon: UserRound },
  { path: '/galerie', label: 'Photos & vidéos', Icon: Images },
  { path: '/avis', label: 'Avis & FAQ', Icon: MessageCircle },
];

export default function SiteHeader({ activeRoute, mobileNavOpen, onToggle, onNavigate }: Props) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [accountError, setAccountError] = useState('');
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const refreshAccount = useCallback(async () => {
    try {
      const currentUser = await requestJson<AuthenticatedUser>('/api/auth/me', {
        credentials: 'include',
      });
      setUser(currentUser.role === 'ADMIN' ? currentUser : null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setUser(null);
    }
  }, []);

  useEffect(() => {
    void refreshAccount();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshAccount();
    };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshAccount]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [accountMenuOpen]);

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    setAccountMenuOpen(false);
    onNavigate(path);
  };

  async function logout() {
    setLogoutPending(true);
    setAccountError('');
    try {
      await requestJson('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setAccountMenuOpen(false);
    } catch (error) {
      setAccountError(
        error instanceof ApiError
          ? `La déconnexion a échoué : ${error.message}`
          : 'La déconnexion a échoué. Réessayez.',
      );
    } finally {
      setLogoutPending(false);
    }
  }

  const displayName =
    user?.email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .trim() ?? '';
  const accountLabel = displayName
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

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
        type="button"
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
        {links.map(({ path, label, Icon }) => (
          <a
            key={path}
            href={path}
            aria-current={activeRoute === path ? 'page' : undefined}
            onClick={(event) => handleNavigate(event, path)}
          >
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </a>
        ))}
        {user ? (
          <div className="account-menu" ref={accountMenuRef}>
            <button
              className="account-menu-trigger"
              type="button"
              aria-expanded={accountMenuOpen}
              aria-controls="account-menu-panel"
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <span className="account-avatar" aria-hidden="true">
                {accountLabel.slice(0, 1) || 'A'}
              </span>
              <span className="account-trigger-name">{accountLabel}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            {accountMenuOpen && (
              <div className="account-menu-panel" id="account-menu-panel">
                <div className="account-menu-identity">
                  <small>CONNECTÉ EN TANT QUE</small>
                  <b>{user.email}</b>
                  <span>Administrateur</span>
                </div>
                {accountError && (
                  <p className="account-menu-error" role="alert">
                    {accountError}
                  </p>
                )}
                <a href="/admin" onClick={(event) => handleNavigate(event, '/admin')}>
                  <ShieldCheck size={17} /> Espace d’administration
                </a>
                <a href="/" onClick={(event) => handleNavigate(event, '/')}>
                  <ExternalLink size={17} /> Retourner au site
                </a>
                <button type="button" onClick={() => void logout()} disabled={logoutPending}>
                  <LogOut size={17} />
                  {logoutPending ? 'Déconnexion…' : 'Se déconnecter'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            className="nav-login"
            href="/admin"
            onClick={(event) => handleNavigate(event, '/admin')}
          >
            <LogIn size={15} /> Connexion
          </a>
        )}
      </nav>
    </header>
  );
}
