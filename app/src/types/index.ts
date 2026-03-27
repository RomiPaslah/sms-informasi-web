export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
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
  authProvider?: 'local' | 'google';
  avatar?: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  published: boolean;
}

export interface NewsComment {
  id: string;
  userId: string;
  userName: string;
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
}

export interface AdSettings {
  enabled: boolean;
  adType: 'custom' | 'adsense';
  adsensePublisherId?: string;
  customAdHtml?: string;
  adPositions: {
    header: boolean;
    sidebar: boolean;
    footer: boolean;
    betweenContent: boolean;
  };
}
