import { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { NavigationItem } from '../../types';
import './JoinUsMenu.css';

interface JoinUsMenuProps {
  open: boolean;
  links: NavigationItem[];
  onToggle: () => void;
  onClose: () => void;
}

export default function JoinUsMenu({ open, links, onToggle, onClose }: JoinUsMenuProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const outside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) onClose();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open, onClose]);

  return (
    <div className="edc-join" ref={root}>
      <button className="edc-join__trigger" type="button" ref={trigger} onClick={onToggle} aria-expanded={open} aria-controls={id}>
        Join Us
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
      </button>
      <div className="edc-join__popover" id={id} hidden={!open}>
        <p className="eyebrow">Your next step</p>
        <nav aria-label="Membership">
          {links.map((link, index) => <Link key={link.href} to={link.href} ref={index === 0 ? firstLink : undefined} onClick={onClose}>{link.label}<span aria-hidden="true">↗</span></Link>)}
        </nav>
      </div>
    </div>
  );
}
