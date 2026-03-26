import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Filter, Newspaper, Search, User } from 'lucide-react';
import { useNews } from '@/context/NewsContext';
import { NewsEngagement } from '@/components/news/NewsEngagement';
import type { News } from '@/types';

export function News() {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { publishedNews, searchNews } = useNews();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = ['all', ...Array.from(new Set(publishedNews.map((item) => item.category)))];

  let filteredNews = publishedNews;
  if (searchQuery) {
    filteredNews = searchNews(searchQuery);
  }
  if (selectedCategory !== 'all') {
    filteredNews = filteredNews.filter((item) => item.category === selectedCategory);
  }

  const featuredNews = filteredNews[0];
  const regularNews = filteredNews.slice(1);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-br from-[#d90429] to-[#ef233c] py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 text-center">
          <div className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Newspaper className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Portal Berita Independen</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Berita Terkini SMS</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Informasi akurat, tajam, dan edukatif dari Sinergi Muda Strategis untuk masyarakat Majalengka dan sekitarnya.
            </p>
          </div>
        </div>
      </section>

      <main ref={sectionRef} className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d90429] transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Beranda
        </Link>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
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
          <div className="relative sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all appearance-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.filter((item) => item !== 'all').map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {featuredNews && !searchQuery && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Berita Utama</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="grid lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto">
                  <img src={featuredNews.image || '/images/hero-bg.jpg'} alt={featuredNews.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <span className="inline-block w-fit px-3 py-1 bg-[#d90429]/10 dark:bg-[#d90429]/20 text-[#d90429] text-xs font-semibold rounded-full mb-4">
                    {featuredNews.category}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 hover:text-[#d90429] transition-colors">
                    <Link to={`/berita/${featuredNews.id}`}>{featuredNews.title}</Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">{featuredNews.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredNews.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredNews.createdAt)}
                    </span>
                  </div>
                  <NewsEngagement news={featuredNews} />
                  <Link to={`/berita/${featuredNews.id}`} className="mt-6 inline-flex items-center gap-2 text-[#d90429] font-medium hover:gap-3 transition-all">
                    Baca Selengkapnya
                    <span>{'->'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {searchQuery || selectedCategory !== 'all' ? 'Hasil Pencarian' : 'Semua Berita'}
          </h2>

          {regularNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNews.map((item) => (
                <NewsItem key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Tidak ada berita yang sesuai dengan pencarian Anda.</p>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Menampilkan {filteredNews.length} berita
        </div>
      </main>
    </div>
  );
}

function NewsItem({ news }: { news: News }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img src={news.image || '/images/hero-bg.jpg'} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#d90429] text-white text-xs font-semibold rounded-full">{news.category}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d90429] transition-colors">
          <Link to={`/berita/${news.id}`}>{news.title}</Link>
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{news.excerpt}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(news.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {news.author}
          </span>
        </div>
        <NewsEngagement news={news} />
        <Link to={`/berita/${news.id}`} className="mt-4 inline-flex items-center gap-2 text-[#d90429] font-medium text-sm hover:gap-3 transition-all">
          Baca Selengkapnya
          <span>{'->'}</span>
        </Link>
      </div>
    </article>
  );
}
