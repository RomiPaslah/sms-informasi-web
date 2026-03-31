import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { newsApi, commentsApi, reactionsApi, type ApiNews } from '@/lib/api';
import type { News, NewsComment, NewsFormData } from '@/types';

interface NewsContextType {
  news: News[];
  publishedNews: News[];
  isLoading: boolean;
  getNewsById: (id: string) => News | undefined;
  getNewsByCategory: (category: string) => News[];
  createNews: (data: NewsFormData, author: string) => Promise<News | null>;
  updateNews: (id: string, data: Partial<NewsFormData>) => Promise<News | null>;
  deleteNews: (id: string) => Promise<boolean>;
  togglePublish: (id: string) => Promise<boolean>;
  searchNews: (query: string) => News[];
  setReaction: (newsId: string, userId: string, emoji: string) => Promise<void>;
  addComment: (newsId: string, comment: Omit<NewsComment, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteComment: (newsId: string, commentId: string) => Promise<boolean>;
  incrementNewsView: (newsId: string) => Promise<void>;
  refreshNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

function apiNewsToNews(apiNews: ApiNews): News {
  return {
    id: apiNews.id,
    title: apiNews.title,
    content: apiNews.content,
    excerpt: apiNews.excerpt,
    image: apiNews.image,
    category: apiNews.category,
    author: apiNews.author,
    views: apiNews.views ?? 0,
    createdAt: apiNews.createdAt,
    updatedAt: apiNews.updatedAt,
    published: apiNews.published,
    reactions: apiNews.reactions ?? {},
    comments: (apiNews.comments ?? []).map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.userName,
      content: c.content,
      createdAt: c.createdAt,
    })),
  };
}

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshNews = useCallback(async () => {
    try {
      const { news: apiNewsList } = await newsApi.getAll();
      setNews(apiNewsList.map(apiNewsToNews));
    } catch (err) {
      console.warn('[NewsContext] Failed to fetch news:', err);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshNews().finally(() => setIsLoading(false));
  }, [refreshNews]);

  const publishedNews = news.filter((item) => item.published);

  const getNewsById = (id: string): News | undefined =>
    news.find((item) => item.id === id);

  const getNewsByCategory = (category: string): News[] =>
    publishedNews.filter((item) => item.category === category);

  const searchNews = (query: string): News[] => {
    const lowerQuery = query.toLowerCase();
    return publishedNews.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(lowerQuery) ||
        (item.excerpt || '').toLowerCase().includes(lowerQuery) ||
        (item.content || '').toLowerCase().includes(lowerQuery)
    );
  };

  const createNews = async (data: NewsFormData, _author: string): Promise<News | null> => {
    try {
      const { news: created } = await newsApi.create(data);
      const newItem = apiNewsToNews(created);
      setNews((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('[NewsContext] createNews error:', err);
      return null;
    }
  };

  const updateNews = async (
    id: string,
    data: Partial<NewsFormData>
  ): Promise<News | null> => {
    try {
      const { news: updated } = await newsApi.update(id, data);
      const updatedItem = apiNewsToNews(updated);
      setNews((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
      return updatedItem;
    } catch (err) {
      console.error('[NewsContext] updateNews error:', err);
      return null;
    }
  };

  const deleteNews = async (id: string): Promise<boolean> => {
    try {
      await newsApi.delete(id);
      setNews((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  const togglePublish = async (id: string): Promise<boolean> => {
    try {
      const { published } = await newsApi.togglePublish(id);
      setNews((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, published, updatedAt: new Date().toISOString() } : item
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  const setReaction = async (
    newsId: string, 
    userId: string, 
    emoji: string,
    guestId?: string
  ): Promise<void> => {
    try {
      const payload = { newsId, emoji };
      if (userId && userId.startsWith('guest_')) {
        // Guest reaction
        Object.assign(payload, { guestId: userId });
      } else if (guestId) {
        // Explicitly passed guestId
        Object.assign(payload, { guestId });
      } else {
        // User reaction
        Object.assign(payload, { userId });
      }
      
      const { emoji: newEmoji } = await reactionsApi.toggle(newsId, emoji, payload);
      setNews((prev) =>
        prev.map((item) =>
          item.id === newsId
            ? {
                ...item,
                reactions: {
                  ...item.reactions,
                  [userId || guestId || '']: newEmoji,
                },
              }
            : item
        )
      );
    } catch (err) {
      console.error('[NewsContext] setReaction error:', err);
    }
  };

  const addComment = async (
    newsId: string,
    comment: Omit<NewsComment, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      const { comment: newComment } = await commentsApi.add(
        newsId, 
        comment.content,
        comment.userName || comment.guestEmail ? {
          userName: comment.userName,
          guestEmail: comment.guestEmail,
        } : undefined
      );
      setNews((prev) =>
        prev.map((item) =>
          item.id === newsId
            ? {
                ...item,
                comments: [
                  ...item.comments,
                  {
                    id: newComment.id,
                    userId: newComment.userId,
                    userName: newComment.userName,
                    userEmail: newComment.userEmail,
                    guestEmail: newComment.guestEmail,
                    content: newComment.content,
                    createdAt: newComment.createdAt,
                  },
                ],
              }
            : item
        )
      );
      return true;
    } catch (err) {
      console.error('[NewsContext] addComment error:', err);
      return false;
    }
  };

  const deleteComment = async (newsId: string, commentId: string): Promise<boolean> => {
    try {
      await commentsApi.delete(commentId);
      setNews((prev) =>
        prev.map((item) =>
          item.id === newsId
            ? {
                ...item,
                comments: item.comments.filter((c) => c.id !== commentId),
              }
            : item
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  const incrementNewsView = async (newsId: string): Promise<void> => {
    try {
      const response = await newsApi.incrementView(newsId);
      if (response.success) {
        setNews((prev) =>
          prev.map((item) =>
            item.id === newsId ? { ...item, views: response.views } : item
          )
        );
      }
    } catch (err) {
      console.error('[NewsContext] incrementNewsView error:', err);
      // Silently fail - not critical for user experience
    }
  };

  return (
    <NewsContext.Provider
      value={{
        news,
        publishedNews,
        isLoading,
        getNewsById,
        getNewsByCategory,
        createNews,
        updateNews,
        deleteNews,
        togglePublish,
        searchNews,
        setReaction,
        addComment,
        deleteComment,
        incrementNewsView,
        refreshNews,
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
