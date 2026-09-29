import { useLayoutEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import SocialRail from './components/SocialRail/SocialRail';
import { useContent } from './hooks/useContent';
import { getFooterData, getHeaderContent, getSocials } from './services/api';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const { pathname, hash, key } = useLocation();
  const { data: header, error, retry } = useContent(getHeaderContent);
  const { data: footer } = useContent(getFooterData);
  const { data: socials } = useContent(getSocials);

  useLayoutEffect(() => {
    const names: Record<string, string> = { '/': 'Home', '/blogs': 'Blogs', '/gallery': 'Gallery', '/contact': 'Contact', '/login': 'Login', '/register': 'Register' };
    document.title = `${names[pathname] ?? 'Page not found'} | EDC SIRT`;
    // Wait until route markup and any closing drawer scroll lock are reconciled.
    const frame = window.requestAnimationFrame(() => {
      let anchor = '';
      try { anchor = decodeURIComponent(hash.slice(1)); } catch { anchor = ''; }
      const target = anchor ? document.getElementById(anchor) : null;
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'instant' });
        target.focus({ preventScroll: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <span className="header-top-marker" data-header-top aria-hidden="true" />
      {header && <Header key={pathname} content={header} />}
      {socials && pathname === '/' && <SocialRail links={socials} />}
      <main id="main-content" className="site-main" tabIndex={-1}>
        {error && <div className="container section" role="alert"><p>Navigation could not be loaded.</p><button type="button" onClick={retry}>Try again</button></div>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<section className="container section"><h1>Page not found.</h1><p><Link to="/">Return home</Link></p></section>} />
        </Routes>
      </main>
      {footer && <Footer data={footer} />}
    </>
  );
}
