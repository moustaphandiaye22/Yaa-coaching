import { useEffect, useState } from 'react';
import Admin from '../features/admin/Admin.js';
import PublicSite from '../features/landing/PublicSite.js';

export default function App() {
  const [route, setRoute] = useState(location.pathname);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const updateRoute = () => setRoute(location.pathname);
    window.addEventListener('popstate', updateRoute);
    return () => window.removeEventListener('popstate', updateRoute);
  }, []);

  function navigate(path: string) {
    history.pushState({}, '', path);
    setRoute(path);
    window.scrollTo(0, 0);
    setMobileNav(false);
  }

  if (route.startsWith('/admin')) return <Admin onNavigate={navigate} />;
  return <PublicSite onNavigate={navigate} mobileNav={mobileNav} setMobileNav={setMobileNav} />;
}
