import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Blog } from '../../types';
import { AuthError, createBlog, deleteBlog, listBlogs, updateBlog } from '../../services/adminApi';
import styles from './Admin.module.css';

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  reading_minutes: string;
  featured: boolean;
  published: boolean;
  published_at: string;
  image_url: string;
  image_alt: string;
}

const EMPTY: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  author: '',
  category: '',
  reading_minutes: '5',
  featured: false,
  published: true,
  published_at: '',
  image_url: '',
  image_alt: '',
};

function toDateTimeLocal(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toPayload(form: BlogForm): Record<string, unknown> {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    excerpt: form.excerpt,
    author: form.author,
    category: form.category,
    reading_minutes: Number.parseInt(form.reading_minutes, 10) || 5,
    featured: form.featured,
    published: form.published,
    published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
    image_url: form.image_url,
    image_alt: form.image_alt,
  };
}

export default function AdminBlogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [status, setStatus] = useState('Loading…');
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus('Loading…');
    setError(null);
    try {
      setBlogs(await listBlogs());
      setStatus('');
    } catch (err) {
      if (err instanceof AuthError) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load blogs.');
      setStatus('');
    }
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY);
    setFormOpen(true);
  }

  function openEdit(blog: Blog) {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      author: blog.author,
      category: blog.category,
      reading_minutes: String(blog.readingMinutes),
      featured: blog.featured,
      published: true,
      published_at: toDateTimeLocal(blog.publishedAt),
      image_url: blog.image.src,
      image_alt: blog.image.alt,
    });
    setFormOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = toPayload(form);
      if (editingId) await updateBlog(editingId, payload);
      else await createBlog(payload);
      setFormOpen(false);
      await load();
    } catch (err) {
      if (err instanceof AuthError) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(blog: Blog) {
    if (!window.confirm(`Delete "${blog.title}"?`)) return;
    try {
      await deleteBlog(blog.id);
      await load();
    } catch (err) {
      if (err instanceof AuthError) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  function set<K extends keyof BlogForm>(key: K, value: BlogForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.title}>Blogs</h1>
          <p className={styles.subtitle}>Create, edit, and delete blog posts.</p>
        </div>
        <button type="button" className={styles.button} onClick={openNew}>
          New blog
        </button>
      </div>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {status && (
        <p role="status" className={styles.status}>
          {status}
        </p>
      )}

      {formOpen && (
        <form className={styles.form} onSubmit={onSave} aria-label="Blog form">
          <div className={styles.field}>
            <label htmlFor="blog-title">Title</label>
            <input id="blog-title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="blog-slug">Slug (optional)</label>
              <input id="blog-slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from title" />
            </div>
            <div className={styles.field}>
              <label htmlFor="blog-author">Author</label>
              <input id="blog-author" value={form.author} onChange={(e) => set('author', e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="blog-excerpt">Excerpt</label>
            <textarea id="blog-excerpt" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={3} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="blog-category">Category</label>
              <input id="blog-category" value={form.category} onChange={(e) => set('category', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="blog-reading">Reading minutes</label>
              <input id="blog-reading" type="number" min={1} value={form.reading_minutes} onChange={(e) => set('reading_minutes', e.target.value)} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="blog-published-at">Published at</label>
              <input id="blog-published-at" type="datetime-local" value={form.published_at} onChange={(e) => set('published_at', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="blog-image-url">Image URL</label>
              <input id="blog-image-url" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="blog-image-alt">Image alt</label>
            <input id="blog-image-alt" value={form.image_alt} onChange={(e) => set('image_alt', e.target.value)} />
          </div>
          <div className={styles.row}>
            <label className={styles.check} htmlFor="blog-featured">
              <input id="blog-featured" type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              Featured
            </label>
            <label className={styles.check} htmlFor="blog-published">
              <input id="blog-published" type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
              Published
            </label>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create blog'}
            </button>
            <button type="button" className={styles.buttonSecondary} onClick={() => setFormOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Category</th>
              <th scope="col">Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.category}</td>
                <td>{new Date(b.publishedAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.buttonSecondary} onClick={() => openEdit(b)}>
                      Edit
                    </button>
                    <button type="button" className={styles.buttonSecondary} onClick={() => void onDelete(b)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && !status && (
              <tr>
                <td colSpan={4}>No blogs yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
