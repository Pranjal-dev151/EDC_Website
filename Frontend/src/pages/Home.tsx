import { Link } from 'react-router-dom';
import AboutSection from '../components/AboutSection/AboutSection';
import BlogCard from '../components/BlogCard/BlogCard';
import ContactSection from '../components/ContactSection/ContactSection';
import EventCarousel from '../components/EventCarousel/EventCarousel';
import { ErrorBoundary } from '../components/ErrorBoundary';
import Hero from '../components/Hero/Hero';
import InitiativeCard from '../components/InitiativeCard/InitiativeCard';
import Reveal from '../components/Reveal/Reveal';
import SectionHeading from '../components/SectionHeading/SectionHeading';
import { useContent } from '../hooks/useContent';
import { getAboutContent, getBlogs, getEvents, getInitiatives, getSiteSettings } from '../services/api';
import styles from './Home.module.css';

export default function Home() {
  const { data: settings } = useContent(getSiteSettings);
  const { data: about } = useContent(getAboutContent);
  const { data: initiatives } = useContent(getInitiatives);
  const { data: events } = useContent(getEvents);
  const { data: blogs } = useContent(getBlogs);

  const featured = blogs?.filter((b) => b.featured).slice(0, 3) ?? [];

  // Fallback hero content while settings load
  const hero = settings?.hero ?? {
    eyebrow: 'Entrepreneurship Development Cell — SIRT Bhopal',
    title: 'Build what matters.',
    description: 'A student-led community turning curiosity into companies. Workshops, mentorship, and founder stories — designed so you can start now and learn fast.',
    primaryLink: { label: 'Explore Initiatives', href: '/#initiatives' },
    secondaryLink: { label: 'View Events', href: '/#events' },
  };

  return (
    <div className={styles.page}>
      <ErrorBoundary name="Hero">
        <Hero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} primaryLink={hero.primaryLink} secondaryLink={hero.secondaryLink} />
      </ErrorBoundary>
      <div className={styles.aboutGlow} aria-hidden="true" />

      <ErrorBoundary name="AboutSection">
        {about ? <AboutSection content={about} /> : <section className="container section"><p>Loading about…</p></section>}
      </ErrorBoundary>

      <ErrorBoundary name="Initiatives">
        <section id="initiatives" className={`container section ${styles.section}`} aria-labelledby="initiatives-title" tabIndex={-1}>
          <SectionHeading eyebrow="Initiatives" title="Programs that move you from idea to launch." description="Pick where you are and we’ll meet you there — whether you’re sketching an idea or shipping a product." id="initiatives-title" />
          {initiatives ? (
            <div className={styles.gridInitiatives}>
              {initiatives.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.06}>
                  <InitiativeCard initiative={item} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p>Loading initiatives…</p>
          )}
        </section>
      </ErrorBoundary>

      <ErrorBoundary name="Events">
        <section id="events" className={`container section ${styles.section}`} aria-labelledby="events-title" tabIndex={-1}>
          <SectionHeading eyebrow="Events" title="Learn, build, and pitch — together." description="Workshops, demo days, and founder conversations on campus and online." id="events-title" />
          {events ? <EventCarousel events={events} /> : <p>Loading events…</p>}
        </section>
      </ErrorBoundary>

      <ErrorBoundary name="FeaturedBlogs">
        <section id="blogs" className={`container section ${styles.section}`} aria-labelledby="featured-blogs-title" tabIndex={-1}>
          <div className={styles.headingRow}>
            <SectionHeading eyebrow="Blogs" title="Featured writing" description="Playbooks and stories from SIRT founders and friends." id="featured-blogs-title" />
            <Link className={styles.viewAll} to="/blogs">View all blogs <span aria-hidden="true">↗</span></Link>
          </div>
          {featured.length > 0 ? (
            <div className={styles.gridBlogs}>
              {featured.map((blog, i) => (
                <Reveal key={blog.id} delay={i * 0.06}>
                  <BlogCard blog={blog} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p>Loading blogs…</p>
          )}
        </section>
      </ErrorBoundary>

      <ErrorBoundary name="ContactSection">
        <ContactSection />
      </ErrorBoundary>

      <ErrorBoundary name="CTA">
        <Reveal className={`container section ${styles.cta}`} as="section">
          <h2>Ready to start?</h2>
          <p>Join the next build night or bring an idea to office hours. No perfect pitch required.</p>
          <div className={styles.ctaActions}>
            <Link className={styles.ctaPrimary} to="/register">Join EDC SIRT</Link>
            <Link className={styles.ctaSecondary} to="/contact">Talk to us</Link>
          </div>
        </Reveal>
      </ErrorBoundary>
    </div>
  );
}
