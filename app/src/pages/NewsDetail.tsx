import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { useNews } from '@/context/NewsContext';

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNewsById, publishedNews } = useNews();

  const news = id ? getNewsById(id) : undefined;

  // Redirect if news not found or not published
  useEffect(() => {
    if (!news || !news.published) {
      navigate('/berita');
    }
  }, [news, navigate]);

  if (!news || !news.published) {
    return null;
  }

  // Get related news (same category, exclude current)
  const relatedNews = publishedNews
    .filter((n) => n.category === news.category && n.id !== news.id)
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const text = news.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link berhasil disalin!');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/berita"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d90429] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Kembali</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/images/sms-logo.png" alt="SMS Logo" className="h-10 w-auto" />
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8 max-w-4xl mx-auto">
        {/* Article */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 lg:h-96">
            <img
              src={news.image || '/images/hero-bg.jpg'}
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="inline-block px-3 py-1 bg-[#d90429] text-white text-xs font-semibold rounded-full mb-4">
                {news.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {news.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {news.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(news.createdAt)}
              </span>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm text-gray-500 dark:text-gray-400">Bagikan:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                title="Share ke Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
                title="Share ke Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
                title="Copy Link"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Article Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Berita Terkait
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <RelatedNewsCard key={item.id} news={item} />
              ))}
            </div>
          </section>
        )}

        {/* Back to News */}
        <div className="mt-12 text-center">
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#d90429] text-white rounded-xl font-medium hover:bg-[#ef233c] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Lihat Semua Berita
          </Link>
        </div>
      </main>
    </div>
  );
}

// Related News Card
function RelatedNewsCard({ news }: { news: { id: string; title: string; excerpt: string; image: string; createdAt: string } }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-40 overflow-hidden">
        <img
          src={news.image || '/images/hero-bg.jpg'}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d90429] transition-colors">
          <Link to={`/berita/${news.id}`}>
            {news.title}
          </Link>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(news.createdAt)}
        </p>
      </div>
    </article>
  );
}
