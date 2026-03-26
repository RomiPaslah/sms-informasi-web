import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { News, NewsComment, NewsFormData } from '@/types';

interface NewsContextType {
  news: News[];
  publishedNews: News[];
  getNewsById: (id: string) => News | undefined;
  getNewsByCategory: (category: string) => News[];
  createNews: (data: NewsFormData, author: string) => News;
  updateNews: (id: string, data: Partial<NewsFormData>) => News | null;
  deleteNews: (id: string) => boolean;
  searchNews: (query: string) => News[];
  setReaction: (newsId: string, userId: string, emoji: string) => void;
  addComment: (newsId: string, comment: Omit<NewsComment, 'id' | 'createdAt'>) => boolean;
  deleteComment: (newsId: string, commentId: string) => boolean;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

const STORAGE_KEY = 'sms_news';

const SAMPLE_NEWS: News[] = [
  {
    id: '1',
    title: 'SMS Resmi Meluncurkan Platform Digital Independen',
    content: `<p>Sinergi Muda Strategis (SMS) dengan bangga mengumumkan peluncuran platform digitalnya yang bertujuan menjadi kanal berita online independen. Platform ini hadir untuk menjawab tantangan era disrupsi informasi dengan menyajikan berita yang akurat, tajam, dan edukatif.</p>
    <p>"Kami hadir untuk memastikan suara pemuda dan keadilan memiliki ruang yang jernih di dunia digital," ujar Krispol Siregar, S.H., Ketua Umum SMS.</p>
    <p>Platform ini akan fokus pada pengawalan isu-isu strategis dan keadilan bagi masyarakat, khususnya di wilayah Majalengka dan sekitarnya.</p>`,
    excerpt: 'Sinergi Muda Strategis (SMS) meluncurkan platform digital independen untuk menyajikan berita yang akurat dan edukatif.',
    image: '/images/hero-bg.jpg',
    category: 'Pengumuman',
    author: 'Admin SMS',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    published: true,
    reactions: {},
    comments: [],
  },
  {
    id: '2',
    title: 'Pemuda Majalengka Diajak Aktif dalam Literasi Digital',
    content: `<p>Dalam era digital yang semakin berkembang, pemuda di Majalengka diajak untuk lebih aktif dalam literasi digital. SMS mengadakan workshop literasi digital bertajuk "Digital Independen untuk Keadilan" yang dihadiri ratusan pemuda dari berbagai daerah di Jawa Barat.</p>
    <p>Workshop ini membahas pentingnya kemampuan menganalisis informasi di media digital, memilah berita hoax, dan menyebarkan konten positif.</p>
    <p>"Literasi digital adalah kunci untuk menjadi generasi yang kritis dan tidak mudah terpengaruh oleh informasi palsu," kata salah satu peserta workshop.</p>`,
    excerpt: 'SMS mengadakan workshop literasi digital untuk pemuda Majalengka guna meningkatkan kemampuan menganalisis informasi.',
    image: '/images/about-img.jpg',
    category: 'Kegiatan',
    author: 'Admin SMS',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    published: true,
    reactions: {},
    comments: [],
  },
  {
    id: '3',
    title: 'Mengawal Isu Ketenagakerjaan di Majalengka',
    content: `<p>SMS terus mengawal isu-isu ketenagakerjaan di Kabupaten Majalengka. Tim SMS melakukan investigasi terkait kondisi buruh di beberapa pabrik tekstil di wilayah ini.</p>
    <p>Dari hasil investigasi, ditemukan beberapa temuan penting terkait kesejahteraan buruh yang perlu mendapat perhatian serius dari pemerintah dan pengusaha.</p>
    <p>SMS berkomitmen untuk terus mengawal isu ini dan menjadi suara bagi para pekerja yang belum terwakili.</p>`,
    excerpt: 'Tim SMS melakukan investigasi terkait kondisi buruh di pabrik-pabrik tekstil di Majalengka.',
    image: '/images/majalengka-collage.jpg',
    category: 'Investigasi',
    author: 'Admin SMS',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    published: true,
    reactions: {},
    comments: [],
  },
];

const normalizeNews = (item: News): News => ({
  ...item,
  reactions: item.reactions ?? {},
  comments: item.comments ?? [],
});

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<News[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNews((JSON.parse(stored) as News[]).map(normalizeNews));
      } catch {
        setNews(SAMPLE_NEWS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NEWS));
      }
    } else {
      setNews(SAMPLE_NEWS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NEWS));
    }
  }, []);

  useEffect(() => {
    if (mounted && news.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
    }
  }, [news, mounted]);

  const publishedNews = news.filter((item) => item.published);

  const getNewsById = (id: string) => news.find((item) => item.id === id);

  const getNewsByCategory = (category: string) => {
    return publishedNews.filter((item) => item.category === category);
  };

  const createNews = (data: NewsFormData, author: string): News => {
    const newNews: News = {
      id: uuidv4(),
      ...data,
      author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: {},
      comments: [],
    };
    setNews((prev) => [newNews, ...prev]);
    return newNews;
  };

  const updateNews = (id: string, data: Partial<NewsFormData>): News | null => {
    let updated: News | null = null;
    setNews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updated = { ...item, ...data, updatedAt: new Date().toISOString() };
          return updated;
        }
        return item;
      })
    );
    return updated;
  };

  const deleteNews = (id: string): boolean => {
    const exists = news.some((item) => item.id === id);
    if (exists) {
      setNews((prev) => prev.filter((item) => item.id !== id));
      return true;
    }
    return false;
  };

  const searchNews = (query: string): News[] => {
    const lowerQuery = query.toLowerCase();
    return publishedNews.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.excerpt.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery)
    );
  };

  const setReaction = (newsId: string, userId: string, emoji: string) => {
    setNews((prev) =>
      prev.map((item) =>
        item.id === newsId
          ? {
              ...item,
              reactions: {
                ...item.reactions,
                [userId]: item.reactions[userId] === emoji ? '' : emoji,
              },
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const addComment = (newsId: string, comment: Omit<NewsComment, 'id' | 'createdAt'>) => {
    let added = false;
    setNews((prev) =>
      prev.map((item) => {
        if (item.id !== newsId) {
          return item;
        }

        added = true;
        return {
          ...item,
          comments: [
            ...item.comments,
            {
              ...comment,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    return added;
  };

  const deleteComment = (newsId: string, commentId: string) => {
    let deleted = false;
    setNews((prev) =>
      prev.map((item) => {
        if (item.id !== newsId || !item.comments.some((comment) => comment.id === commentId)) {
          return item;
        }

        deleted = true;
        return {
          ...item,
          comments: item.comments.filter((comment) => comment.id !== commentId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    return deleted;
  };

  return (
    <NewsContext.Provider
      value={{
        news,
        publishedNews,
        getNewsById,
        getNewsByCategory,
        createNews,
        updateNews,
        deleteNews,
        searchNews,
        setReaction,
        addComment,
        deleteComment,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}
