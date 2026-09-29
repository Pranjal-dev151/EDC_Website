import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { HeaderContent } from '../../types';
import Navigation from './Navigation';
import JoinUsMenu from './JoinUsMenu';
import MobileMenu from './MobileMenu';
import './Header.css';

type HeaderState = 'A' | 'B' | 'C';
type OpenPanel = 'none' | 'join' | 'mobile';

export default function Header({ content }: { content: HeaderContent }) {
  const { pathname } = useLocation();
  const isAuth = pathname === '/login' || pathname === '/register';
  const items = isAuth ? content.navigation.auth : pathname === '/' ? content.navigation.home : content.navigation.inner;
  const [state, setState] = useState<HeaderState>('A');
  const [layout, setLayout] = useState<'drawer' | 'full'>('drawer');
  const [panel, setPanel] = useState<OpenPanel>('none');
  const shell = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLAnchorElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const closePanel = useCallback(() => setPanel('none'), []);

  useLayoutEffect(() => {
    const top = document.querySelector<HTMLElement>('[data-header-top]');
    const getRegion = () =>
      document.querySelector<HTMLElement>('[data-header-region]') ??
      document.querySelector<HTMLElement>('[data-page-top-sentinel]') ??
      document.querySelector<HTMLElement>('[data-page-top]') ??
      document.querySelector<HTMLElement>('#main-content h1');

    let region = getRegion();
    // eslint-disable-next-line no-console
    console.log('header trigger:', region?.tagName, region?.getAttribute?.('data-header-region') !== null ? 'data-header-region' : region?.getAttribute?.('data-page-top-sentinel') !== null ? 'data-page-top-sentinel' : region?.tagName === 'H1' ? '#main-content h1' : 'unknown', region);
    // Debug helper for Task 2: report all trigger counts
    // eslint-disable-next-line no-console
    console.log(
      'triggers count',
      document.querySelectorAll('[data-header-region]').length,
      document.querySelectorAll('[data-page-top-sentinel]').length,
      document.querySelectorAll('[data-page-top]').length,
    );
    if (!top || !region) {
      // Timing race: Blogs/Gallery children mount after Header — retry after frame
      let raf = 0;
      let mo: MutationObserver | null = null;
      const retry = () => {
        const r = getRegion();
        if (r) {
          region = r;
          // eslint-disable-next-line no-console
          console.log('header trigger (retry):', region.tagName, region);
          const upd = () => {
            const atTop = top!.getBoundingClientRect().top >= 0;
            const pastIntro = region!.getBoundingClientRect().bottom <= 0;
            setState(atTop ? 'A' : pastIntro ? 'C' : 'B');
          };
          upd();
          const obs = new IntersectionObserver(upd, { threshold: [0, 1] });
          obs.observe(top!);
          obs.observe(region);
          const ros = new ResizeObserver(upd);
          ros.observe(region);
          // store for cleanup via closure
          (retry as unknown as { _cleanup?: () => void })._cleanup = () => {
            obs.disconnect();
            ros.disconnect();
          };
        } else {
          raf = window.requestAnimationFrame(retry);
        }
      };
      // Also observe DOM mutations for faster retry
      mo = new MutationObserver(() => {
        const r = getRegion();
        if (r && !region) {
          window.cancelAnimationFrame(raf);
          mo?.disconnect();
          retry();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      raf = window.requestAnimationFrame(retry);
      return () => {
        window.cancelAnimationFrame(raf);
        mo?.disconnect();
        const c = (retry as unknown as { _cleanup?: () => void })._cleanup;
        if (c) c();
      };
    }
    const updateState = () => {
      const atTop = top.getBoundingClientRect().top >= 0;
      const pastIntro = region!.getBoundingClientRect().bottom <= 0;
      setState(atTop ? 'A' : pastIntro ? 'C' : 'B');
    };
    updateState();
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(updateState, { threshold: [0, 1] });
    observer.observe(top);
    observer.observe(region);
    const resize = new ResizeObserver(updateState);
    resize.observe(region);
    return () => { observer.disconnect(); resize.disconnect(); };
  }, [pathname]);

  useLayoutEffect(() => {
    const element = shell.current;
    const naturalNav = measure.current?.firstElementChild;
    const join = actions.current?.firstElementChild;
    if (!element || !naturalNav || !join) return;
    const tablet = window.matchMedia('(min-width: 640px)');
    const measureFit = () => {
      const style = getComputedStyle(element);
      const available = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const required = (logo.current?.getBoundingClientRect().width ?? 0) + naturalNav.getBoundingClientRect().width + join.getBoundingClientRect().width + 2 * parseFloat(style.columnGap);
      setLayout(tablet.matches && available >= required + 16 ? 'full' : 'drawer');
    };
    measureFit();
    const resize = new ResizeObserver(measureFit);
    resize.observe(element);
    resize.observe(naturalNav);
    resize.observe(join);
    if (logo.current) resize.observe(logo.current);
    tablet.addEventListener('change', measureFit);
    return () => { resize.disconnect(); tablet.removeEventListener('change', measureFit); };
  }, [items]);

  useEffect(() => {
    if (layout === 'full') setPanel((current) => current === 'mobile' ? 'none' : current);
  }, [layout]);

  return (
    <>
      <header className="edc-header" data-state={state} data-layout={layout} aria-label="Site header">
        <div className="edc-header__shell" ref={shell}>
          <Link className="edc-header__logo" to="/" aria-label={`${content.name} — Home`} ref={logo} onClick={closePanel}>
            <img src="/edc-logo.svg" alt={content.logo.alt} width={content.logo.width} height={content.logo.height} />
          </Link>
          <div className="edc-header__desktop"><Navigation items={items} onNavigate={closePanel} /></div>
          <div className="edc-header__actions" ref={actions}>
            <JoinUsMenu open={panel === 'join'} links={content.joinLinks} onToggle={() => setPanel((current) => current === 'join' ? 'none' : 'join')} onClose={closePanel} />
            <button className="edc-header__toggle" type="button" aria-label="Open navigation" aria-controls={dialogId} aria-expanded={panel === 'mobile'} aria-haspopup="dialog" ref={menuButton} onClick={() => setPanel('mobile')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
          <div className="edc-header__measure" aria-hidden="true" inert ref={measure}><Navigation items={items} variant="measure" /></div>
        </div>
      </header>
      <MobileMenu id={dialogId} open={panel === 'mobile'} onClose={closePanel} items={items} joinLinks={content.joinLinks} name={content.name} triggerRef={menuButton} />
    </>
  );
}
