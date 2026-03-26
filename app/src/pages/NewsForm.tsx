import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/context/NewsContext';
import type { NewsFormData } from '@/types';

const CATEGORIES = [
  'Pengumuman',
  'Kegiatan',
  'Investigasi',
  'Opini',
  'Berita',
  'Lainnya'
];

const SAMPLE_IMAGES = [
  '/images/hero-bg.jpg',
  '/images/about-img.jpg',
  '/images/majalengka-collage.jpg',
  '/images/krispol-siregar.jpg',
];

export function NewsForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const { user } = useAuth();
  const { getNewsById, createNews, updateNews } = useNews();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    content: '',
    excerpt: '',
    image: SAMPLE_IMAGES[0],
    category: CATEGORIES[0],
    published: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (isEditing && id) {
      const news = getNewsById(id);
      if (news) {
        setFormData({
          title: news.title,
          content: news.content,
          excerpt: news.excerpt,
          image: news.image,
          category: news.category,
          published: news.published,
        });
      } else {
        navigate('/admin');
      }
    }
  }, [isEditing, id, getNewsById, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Judul berita wajib diisi');
      return;
    }

    if (!formData.content.trim()) {
      setError('Konten berita wajib diisi');
      return;
    }

    if (!formData.excerpt.trim()) {
      setError('Ringkasan berita wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && id) {
        updateNews(id, formData);
      } else {
        createNews(formData, user.name);
      }
      navigate('/admin');
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d90429] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Berita' : 'Buat Berita Baru'}
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Berita *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
              placeholder="Masukkan judul berita"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gambar Berita
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowImageSelector(!showImageSelector)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-[#d90429] transition-all"
              >
                <ImageIcon className="w-5 h-5 text-gray-400" />
                <span className="flex-1 text-left truncate">{formData.image.split('/').pop()}</span>
              </button>
              
              {showImageSelector && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Pilih gambar:
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {SAMPLE_IMAGES.map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, image: img }));
                          setShowImageSelector(false);
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          formData.image === img
                            ? 'border-[#d90429] ring-2 ring-[#d90429]/30'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt="Option"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="mt-3">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ringkasan *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all resize-none"
              placeholder="Ringkasan singkat berita (maksimal 200 karakter)"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.excerpt.length}/200 karakter
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konten Berita *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={12}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all resize-y font-mono text-sm"
              placeholder="Tulis konten berita di sini. Anda bisa menggunakan HTML untuk formatting."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tips: Gunakan &lt;p&gt; untuk paragraf, &lt;strong&gt; untuk tebal, &lt;em&gt; untuk miring
            </p>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, published: !prev.published }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                formData.published
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                  : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'
              }`}
            >
              {formData.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {formData.published ? 'Dipublikasikan' : 'Draft'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Link
              to="/admin"
              className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#d90429] text-white rounded-xl font-medium hover:bg-[#ef233c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Berita'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
