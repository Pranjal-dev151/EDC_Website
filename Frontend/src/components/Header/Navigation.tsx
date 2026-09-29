import { Link, useLocation } from 'react-router-dom';
import type { MouseEvent } from 'react';
import type { NavigationItem } from '../../types';
import './Navigation.css';

interface NavigationProps {
  items: NavigationItem[];
  variant?: 'desktop' | 'drawer' | 'measure';
  onNavigate?: () => void;
}

export default function Navigation({ items, variant = 'desktop', onNavigate }: NavigationProps) {
  const { pathname, hash } = useLocation();
  const baseNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onNavigate?.();
  };
  const scrollToSection = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    baseNavigate(e);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  if (variant === 'measure') {
    return <div className="edc-navigation edc-navigation--measure">{items.map((item) => <span className="edc-navigation__link" key={item.href}>{item.label}</span>)}</div>;
  }
  return (
    <nav className={`edc-navigation edc-navigation--${variant}`} aria-label={variant === 'drawer' ? 'Mobile navigation' : 'Main navigation'}>
      {items.map((item) => {
        const [path, anchor] = item.href.split('#');
        const active = pathname === path && (anchor ? hash === `#${anchor}` : path !== '/' || !hash);
        const isInPageAnchor = anchor && (path === '' || path === '/' || path === pathname);
        if (isInPageAnchor && anchor) {
          return (
            <a
              key={item.href}
              href={`#${anchor}`}
              className="edc-navigation__link"
              aria-current={active ? 'location' : undefined}
              onClick={scrollToSection(anchor)}
            >
              {item.label}
            </a>
          );
        }
        return <Link className="edc-navigation__link" key={item.href} to={item.href} aria-current={active ? (anchor ? 'location' : 'page') : undefined} onClick={baseNavigate}>{item.label}</Link>;
      })}
    </nav>
  );
}
