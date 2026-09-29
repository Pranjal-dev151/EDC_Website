import { useCallback, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import type { NavigationItem } from '../../types';
import Navigation from './Navigation';
import './MobileMenu.css';

interface MobileMenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
  items: NavigationItem[];
  joinLinks: NavigationItem[];
  name: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileMenu({ id, open, onClose, items, joinLinks, name, triggerRef }: MobileMenuProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const releaseScroll = useRef<(() => void) | null>(null);

  const finishClose = useCallback((restoreFocus = true) => {
    const wasOpen = dialog.current?.open || releaseScroll.current !== null;
    dialog.current?.close();
    releaseScroll.current?.();
    releaseScroll.current = null;
    if (wasOpen && restoreFocus) {
      const trigger = triggerRef.current;
      if (trigger && trigger.getClientRects().length > 0) trigger.focus({ preventScroll: true });
      else document.querySelector<HTMLElement>('.edc-header__logo')?.focus({ preventScroll: true });
    }
  }, [triggerRef]);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open) {
      if (!element.open) {
        const body = document.body;
        const { scrollX, scrollY } = window;
        const saved = {
          position: body.style.position,
          top: body.style.top,
          left: body.style.left,
          width: body.style.width,
          overflow: body.style.overflow,
          paddingRight: body.style.paddingRight,
        };
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
        Object.assign(body.style, {
          position: 'fixed', top: `${-scrollY}px`, left: `${-scrollX}px`,
          width: '100%', overflow: 'hidden', paddingRight: `${padding + scrollbar}px`,
        });
        releaseScroll.current = () => {
          Object.assign(body.style, saved);
          window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
        };
        // Native modal semantics provide focus containment and inert background content.
        element.showModal();
      }
      closeButton.current?.focus({ preventScroll: true });
      return;
    }
    if (!element.open) return;
    const token = getComputedStyle(element).getPropertyValue('--duration-base').trim();
    const duration = parseFloat(token) * (token.endsWith('ms') ? 1 : 1000);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => finishClose(), reduced ? 0 : (Number.isFinite(duration) ? duration : 450));
    return () => window.clearTimeout(timer);
  }, [open, finishClose]);

  useLayoutEffect(() => () => finishClose(), [finishClose]);

  const navigate = () => {
    // Unlock before React Router scrolls to the new route/anchor; do not restore trigger focus.
    finishClose(false);
    onClose();
  };

  return (
    <dialog className="edc-mobile" ref={dialog} id={id} aria-labelledby={`${id}-title`} aria-modal="true" data-closing={!open} onCancel={(event) => { event.preventDefault(); onClose(); }} onPointerDown={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
      <div className="edc-mobile__top">
        <div><p className="eyebrow">{name}</p><h2 id={`${id}-title`}>Navigation</h2></div>
        <button className="edc-mobile__close" type="button" ref={closeButton} onClick={onClose} aria-label="Close navigation">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
        </button>
      </div>
      <Navigation items={items} variant="drawer" onNavigate={navigate} />
      <div className="edc-mobile__membership">
        <p className="eyebrow">Join the community</p>
        <nav aria-label="Membership">{joinLinks.map((link) => <Link to={link.href} key={link.href} onClick={(event) => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) navigate(); }}>{link.label}<span aria-hidden="true">↗</span></Link>)}</nav>
      </div>
    </dialog>
  );
}
