import { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard/BlogCard';
import { useContent } from '../hooks/useContent';
import { getBlogs } from '../services/api';
import styles from './Blogs.module.css';

export default function Blogs() {
  const { data, error, loading } = useContent(getBlogs);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  useEffect(() => {
    // Debug for BUG 2 header trigger
    // eslint-disable-next-line no-console
    console.log('Blogs mounted, triggers found:', document.querySelectorAll('[data-header-region]').length);
  }, []);

  if (loading) return <section className="container section"><p>Loading blogs…</p></section>;
  if (error || !data) return <section className="container section" role="alert"><p>Blogs could not be loaded.</p></section>;

  const categories = ['All', ...Array.from(new Set(data.map((b) => b.category)))];
  const filtered = filter === 'All' ? data : data.filter((b) => b.category === filter);

  return (
    <div className={`container section ${styles.page}`}>
      <div data-header-region data-page-top-sentinel aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 1, opacity: 0, pointerEvents: 'none', zIndex: -1 }} />
      <header className={styles.header}>
        <p className="eyebrow">Blogs</p>
        <h1>Ideas, stories, and playbooks from campus founders.</h1>
      </header>
      <div className={styles.filters} role="tablist" aria-label="Blog categories">
        {categories.map((cat) => (
          <button key={cat} role="tab" aria-selected={filter === cat} className={filter === cat ? styles.active : ''} type="button" onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {filtered.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
      </div>
    </div>
  );
}
