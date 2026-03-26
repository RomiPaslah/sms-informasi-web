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
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  published: boolean;
}
