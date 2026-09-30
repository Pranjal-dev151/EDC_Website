import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types';
import { AuthError, createEvent, deleteEvent, listEvents, updateEvent } from '../../services/adminApi';
import styles from './Admin.module.css';

interface EventForm {
  title: string;
  slug: string;
  summary: string;
  category: string;
  location: string;
  starts_at: string;
  published: boolean;
  image_url: string;
  image_alt: string;
}

const EMPTY: EventForm = {
  title: '',
  slug: '',
  summary: '',
  category: '',
  location: '',
  starts_at: '',
  published: true,
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

function toPayload(form: EventForm): Record<string, unknown> {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    summary: form.summary,
    category: form.category,
    location: form.location,
    starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
    published: form.published,
    image_url: form.image_url,
    image_alt: form.image_alt,
  };
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState('Loading…');
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus('Loading…');
    setError(null);
    try {
      setEvents(await listEvents());
      setStatus('');
    } catch (err) {
      if (err instanceof AuthError) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load events.');
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

  function openEdit(ev: Event) {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      slug: ev.slug,
      summary: ev.summary,
      category: ev.category,
      location: ev.location,
      starts_at: toDateTimeLocal(ev.startsAt),
      published: true,
      image_url: ev.image.src,
      image_alt: ev.image.alt,
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
      if (editingId) await updateEvent(editingId, payload);
      else await createEvent(payload);
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

  async function onDelete(ev: Event) {
    if (!window.confirm(`Delete "${ev.title}"?`)) return;
    try {
      await deleteEvent(ev.id);
      await load();
    } catch (err) {
      if (err instanceof AuthError) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  function set<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.title}>Events</h1>
          <p className={styles.subtitle}>Create, edit, and delete events.</p>
        </div>
        <button type="button" className={styles.button} onClick={openNew}>
          New event
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
        <form className={styles.form} onSubmit={onSave} aria-label="Event form">
          <div className={styles.field}>
            <label htmlFor="event-title">Title</label>
            <input id="event-title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="event-slug">Slug (optional)</label>
              <input id="event-slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from title" />
            </div>
            <div className={styles.field}>
              <label htmlFor="event-category">Category</label>
              <input id="event-category" value={form.category} onChange={(e) => set('category', e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="event-summary">Summary</label>
            <textarea id="event-summary" value={form.summary} onChange={(e) => set('summary', e.target.value)} rows={3} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="event-location">Location</label>
              <input id="event-location" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="event-starts">Starts at</label>
              <input id="event-starts" type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="event-image-url">Image URL</label>
              <input id="event-image-url" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="event-image-alt">Image alt</label>
              <input id="event-image-alt" value={form.image_alt} onChange={(e) => set('image_alt', e.target.value)} />
            </div>
          </div>
          <label className={styles.check} htmlFor="event-published">
            <input id="event-published" type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
            Published
          </label>
          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create event'}
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
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{ev.category}</td>
                <td>{new Date(ev.startsAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.buttonSecondary} onClick={() => openEdit(ev)}>
                      Edit
                    </button>
                    <button type="button" className={styles.buttonSecondary} onClick={() => void onDelete(ev)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && !status && (
              <tr>
                <td colSpan={4}>No events yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
