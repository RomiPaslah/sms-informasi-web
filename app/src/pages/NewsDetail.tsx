import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/context/NewsContext';
import { NewsEngagement } from '@/components/news/NewsEngagement';

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNewsById, publishedNews, addComment } = useNews();
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const news = id ? getNewsById(id) : undefined;

  useEffect(() => {
    if (!news || !news.published) {
      navigate('/berita');
    }
  }, [news, navigate]);

  if (!news || !news.published) {
    return null;
  }

  const relatedNews = publishedNews
    .filter((item) => item.category === news.category && item.id !== news.id)
    .slice(0, 3);

  const sortedComments = useMemo(() => {
    return [...news.comments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [news.comments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      setCommentError('Silakan login terlebih dahulu untuk menulis komentar.');
      return;
    }

    if (!comment.trim()) {
      setCommentError('Komentar tidak boleh kosong.');
      return;
    }

    if (comment.trim().length < 5) {
      setCommentError('Komentar minimal 5 karakter.');
      return;
    }

    addComment(news.id, {
      userId: user.id,
      userName: user.name,
      content: comment.trim(),
    });
    setComment('');
    setCommentError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between h-16">
            <Link to="/berita" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d90429] transition-colors">
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
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-64 sm:h-80 lg:h-96">
            <img src={news.image || '/images/hero-bg.jpg'} alt={news.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="inline-block px-3 py-1 bg-[#d90429] text-white text-xs font-semibold rounded-full mb-4">
                {news.category}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">{news.title}</h1>

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

            <div className="mb-8">
              <NewsEngagement news={news} showCommentsLink={false} />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: news.content }} />
          </div>
        </article>

        <section id="komentar" className="mt-10 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Komentar Peserta</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Hanya pengguna yang sudah daftar yang bisa ikut berdiskusi.
              </p>
            </div>
            <div className="rounded-full bg-[#d90429]/10 px-4 py-2 text-sm font-semibold text-[#d90429]">
              {news.comments.length} komentar
            </div>
          </div>

          <form onSubmit={handleCommentSubmit} className="mt-6 space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={isAuthenticated ? 'Tulis komentar Anda tentang berita ini...' : 'Login atau daftar untuk menulis komentar.'}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {commentError && <p className="text-sm text-red-600">{commentError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {!isAuthenticated ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Link to="/login" className="text-[#d90429]">Masuk</Link> atau{' '}
                  <Link to="/register" className="text-[#d90429]">daftar</Link> untuk berkomentar.
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Berkomentar sebagai <span className="font-semibold text-gray-900 dark:text-white">{user?.name}</span>
                </p>
              )}
              <button type="submit" className="rounded-xl bg-[#d90429] px-5 py-3 font-medium text-white transition-colors hover:bg-[#ef233c]">
                Kirim Komentar
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {sortedComments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Belum ada komentar. Jadilah yang pertama berdiskusi.
              </div>
            ) : (
              sortedComments.map((item) => (
                <article key={item.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{item.content}</p>
                </article>
              ))
            )}
          </div>
        </section>

        {relatedNews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Berita Terkait</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <RelatedNewsCard key={item.id} news={item} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 text-center">
          <Link to="/berita" className="inline-flex items-center gap-2 px-6 py-3 bg-[#d90429] text-white rounded-xl font-medium hover:bg-[#ef233c] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Lihat Semua Berita
          </Link>
        </div>
      </main>
    </div>
  );
}

function RelatedNewsCard({ news }: { news: { id: string; title: string; image: string; createdAt: string } }) {
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
        <img src={news.image || '/images/hero-bg.jpg'} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#d90429] transition-colors">
          <Link to={`/berita/${news.id}`}>{news.title}</Link>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(news.createdAt)}</p>
      </div>
    </article>
  );
}
