export interface ContentImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet: string;
  sizes: string;
}

export interface Initiative {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  href: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  summary: string;
  startsAt: string;
  location: string;
  category: string;
  image: ContentImage;
  href: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  category: string;
  featured: boolean;
  image: ContentImage;
  href: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  capturedAt: string;
  location: string;
  image: ContentImage;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  photo: ContentImage;
  email?: string;
  socials?: SocialLink[];
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  photo: ContentImage;
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'x' | 'linkedin' | 'facebook' | 'youtube';
  label: string;
  url: string;
}

export interface FooterData {
  identity: string;
  description: string;
  newsletter: { title: string; description: string };
  initiatives: { label: string; href: string }[];
  usefulLinks: { label: string; href: string }[];
  contact: { address: string; email: string; phone?: string };
  socials: SocialLink[];
  copyrightHolder: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  origin: { title: string; body: string };
  vision: { title: string; body: string };
  image?: ContentImage;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  institution: string;
  description: string;
  logo: { src: string; alt: string; width: number; height: number };
  hero: { eyebrow: string; title: string; description: string; primaryLink: { label: string; href: string }; secondaryLink: { label: string; href: string } };
  contactEmail: string;
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface HeaderContent {
  name: string;
  logo: SiteSettings['logo'];
  navigation: {
    home: NavigationItem[];
    inner: NavigationItem[];
    auth: NavigationItem[];
  };
  joinLinks: NavigationItem[];
}

export interface SiteContent {
  about: AboutContent;
  blogs: Blog[];
  contacts: ContactPerson[];
  events: Event[];
  footer: FooterData;
  gallery: GalleryItem[];
  initiatives: Initiative[];
  settings: SiteSettings;
  socials: SocialLink[];
  team: TeamMember[];
}
