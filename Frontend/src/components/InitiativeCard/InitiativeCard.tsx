import type { Initiative } from '../../types';
import styles from './InitiativeCard.module.css';

export default function InitiativeCard({ initiative }: { initiative: Initiative }) {
  return (
    <article className={styles.card}>
      <p className="eyebrow">{initiative.category}</p>
      <h3>{initiative.title}</h3>
      <p className={styles.summary}>{initiative.summary}</p>
      <a className={styles.link} href={initiative.href} aria-label={`Learn more about ${initiative.title}`}>
        Learn more <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}
