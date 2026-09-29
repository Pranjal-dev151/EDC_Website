import { useState } from 'react';
import GalleryCard from '../components/GalleryCard/GalleryCard';
import GalleryModal from '../components/GalleryModal/GalleryModal';
import { useContent } from '../hooks/useContent';
import { getGallery } from '../services/api';
import type { GalleryItem } from '../types';
import styles from './Gallery.module.css';

export default function Gallery() {
  const { data, error, loading } = useContent(getGallery);
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState('All');

  if (loading) return <section className="container section"><p>Loading gallery…</p></section>;
  if (error || !data) return <section className="container section" role="alert"><p>Gallery could not be loaded.</p></section>;

  const categories = ['All', ...Array.from(new Set(data.map((g) => g.category)))];
  const filtered = filter === 'All' ? data : data.filter((g) => g.category === filter);

  return (
    <div className={`container section ${styles.page}`}>
      <div data-header-region data-page-top-sentinel aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 1, opacity: 0, pointerEvents: 'none', zIndex: -1 }} />
      <header className={styles.header}>
        <p className="eyebrow">Gallery</p>
        <h1>Moments from the community.</h1>
      </header>
      <div className={styles.filters} role="tablist" aria-label="Gallery categories">
        {categories.map((cat) => (
          <button key={cat} role="tab" aria-selected={filter === cat} type="button" onClick={() => setFilter(cat)}>{cat}</button>
        ))}
      </div>
      <div className={styles.grid}>
        {filtered.map((item) => <GalleryCard key={item.id} item={item} onOpen={() => setActive(item)} />)}
      </div>
      <GalleryModal item={active} onClose={() => setActive(null)} />
    </div>
  );
}
