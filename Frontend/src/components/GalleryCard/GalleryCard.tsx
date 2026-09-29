import type { GalleryItem } from '../../types';
import styles from './GalleryCard.module.css';

export default function GalleryCard({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  return (
    <article className={styles.card}>
      <button type="button" className={styles.button} onClick={onOpen} aria-label={`Open ${item.title}`}>
        <img src={item.image.src} srcSet={item.image.srcSet} sizes={item.image.sizes} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" />
        <span className={styles.overlay}>
          <span className="eyebrow">{item.category}</span>
          <strong>{item.title}</strong>
        </span>
      </button>
    </article>
  );
}
