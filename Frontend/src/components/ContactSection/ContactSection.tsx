import { useState } from 'react';
import SectionHeading from '../SectionHeading/SectionHeading';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setEmail('');
    setMessage('');
  };

  return (
    <section id="contact" className={`container section ${styles.contact}`} aria-labelledby="contact-title" tabIndex={-1}>
      <SectionHeading
        eyebrow="Contact"
        title="Talk to us."
        description="Whether you have an idea, a question, or you just want to hang out at the next build night — we’d love to hear from you."
        id="contact-title"
      />
      <div className={styles.grid}>
        <div className={styles.info}>
          <div className={styles.infoCard}>
            <h3>Visit</h3>
            <p>Sagar Institute of Research & Technology<br />Ayodhya Bypass Road, Bhopal, MP 462041</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Email</h3>
            <p><a href="mailto:edc@sirtbhopal.ac.in">edc@sirtbhopal.ac.in</a></p>
          </div>
          <div className={styles.infoCard}>
            <h3>Hours</h3>
            <p>Mon–Sat, 10am–6pm · Drop by the Innovation Lab</p>
          </div>
        </div>
        <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Contact form">
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required aria-required="true" />
          </label>
          <label>
            <span>Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about your idea..." rows={4} required aria-required="true" />
          </label>
          <button type="submit" className={styles.submit}>Send message</button>
          {status === 'success' && <p role="status" className={styles.success}>Thanks — we’ll get back to you soon.</p>}
          {status === 'error' && <p role="alert" className={styles.error}>Please fill in both fields.</p>}
        </form>
      </div>
    </section>
  );
}
