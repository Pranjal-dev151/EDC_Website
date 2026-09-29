import { useRef, useState } from 'react';
import type { Event } from '../../types';
import styles from './EventCarousel.module.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function EventCarousel({ events }: { events: Event[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(events.length - 1, next));
    const child = track.children[clamped] as HTMLElement | undefined;
    if (child) {
      track.scrollTo({ left: child.offsetLeft - 16, behavior: 'smooth' });
      setIndex(clamped);
    }
  };

  return (
    <div className={styles.carousel} role="region" aria-label="Events carousel" aria-roledescription="carousel">
      <div className={styles.controls}>
        <p className={styles.count} aria-live="polite"><span className="eyebrow">{String(index + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}</span></p>
        <div className={styles.buttons}>
          <button type="button" onClick={() => scrollTo(index - 1)} disabled={index === 0} aria-label="Previous event">←</button>
          <button type="button" onClick={() => scrollTo(index + 1)} disabled={index === events.length - 1} aria-label="Next event">→</button>
        </div>
      </div>
      <div
        className={styles.track}
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label="Event cards"
        onScroll={(e) => {
          const el = e.currentTarget;
          const approx = Math.round(el.scrollLeft / (el.scrollWidth / events.length));
          setIndex(Math.max(0, Math.min(events.length - 1, approx)));
        }}
      >
        {events.map((event) => (
          <article key={event.id} className={styles.card} aria-roledescription="slide" aria-label={event.title}>
            <div className={styles.imageWrap}>
              <img src={event.image.src} srcSet={event.image.srcSet} sizes={event.image.sizes} alt={event.image.alt} width={event.image.width} height={event.image.height} loading="lazy" />
            </div>
            <div className={styles.body}>
              <p className="eyebrow">{event.category} · {formatDate(event.startsAt)}</p>
              <h3>{event.title}</h3>
              <p className={styles.summary}>{event.summary}</p>
              <p className={styles.location}>{event.location}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
