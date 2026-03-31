import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutTemplate,
  Save,
  Sparkles,
  Type,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/context/NewsContext';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { compressImageFile } from '@/lib/image-upload';
import type { NewsFormData } from '@/types';

const CATEGORIES = ['Pengumuman', 'Kegiatan', 'Investigasi', 'Opini', 'Berita', 'Lainnya'];

const SAMPLE_IMAGES = [
  '/images/hero-bg.jpg',
  '/images/about-img.jpg',
  '/images/majalengka-collage.jpg',
  '/images/krispol-siregar.jpg',
];

const CONTENT_SNIPPETS = [
  {
    label: 'Paragraf',
    value: '<p>Tuliskan paragraf berita di sini.</p>',
  },
  {
    label: 'Kutipan',
    value: '<blockquote>Masukkan kutipan penting dari narasumber.</blockquote>',
  },
  {
    label: 'Subjudul',
    value: '<h2>Subjudul Berita</h2>',
  },
  {
    label: 'Daftar',
    value: '<ul><li>Poin pertama</li><li>Poin kedua</li></ul>',
  },
];

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

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
    video_url: '',
    category: CATEGORIES[0],
    published: true,
  });
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [saveMode, setSaveMode] = useState<'publish' | 'draft'>('publish');

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
          video_url: news.video_url || '',
          category: news.category,
          published: news.published,
        });
        setCustomImageUrl(news.image);
      } else {
        navigate('/admin');
      }
    }
  }, [getNewsById, id, isEditing, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const insertSnippet = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n${snippet}` : snippet,
    }));
  };

  const applyImage = (image: string) => {
    setUploadMessage('');
    setCustomImageUrl(image);
    setFormData((prev) => ({ ...prev, image }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setError('Ukuran gambar maksimal 2MB.');
      return;
    }

    try {
      const result = await compressImageFile(file);
      applyImage(result.dataUrl);
      setUploadMessage(
        `Gambar "${file.name}" siap dipakai (${result.width}x${result.height}${result.compressed ? ', terkompresi otomatis' : ''}).`
      );
      setError('');
    } catch {
      setError('Gagal mengunggah gambar.');
    }
  };

  const articleStatus = useMemo(() => {
    const title = formData.title || '';
    const excerpt = formData.excerpt || '';
    const content = formData.content || '';

    if (!title.trim() && !excerpt.trim() && !content.trim()) {
      return 'Mulai isi form untuk melihat preview artikel.';
    }

    if (!formData.published) {
      return 'Artikel ini sedang disiapkan sebagai draft.';
    }

    return 'Artikel siap dipublikasikan setelah disimpan.';
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const title = formData.title || '';
    const content = formData.content || '';
    const excerpt = formData.excerpt || '';
    const image = formData.image || '';

    if (!title.trim()) {
      setError('Judul berita wajib diisi');
      return;
    }

    if (!content.trim()) {
      setError('Konten berita wajib diisi');
      return;
    }

    if (!excerpt.trim()) {
      setError('Ringkasan berita wajib diisi');
      return;
    }

    if (!image.trim()) {
      setError('Gambar berita wajib dipilih atau diisi URL-nya');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        published: user?.role === 'admin' ? true : saveMode === 'publish',
      };

      if (isEditing && id) {
        await updateNews(id, payload);
      } else {
        await createNews(payload, user.name);
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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d90429] transition-colors">
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

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editor Artikel</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kelola naskah, media, dan status publikasi artikel.
                </p>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${formData.published ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'}`}>
                {formData.published ? 'Mode publish aktif' : 'Mode draft aktif'}
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-6">
              <EditorSection
                title="Informasi Utama"
                description="Judul, kategori, dan ringkasan yang tampil di kartu berita."
                icon={<Type className="h-5 w-5 text-[#d90429]" />}
              >
                <Field label="Judul Berita *">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
                    placeholder="Masukkan judul berita"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Kategori *">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Status">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, published: true }));
                          setSaveMode('publish');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${formData.published ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                      >
                        <Eye className="w-4 h-4" />
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, published: false }));
                          setSaveMode('draft');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${!formData.published ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                      >
                        <EyeOff className="w-4 h-4" />
                        Draft
                      </button>
                    </div>
                  </Field>
                </div>

                <Field label="Ringkasan *">
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all resize-none"
                    placeholder="Ringkasan singkat berita untuk kartu dan hasil pencarian"
                    maxLength={220}
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {formData.excerpt.length}/220 karakter
                  </p>
                </Field>
              </EditorSection>

              <EditorSection
                title="Media Utama"
                description="Pilih gambar cepat atau gunakan URL gambar kustom."
                icon={<ImageIcon className="h-5 w-5 text-[#d90429]" />}
              >
                <Field label="URL Gambar">
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    onBlur={() => {
                      if (customImageUrl.trim()) {
                        applyImage(customImageUrl.trim());
                      }
                    }}
                    placeholder="/images/hero-bg.jpg atau https://..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
                  />
                </Field>

                <ImageDropzone
                  title="Upload gambar lokal"
                  description="JPG, PNG, WEBP. Maksimal 2MB. Gambar akan disimpan di browser."
                  message={uploadMessage}
                  onFileSelect={handleImageUpload}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SAMPLE_IMAGES.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => applyImage(img)}
                      className={`relative overflow-hidden rounded-2xl border-2 transition-all ${formData.image === img ? 'border-[#d90429] ring-4 ring-[#d90429]/20' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt="Pilihan gambar" className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                  <img src={formData.image} alt="Preview gambar utama" className="h-56 w-full object-cover" />
                </div>

                <Field label="URL Video (Opsional)">
                  <input
                    type="url"
                    name="video_url"
                    value={formData.video_url || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/embed/... atau https://..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Link video YouTube, Vimeo, atau video hosting lainnya. Biarkan kosong jika tidak ada video.
                  </p>
                </Field>
              </EditorSection>

              <EditorSection
                title="Konten Artikel"
                description="Gunakan snippet cepat untuk menyusun artikel lebih rapi."
                icon={<LayoutTemplate className="h-5 w-5 text-[#d90429]" />}
              >
                <div className="flex flex-wrap gap-2">
                  {CONTENT_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet.label}
                      type="button"
                      onClick={() => insertSnippet(snippet.value)}
                      className="rounded-full border border-[#d90429]/30 px-3 py-1.5 text-sm font-medium text-[#d90429] hover:bg-[#d90429]/10"
                    >
                      + {snippet.label}
                    </button>
                  ))}
                </div>

                <Field label="Konten Berita *">
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={18}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all resize-y font-mono text-sm"
                    placeholder="Tulis konten berita di sini. Anda bisa menggunakan HTML untuk formatting."
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Tips: gunakan &lt;p&gt; untuk paragraf, &lt;strong&gt; untuk tebal, &lt;h2&gt; untuk subjudul, dan &lt;ul&gt; untuk daftar.
                  </p>
                </Field>
              </EditorSection>

              <div className="flex gap-4 pt-2">
                <Link
                  to="/admin"
                  className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  onClick={() => setSaveMode(formData.published ? 'publish' : 'draft')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#d90429] text-white rounded-xl font-medium hover:bg-[#ef233c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Artikel'}
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Preview Artikel</h3>
                  <p className="text-sm text-white/70">Pratinjau cepat sebelum disimpan.</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <img src={formData.image} alt={formData.title || 'Preview artikel'} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <div className="inline-flex rounded-full bg-[#d90429]/20 px-3 py-1 text-xs font-semibold text-[#ff8fa3]">
                    {formData.category}
                  </div>
                  <h4 className="mt-4 text-2xl font-black leading-tight">
                    {formData.title || 'Judul artikel akan tampil di sini'}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-white/75">
                    {formData.excerpt || 'Ringkasan artikel akan membantu pembaca memahami isi berita secara cepat.'}
                  </p>
                  <div className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/70">
                    {articleStatus}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/5 p-5 border border-white/10">
                <p className="text-sm font-semibold text-[#ff8fa3]">Preview Konten</p>
                <div
                  className="prose prose-sm prose-invert mt-3 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      formData.content ||
                      '<p>Konten artikel akan muncul di sini. Tambahkan paragraf, subjudul, atau kutipan untuk melihat hasilnya.</p>',
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Checklist Editor</h3>
              <div className="mt-4 space-y-3 text-sm">
                <ChecklistItem label="Judul terisi" checked={!!(formData.title || '').trim()} />
                <ChecklistItem label="Ringkasan terisi" checked={!!(formData.excerpt || '').trim()} />
                <ChecklistItem label="Konten terisi" checked={!!(formData.content || '').trim()} />
                <ChecklistItem label="Media utama tersedia" checked={!!(formData.image || '').trim()} />
                <ChecklistItem label="Status artikel dipilih" checked={true} />
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}

function EditorSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#d90429]/10 p-3">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
      <span>{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${checked ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
        {checked ? 'Siap' : 'Belum'}
      </span>
    </div>
  );
}
