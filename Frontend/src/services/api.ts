import { aboutContent } from '../data/aboutContent';
import { blogs } from '../data/blogs';
import { contacts } from '../data/contacts';
import { events } from '../data/events';
import { footerData } from '../data/footerData';
import { gallery } from '../data/gallery';
import { initiatives } from '../data/initiatives';
import { headerContent, siteSettings } from '../data/siteSettings';
import { socials } from '../data/socials';
import { team } from '../data/team';
import type {
  AboutContent,
  Blog,
  ContactPerson,
  Event,
  FooterData,
  GalleryItem,
  HeaderContent,
  Initiative,
  SiteSettings,
  SocialLink,
  TeamMember,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

async function fetchJson<T>(path: string, signal: AbortSignal, fallback: T): Promise<T> {
  if (!API_URL) return fallback;
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, { signal });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = (await res.json()) as T;
    return data;
  } catch (err) {
    if (signal.aborted) throw err;
    // Fallback to local mock data if remote unavailable.
    return fallback;
  }
}

export async function getHeaderContent(signal?: AbortSignal): Promise<HeaderContent> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/header', s, headerContent);
}

export async function getSiteSettings(signal?: AbortSignal): Promise<SiteSettings> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/settings', s, siteSettings);
}

export async function getAboutContent(signal?: AbortSignal): Promise<AboutContent> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/about', s, aboutContent);
}

export async function getInitiatives(signal?: AbortSignal): Promise<Initiative[]> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/initiatives', s, initiatives);
}

export async function getEvents(signal?: AbortSignal): Promise<Event[]> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/events', s, events);
}

export async function getBlogs(signal?: AbortSignal): Promise<Blog[]> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/blogs', s, blogs);
}

export async function getGallery(signal?: AbortSignal): Promise<GalleryItem[]> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/gallery', s, gallery);
}

export async function getTeam(signal?: AbortSignal): Promise<TeamMember[]> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/team', s, team);
}

export async function getContacts(signal?: AbortSignal): Promise<ContactPerson[]> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/contacts', s, contacts);
}

export async function getSocials(signal?: AbortSignal): Promise<SocialLink[]> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/socials', s, socials);
}

export async function getFooterData(signal?: AbortSignal): Promise<FooterData> {
  const s = signal ?? new AbortController().signal;
  return fetchJson('/footer', s, footerData);
}

// Public header content uses the local source during the scaffold phases.
// Remote content transport is introduced with the content sections, not auth forms.
export async function getHeaderContentLegacy(): Promise<HeaderContent> {
  return headerContent;
}
