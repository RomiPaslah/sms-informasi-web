import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { News } from '@/types';

interface NewsCardProps {
  news: News;
  variant?: 'default' | 'horizontal' | 'featured';
}

export function NewsCard({ news, variant = 'default' }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (variant === 'horizontal') {
    return (
      <article className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-2/5 overflow-hidden">
            <img
              src={news.image || '/images/hero-bg.jpg'}
              alt={news.title}
              className="w-full h-48 sm:h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="sm:w-3/5 p-6">
            <span className="inline-block px-3 py-1 bg-[#d90429]/10 dark:bg-[#d90429]/20 text-[#d90429] text-xs font-semibold rounded-full mb-3">
              {news.category}
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d90429] transition-colors">
              {news.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {news.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(news.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {news.author}
              </span>
            </div>
            <Link
              to={`/berita/${news.id}`}
              className="inline-flex items-center gap-2 mt-4 text-[#d90429] font-medium text-sm hover:gap-3 transition-all"
            >
              Baca Selengkapnya
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img
            src={news.image || '/images/hero-bg.jpg'}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <span className="inline-block px-3 py-1 bg-[#d90429] text-white text-xs font-semibold rounded-full mb-3">
              {news.category}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#ef233c] transition-colors">
              {news.title}
            </h3>
            <p className="text-white/80 text-sm mb-4 line-clamp-2">
              {news.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(news.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {news.author}
              </span>
            </div>
            <Link
              to={`/berita/${news.id}`}
              className="inline-flex items-center gap-2 mt-4 bg-white text-[#d90429] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#d90429] hover:text-white transition-all"
            >
              Baca Selengkapnya
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={news.image || '/images/hero-bg.jpg'}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#d90429] text-white text-xs font-semibold rounded-full">
            {news.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d90429] transition-colors">
          {news.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {news.excerpt}
        </p>
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
        <Link
          to={`/berita/${news.id}`}
          className="inline-flex items-center gap-2 text-[#d90429] font-medium text-sm hover:gap-3 transition-all"
        >
          Baca Selengkapnya
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
