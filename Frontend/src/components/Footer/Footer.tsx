import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FooterData } from '../../types';
import styles from './Footer.module.css';

export default function Footer({ data }: { data: FooterData }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setStatus('error'); return; }
    setStatus('success');
    setEmail('');
  };

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.identity}>{data.identity}</p>
          <p className={styles.description}>{data.description}</p>
          <form className={styles.newsletter} onSubmit={onSubmit} noValidate aria-label="Newsletter">
            <h3>{data.newsletter.title}</h3>
            <p>{data.newsletter.description}</p>
            <label className="sr-only" htmlFor="footer-email">Email</label>
            <div className={styles.newsRow}>
              <input id="footer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              <button type="submit">Join</button>
            </div>
            {status === 'success' && <p role="status" className={styles.success}>You’re on the list.</p>}
            {status === 'error' && <p role="alert" className={styles.error}>Enter a valid email.</p>}
          </form>
        </div>

        <nav className={styles.col} aria-label="Initiatives">
          <p className="eyebrow">Initiatives</p>
          <ul>{data.initiatives.map((l) => <li key={l.label}><Link to={l.href}>{l.label}</Link></li>)}</ul>
        </nav>

        <nav className={styles.col} aria-label="Useful links">
          <p className="eyebrow">Explore</p>
          <ul>{data.usefulLinks.map((l) => <li key={l.label}><Link to={l.href}>{l.label}</Link></li>)}</ul>
        </nav>

        <div className={styles.col}>
          <p className="eyebrow">Contact</p>
          <p className={styles.contactText}>{data.contact.address}</p>
          <p><a href={`mailto:${data.contact.email}`}>{data.contact.email}</a></p>
          {data.contact.phone && <p><a href={`tel:${data.contact.phone.replace(/\s/g, '')}`}>{data.contact.phone}</a></p>}
          <div className={styles.socials}>
            {data.socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>{s.label}</a>
            ))}
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <p className="eyebrow">© {new Date().getFullYear()} {data.copyrightHolder}</p>
      </div>
    </footer>
  );
}
