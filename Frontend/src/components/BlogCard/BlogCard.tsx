import { Link } from 'react-router-dom';
import type { Blog } from '../../types';
import styles from './BlogCard.module.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article className={styles.card}>
      <Link className={styles.imageLink} to={blog.href} aria-label={blog.title}>
        <img src={blog.image.src} srcSet={blog.image.srcSet} sizes={blog.image.sizes} alt={blog.image.alt} width={blog.image.width} height={blog.image.height} loading="lazy" />
      </Link>
      <div className={styles.body}>
        <p className="eyebrow">{blog.category} · {formatDate(blog.publishedAt)} · {blog.readingMinutes} min</p>
        <h3>
          <Link to={blog.href}>{blog.title}</Link>
        </h3>
        <p className={styles.excerpt}>{blog.excerpt}</p>
        <p className={styles.author}>By {blog.author}</p>
      </div>
    </article>
  );
}
