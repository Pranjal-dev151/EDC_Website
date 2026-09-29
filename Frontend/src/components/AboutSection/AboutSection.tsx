import type { AboutContent } from '../../types';
import SectionHeading from '../SectionHeading/SectionHeading';
import Reveal from '../Reveal/Reveal';
import styles from './AboutSection.module.css';

export default function AboutSection({ content }: { content: AboutContent }) {
  return (
    <section id="about" className={`container section ${styles.about}`} aria-labelledby="about-title" tabIndex={-1}>
      <SectionHeading eyebrow={content.eyebrow} title={content.title} id="about-title" />
      <div className={styles.grid}>
        <Reveal className={styles.card}>
          <h3>{content.origin.title}</h3>
          <p>{content.origin.body}</p>
        </Reveal>
        <Reveal delay={0.08} className={styles.card}>
          <h3>{content.vision.title}</h3>
          <p>{content.vision.body}</p>
        </Reveal>
        {content.image && (
          <Reveal delay={0.16} className={styles.imageWrap}>
            <img
              src={content.image.src}
              srcSet={content.image.srcSet}
              sizes={content.image.sizes}
              alt={content.image.alt}
              width={content.image.width}
              height={content.image.height}
              loading="lazy"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
