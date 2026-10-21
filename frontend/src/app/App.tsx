import { useEffect, useState } from 'react';
import Admin from '../features/admin/Admin.js';
import PublicSite from '../features/landing/PublicSite.js';

const PUBLIC_ROUTES = [
  '/',
  '/accompagnements',
  '/methode',
  '/coach',
  '/galerie',
  '/avis',
  '/questionnaire',
];

export default function App() {
  const [route, setRoute] = useState(location.pathname);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname.replace(/\/$/, '') || '/';
    if (!currentPath.startsWith('/admin') && !PUBLIC_ROUTES.includes(currentPath)) {
      history.replaceState({}, '', '/');
      setRoute('/');
    } else {
      setRoute(currentPath);
    }
    const updateRoute = () => {
      const currentPath = location.pathname.replace(/\/$/, '') || '/';
      const isValidRoute = currentPath.startsWith('/admin') || PUBLIC_ROUTES.includes(currentPath);
      if (!isValidRoute) history.replaceState({}, '', '/');
      setRoute(isValidRoute ? currentPath : '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', updateRoute);
    return () => window.removeEventListener('popstate', updateRoute);
  }, []);

  function navigate(path: string) {
    const nextPath = path.replace(/\/$/, '') || '/';
    const destination =
      PUBLIC_ROUTES.includes(nextPath) || nextPath.startsWith('/admin') ? nextPath : '/';
    if (destination !== route) history.pushState({}, '', destination);
    setRoute(destination);
    window.scrollTo(0, 0);
    setMobileNav(false);
  }

  if (route.startsWith('/admin')) return <Admin onNavigate={navigate} />;
  return (
    <PublicSite
      route={route}
      onNavigate={navigate}
      mobileNav={mobileNav}
      setMobileNav={setMobileNav}
    />
  );
}
