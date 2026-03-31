export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  video_url?: string;
  category: string;
  author: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  reactions: Record<string, string>;
  comments: NewsComment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'participant';
  createdAt: string;
  approved?: boolean;
  authProvider?: 'local' | 'google';
  avatar?: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  video_url?: string;
  category: string;
  published: boolean;
}

export interface NewsComment {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  guestEmail?: string;
  content: string;
  createdAt: string;
}

export interface ActivityMediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  src: string;
}

export interface ContactItem {
  id: string;
  title: string;
  icon: string;
  value: string;
  link: string;
  highlight?: boolean;
}

export interface NavLinkItem {
  id: string;
  name: string;
  href: string;
}

export interface HomeContent {
  aboutBadge: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutQuote: string;
  aboutQuoteAuthor: string;
  activitiesTitle: string;
  activitiesDescription: string;
  activitiesMedia: ActivityMediaItem[];
  contactBadge: string;
  contactTitle: string;
  contactDescription: string;
  contacts: ContactItem[];
  navLinks: NavLinkItem[];
}

export interface AdSettings {
  enabled: boolean;
  ads: ContentAd[];
  positions: Record<string, {
    enabled: boolean;
    width: number | string;
    maxHeight: number | string;
  }>;
}

export interface ContentAd {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  positions: string[];
  enabled: boolean;
  width: number | string;
  height: number | string;
}
