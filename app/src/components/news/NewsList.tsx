import { useState } from 'react';
import { Search, Filter, Newspaper } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { useNews } from '@/context/NewsContext';

import type { News } from '@/types';

interface NewsListProps {
  news?: News[];
  limit?: number;
  showSearch?: boolean;
  showFilter?: boolean;
  category?: string;
}

export function NewsList({ 
  news: propNews,
  limit, 
  showSearch = true, 
  showFilter = true,
  category 
}: NewsListProps) {
  const { publishedNews, searchNews } = useNews();
  const newsToDisplay = propNews || publishedNews;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  const categories = ['all', ...Array.from(new Set(newsToDisplay.map((n) => n.category)))];

  let filteredNews = newsToDisplay;

  if (searchQuery) {
    filteredNews = searchNews(searchQuery);
  }

  if (selectedCategory && selectedCategory !== 'all') {
    filteredNews = filteredNews.filter((n) => n.category === selectedCategory);
  }

  const displayedNews = limit ? filteredNews.slice(0, limit) : filteredNews;

  if (publishedNews.length === 0) {
    return (
      <div className="text-center py-16">
        <Newspaper className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Belum Ada Berita
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Nantikan berita terbaru dari kami.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      {(showSearch || showFilter) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
              />
            </div>
          )}
          {showFilter && (
            <div className="relative sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all appearance-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {categories.filter(c => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* News Grid */}
      {displayedNews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedNews.map((news, index) => (
            <div
              key={news.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <NewsCard news={news} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada berita yang sesuai dengan pencarian Anda.
          </p>
        </div>
      )}

      {/* Results count */}
      {!limit && filteredNews.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {displayedNews.length} dari {filteredNews.length} berita
        </div>
      )}
    </div>
  );
}
