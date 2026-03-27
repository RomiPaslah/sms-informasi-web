/**
 * SMS Informasi Web — API Client
 * Utility untuk memanggil PHP backend API
 */

// Base URL API — sama-origin di production, proxy di dev
const API_BASE = '/api';

class ApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    credentials: 'include', // send session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error || `HTTP Error ${res.status}`,
      res.status,
      data.code
    );
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'participant';
  approved: boolean;
  isPrimaryAdmin: boolean;
  createdAt: string;
  authProvider?: string;
}

export const authApi = {
  me: () =>
    apiFetch<{ user: ApiUser | null }>('/auth.php?action=me'),

  login: (email: string, password: string) =>
    apiFetch<{ success: boolean; user: ApiUser }>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () =>
    apiFetch<{ success: boolean }>('/auth.php?action=logout', { method: 'POST' }),

  getUsers: () =>
    apiFetch<{ users: ApiUser[] }>('/auth.php?action=users'),

  approveUser: (email: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth.php?action=approve', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  rejectUser: (email: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth.php?action=reject', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  promoteUser: (email: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth.php?action=promote', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  changePassword: (email: string, newPassword: string, currentPassword?: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth.php?action=change_password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword, currentPassword }),
    }),
};

// ── News ──────────────────────────────────────────────────────────────────────

export interface ApiComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ApiNews {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  comments: ApiComment[];
  reactions: Record<string, string>;
  commentCount?: number;
}

export interface NewsFormPayload {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  published: boolean;
}

export const newsApi = {
  getAll: () =>
    apiFetch<{ news: ApiNews[] }>('/news.php'),

  getById: (id: string) =>
    apiFetch<{ news: ApiNews }>(`/news.php?id=${encodeURIComponent(id)}`),

  create: (data: NewsFormPayload) =>
    apiFetch<{ success: boolean; news: ApiNews }>('/news.php', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<NewsFormPayload>) =>
    apiFetch<{ success: boolean; news: ApiNews }>(`/news.php?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/news.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  togglePublish: (id: string) =>
    apiFetch<{ success: boolean; published: boolean }>(
      `/news.php?action=toggle_publish&id=${encodeURIComponent(id)}`,
      { method: 'POST' }
    ),
};

// ── Comments ──────────────────────────────────────────────────────────────────

export const commentsApi = {
  add: (newsId: string, content: string) =>
    apiFetch<{ success: boolean; comment: ApiComment }>('/comments.php', {
      method: 'POST',
      body: JSON.stringify({ newsId, content }),
    }),

  delete: (commentId: string) =>
    apiFetch<{ success: boolean }>(`/comments.php?id=${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
    }),
};

// ── Reactions ─────────────────────────────────────────────────────────────────

export const reactionsApi = {
  toggle: (newsId: string, emoji: string) =>
    apiFetch<{ success: boolean; emoji: string }>('/reactions.php', {
      method: 'POST',
      body: JSON.stringify({ newsId, emoji }),
    }),
};

// ── Site Content ──────────────────────────────────────────────────────────────

export const siteContentApi = {
  get: (key: 'homepage' | 'ad_settings') =>
    apiFetch<{ success: boolean; data: unknown }>(`/site_content.php?key=${key}`),

  update: (key: 'homepage' | 'ad_settings', data: unknown) =>
    apiFetch<{ success: boolean; message: string }>(`/site_content.php?key=${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export { ApiError };
