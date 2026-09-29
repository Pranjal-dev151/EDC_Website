import { useState } from 'react';
import ContactSection from '../components/ContactSection/ContactSection';
import TeamCard from '../components/TeamCard/TeamCard';
import { useContent } from '../hooks/useContent';
import { getContacts, getTeam } from '../services/api';
import styles from './Contact.module.css';

export default function Contact() {
  const { data: team } = useContent(getTeam);
  const { data: contacts } = useContent(getContacts);
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setFormStatus('success');
    setName(''); setEmail(''); setMessage('');
  };

  return (
    <div className={styles.page}>
      <section className={`container section ${styles.intro}`}>
        <p className="eyebrow">Contact</p>
        <h1>Get in touch.</h1>
        <p className={styles.lead}>Reach our helpdesk, incubation team, or events crew — or meet the students who run EDC SIRT.</p>
        {contacts && (
          <div className={styles.contacts}>
            {contacts.map((c) => (
              <div key={c.id} className={styles.contactCard}>
                <img src={c.photo.src} srcSet={c.photo.srcSet} sizes={c.photo.sizes} alt={c.photo.alt} width={c.photo.width} height={c.photo.height} loading="lazy" />
                <div>
                  <h3>{c.name}</h3>
                  <p className="eyebrow">{c.role}</p>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </div>
              </div>
            ))}
          </div>
        )}
        <form className={styles.form} onSubmit={onSubmit} aria-label="Contact form">
          <label><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required /></label>
          <label><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
          <label><span>Message</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={4} required /></label>
          <button type="submit">Send message</button>
          {formStatus === 'success' && <p role="status" className={styles.success}>Thanks — we’ll reply soon.</p>}
        </form>
      </section>

      {team && (
        <section className={`container section ${styles.team}`} aria-labelledby="team-title">
          <p className="eyebrow">Team</p>
          <h2 id="team-title">The students behind EDC SIRT.</h2>
          <div className={styles.grid}>
            {team.map((member) => <TeamCard key={member.id} member={member} />)}
          </div>
        </section>
      )}

      <ContactSection />
    </div>
  );
}
