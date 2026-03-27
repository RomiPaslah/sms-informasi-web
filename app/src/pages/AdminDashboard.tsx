import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Edit2,
  Eye,
  EyeOff,
  Home,
  ImagePlus,
  LayoutPanelTop,
  LogOut,
  MessageSquare,
  Monitor,
  Newspaper,
  Phone,
  Plus,
  Save,
  Search,
  Settings,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/context/NewsContext';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { compressImageFile } from '@/lib/image-upload';
import { useSiteContent } from '@/context/SiteContentContext';
import type { HomeContent, NewsComment } from '@/types';

type AdminTab = 'news' | 'homepage' | 'comments' | 'ads';

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { news, deleteNews, deleteComment } = useNews();
  const { homeContent, updateHomeContent, adSettings, updateAdSettings } = useSiteContent();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('news');
  const [contentForm, setContentForm] = useState<HomeContent>(homeContent);
  const [saveMessage, setSaveMessage] = useState('');
  const [commentQuery, setCommentQuery] = useState('');
  const [mediaUploadMessage, setMediaUploadMessage] = useState('');
  const [adForm, setAdForm] = useState(adSettings);
  const focusedMediaId = searchParams.get('media');

  useEffect(() => {
    setContentForm(homeContent);
  }, [homeContent]);

  useEffect(() => {
    setAdForm(adSettings);
  }, [adSettings]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');

    if (
      requestedTab === 'news' ||
      requestedTab === 'homepage' ||
      requestedTab === 'comments' ||
      requestedTab === 'ads'
    ) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== 'homepage' || !focusedMediaId) {
      return;
    }

    const timer = window.setTimeout(() => {
      const element = document.getElementById(`media-editor-${focusedMediaId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [activeTab, focusedMediaId, contentForm.activitiesMedia.length]);

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flattenedComments = useMemo(
    () =>
      news.flatMap((item) =>
        item.comments.map((comment) => ({
          ...comment,
          newsId: item.id,
          newsTitle: item.title,
          newsCategory: item.category,
        }))
      ),
    [news]
  );

  const filteredComments = flattenedComments.filter((item) => {
    const haystack = `${item.userName} ${item.content} ${item.newsTitle}`.toLowerCase();
    return haystack.includes(commentQuery.toLowerCase());
  });

  const totalComments = flattenedComments.length;

  const isHomepageDirty = useMemo(
    () => JSON.stringify(contentForm) !== JSON.stringify(homeContent),
    [contentForm, homeContent]
  );

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteNews(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleContentChange = (field: keyof HomeContent, value: string) => {
    setSaveMessage('');
    setContentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (
    id: string,
    field: 'title' | 'value' | 'link' | 'icon',
    value: string
  ) => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      contacts: prev.contacts.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const handleMediaChange = (
    id: string,
    field: 'title' | 'description' | 'src' | 'type',
    value: string
  ) => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      activitiesMedia: prev.activitiesMedia.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addMediaItem = () => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      activitiesMedia: [
        ...prev.activitiesMedia,
        {
          id: `media-${Date.now()}`,
          type: 'image',
          title: 'Media Baru',
          description: 'Tambahkan deskripsi singkat.',
          src: '/images/hero-bg.jpg',
        },
      ],
    }));
  };

  const addContactItem = () => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          id: `contact-${Date.now()}`,
          title: 'Kontak Baru',
          icon: '📌',
          value: 'Isi informasi kontak',
          link: 'https://example.com',
          highlight: false,
        },
      ],
    }));
  };

  const removeContactItem = (id: string) => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((item) => item.id !== id),
    }));
  };

  const removeMediaItem = (id: string) => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      activitiesMedia: prev.activitiesMedia.filter((item) => item.id !== id),
    }));
  };

  const moveMediaItem = (id: string, direction: 'up' | 'down') => {
    setSaveMessage('');
    setContentForm((prev) => {
      const currentIndex = prev.activitiesMedia.findIndex((item) => item.id === id);

      if (currentIndex === -1) {
        return prev;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= prev.activitiesMedia.length) {
        return prev;
      }

      const nextMedia = [...prev.activitiesMedia];
      const [selectedItem] = nextMedia.splice(currentIndex, 1);
      nextMedia.splice(targetIndex, 0, selectedItem);

      return {
        ...prev,
        activitiesMedia: nextMedia,
      };
    });
  };

  const resetHomepageEditor = () => {
    setContentForm(homeContent);
    setSaveMessage('Perubahan lokal dibatalkan.');
  };

  const handleSaveHomepage = () => {
    updateHomeContent(contentForm);
    setSaveMessage('Konten halaman depan berhasil disimpan.');
  };

  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);

    if (tab !== 'homepage') {
      nextParams.delete('media');
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleMediaUpload = async (mediaId: string, file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSaveMessage('File media harus berupa gambar.');
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setSaveMessage('Ukuran media maksimal 2MB.');
      return;
    }

    try {
      const result = await compressImageFile(file);
      handleMediaChange(mediaId, 'src', result.dataUrl);
      handleMediaChange(mediaId, 'type', 'image');
      setMediaUploadMessage(
        `Media "${file.name}" siap dipakai (${result.width}x${result.height}${result.compressed ? ', terkompresi otomatis' : ''}).`
      );
      setSaveMessage('');
    } catch {
      setSaveMessage('Gagal mengunggah media.');
    }
  };

  const handleDeleteComment = (newsId: string, commentId: string) => {
    deleteComment(newsId, commentId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/images/sms-logo.png" alt="SMS Logo" className="h-10 w-auto" />
              <span className="hidden sm:block text-lg font-semibold text-gray-900 dark:text-white">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d90429] transition-colors">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Berita" value={news.length} icon={<Newspaper className="w-6 h-6 text-[#d90429]" />} tint="bg-[#d90429]/10" />
          <StatCard label="Dipublikasikan" value={news.filter((item) => item.published).length} icon={<Eye className="w-6 h-6 text-green-600" />} tint="bg-green-100 dark:bg-green-900/20" />
          <StatCard label="Draft" value={news.filter((item) => !item.published).length} icon={<EyeOff className="w-6 h-6 text-yellow-600" />} tint="bg-yellow-100 dark:bg-yellow-900/20" />
          <StatCard label="Komentar" value={totalComments} icon={<MessageSquare className="w-6 h-6 text-violet-600" />} tint="bg-violet-100 dark:bg-violet-900/20" />
          <StatCard label="Role" value={user?.role ?? '-'} icon={<User className="w-6 h-6 text-blue-600" />} tint="bg-blue-100 dark:bg-blue-900/20" capitalize />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <TabButton active={activeTab === 'news'} onClick={() => switchTab('news')} icon={<Newspaper className="h-4 w-4" />}>
            Kelola Berita
          </TabButton>
          <TabButton active={activeTab === 'homepage'} onClick={() => switchTab('homepage')} icon={<Settings className="h-4 w-4" />}>
            Edit Halaman Depan
          </TabButton>
          <TabButton active={activeTab === 'comments'} onClick={() => switchTab('comments')} icon={<MessageSquare className="h-4 w-4" />}>
            Kelola Komentar
          </TabButton>
          <TabButton active={activeTab === 'ads'} onClick={() => switchTab('ads')} icon={<Monitor className="h-4 w-4" />}>
            Pengaturan Iklan
          </TabButton>
        </div>

        {activeTab === 'news' && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              <Link to="/admin/berita/baru" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#d90429] text-white rounded-xl font-medium hover:bg-[#ef233c] transition-colors">
                <Plus className="w-5 h-5" />
                Buat Berita Baru
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Berita</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          Tidak ada berita ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredNews.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={item.image || '/images/hero-bg.jpg'} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-[#d90429]/10 dark:bg-[#d90429]/20 text-[#d90429] text-xs font-semibold rounded-full">{item.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${item.published ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'}`}>
                              {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {item.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/admin/berita/edit/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={`p-2 rounded-lg transition-colors ${deleteConfirm === item.id ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                title={deleteConfirm === item.id ? 'Klik lagi untuk konfirmasi' : 'Hapus'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'homepage' && (
          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editor Halaman Depan</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Atur isi Tentang Kami, SMS Activities & Dokumentasi, serta informasi kontak.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isHomepageDirty ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'}`}>
                      {isHomepageDirty ? 'Perubahan belum disimpan' : 'Sinkron dengan halaman depan'}
                    </span>
                    <button
                      type="button"
                      onClick={resetHomepageEditor}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveHomepage}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#d90429] px-4 py-3 font-medium text-white hover:bg-[#ef233c]"
                    >
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </button>
                  </div>
                </div>

                {saveMessage && (
                  <div className="mt-4 rounded-2xl border border-[#d90429]/20 bg-[#d90429]/5 px-4 py-3 text-sm text-[#b00020] dark:text-[#ff7b8f]">
                    {saveMessage}
                  </div>
                )}

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <EditorCard
                    title="Tentang Kami"
                    description="Teks utama yang tampil di sisi kiri halaman depan."
                    icon={<LayoutPanelTop className="h-5 w-5 text-[#d90429]" />}
                  >
                    <Field label="Badge">
                      <input
                        type="text"
                        value={contentForm.aboutBadge}
                        onChange={(e) => handleContentChange('aboutBadge', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                    <Field label="Judul">
                      <input
                        type="text"
                        value={contentForm.aboutTitle}
                        onChange={(e) => handleContentChange('aboutTitle', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                    <Field label="Deskripsi">
                      <textarea
                        rows={6}
                        value={contentForm.aboutDescription}
                        onChange={(e) => handleContentChange('aboutDescription', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                    <Field label="Kutipan">
                      <textarea
                        rows={4}
                        value={contentForm.aboutQuote}
                        onChange={(e) => handleContentChange('aboutQuote', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                    <Field label="Penulis Kutipan">
                      <input
                        type="text"
                        value={contentForm.aboutQuoteAuthor}
                        onChange={(e) => handleContentChange('aboutQuoteAuthor', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                  </EditorCard>

                  <EditorCard
                    title="SMS Activities & Dokumentasi"
                    description="Judul dan deskripsi untuk galeri media di beranda."
                    icon={<Monitor className="h-5 w-5 text-[#d90429]" />}
                  >
                    <Field label="Judul Dokumentasi">
                      <input
                        type="text"
                        value={contentForm.activitiesTitle}
                        onChange={(e) => handleContentChange('activitiesTitle', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                    <Field label="Deskripsi Dokumentasi">
                      <textarea
                        rows={5}
                        value={contentForm.activitiesDescription}
                        onChange={(e) => handleContentChange('activitiesDescription', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>

                    <div className="rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Media Dokumentasi</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {contentForm.activitiesMedia.length} item siap tampil di beranda.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addMediaItem}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#d90429] px-4 py-3 text-[#d90429] hover:bg-[#d90429]/10"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Tambah Media
                        </button>
                      </div>
                    </div>

                    {focusedMediaId && (
                      <div className="rounded-2xl border border-[#d90429]/20 bg-[#d90429]/5 px-4 py-3 text-sm text-[#b00020] dark:text-[#ff7b8f]">
                        Mode edit cepat aktif. Kartu yang dipilih dari beranda akan disorot di daftar media.
                      </div>
                    )}
                  </EditorCard>

                  <EditorCard
                    title="Informasi Kontak"
                    description="Edit badge, judul, deskripsi, dan isi kartu kontak di beranda."
                    icon={<Phone className="h-5 w-5 text-[#d90429]" />}
                  >
                    <Field label="Badge Kontak">
                      <input
                        type="text"
                        value={contentForm.contactBadge}
                        onChange={(e) => handleContentChange('contactBadge', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                    <Field label="Judul Kontak">
                      <input
                        type="text"
                        value={contentForm.contactTitle}
                        onChange={(e) => handleContentChange('contactTitle', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                    <Field label="Deskripsi Kontak">
                      <textarea
                        rows={4}
                        value={contentForm.contactDescription}
                        onChange={(e) => handleContentChange('contactDescription', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </Field>
                  </EditorCard>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Preview Halaman Depan</h3>
                    <p className="text-sm text-white/70">Pratinjau cepat sebelum disimpan.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#ff8fa3]">{contentForm.aboutBadge}</p>
                    <h4 className="mt-3 text-2xl font-black leading-tight">{contentForm.aboutTitle}</h4>
                    <p className="mt-4 text-sm leading-6 text-white/80">{contentForm.aboutDescription}</p>
                    <div className="mt-4 rounded-xl border-l-4 border-[#ff4d6d] bg-white/5 px-4 py-3">
                      <p className="text-sm italic text-white/85">"{contentForm.aboutQuote}"</p>
                      <p className="mt-2 text-xs font-semibold text-[#ff8fa3]">{contentForm.aboutQuoteAuthor}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                    <p className="text-sm font-semibold text-[#ff8fa3]">{contentForm.activitiesTitle}</p>
                    <p className="mt-2 text-sm text-white/75">{contentForm.activitiesDescription}</p>
                    <div className="mt-4 grid gap-3">
                      {contentForm.activitiesMedia.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                          {item.type === 'video' ? (
                            <div className="flex h-28 items-center justify-center bg-black/40 text-sm text-white/60">
                              Preview video embed
                            </div>
                          ) : (
                            <img src={item.src} alt={item.title} className="h-28 w-full object-cover" />
                          )}
                          <div className="p-3">
                            <p className="font-medium">{item.title}</p>
                            <p className="mt-1 text-xs text-white/65">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                    <p className="text-sm font-semibold text-[#ff8fa3]">{contentForm.contactTitle}</p>
                    <p className="mt-2 text-sm text-white/75">{contentForm.contactDescription}</p>
                    <div className="mt-4 grid gap-3">
                      {contentForm.contacts.map((contact) => (
                        <div key={contact.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="font-medium">{contact.title}</p>
                          <p className="mt-1 text-xs text-white/65">{contact.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#d90429]/20 p-4 border border-[#ff4d6d]/30">
                    <p className="text-sm font-semibold">Tips CMS</p>
                    <p className="mt-2 text-sm text-white/75">
                      Gunakan URL gambar publik atau path lokal seperti `/images/hero-bg.jpg`. Untuk video, masukkan URL embed seperti YouTube `/embed/...`.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Koleksi Media</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kelola urutan, judul, deskripsi, dan sumber media yang tampil di halaman depan.
                  </p>
                </div>
                <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {contentForm.activitiesMedia.length} item
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {contentForm.activitiesMedia.map((item, index) => (
                  <div
                    id={`media-editor-${item.id}`}
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all dark:border-gray-700 ${
                      focusedMediaId === item.id
                        ? 'border-[#d90429] bg-[#d90429]/5 shadow-[0_0_0_1px_rgba(217,4,41,0.15)]'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Media #{index + 1}</p>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveMediaItem(item.id, 'up')}
                          disabled={index === 0}
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700"
                          title="Pindahkan ke atas"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMediaItem(item.id, 'down')}
                          disabled={index === contentForm.activitiesMedia.length - 1}
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700"
                          title="Pindahkan ke bawah"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMediaItem(item.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Hapus media"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                      {item.type === 'video' ? (
                        <div className="flex h-40 items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                          Preview video embed
                        </div>
                      ) : (
                        <img src={item.src} alt={item.title} className="h-40 w-full object-cover" />
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Judul">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleMediaChange(item.id, 'title', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </Field>
                      <Field label="Tipe Media">
                        <select
                          value={item.type}
                          onChange={(e) => handleMediaChange(item.id, 'type', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                          <option value="image">Gambar</option>
                          <option value="video">Video Embed</option>
                        </select>
                      </Field>
                    </div>

                    <div className="mt-4">
                      <Field label="Deskripsi">
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleMediaChange(item.id, 'description', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </Field>
                    </div>

                    <div className="mt-4">
                      <Field label="Sumber Media">
                        <input
                          type="text"
                          value={item.src}
                          onChange={(e) => handleMediaChange(item.id, 'src', e.target.value)}
                          placeholder={item.type === 'video' ? 'https://www.youtube.com/embed/...' : '/images/hero-bg.jpg atau URL gambar'}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </Field>
                    </div>

                    <div className="mt-4">
                      <ImageDropzone
                        title="Upload gambar lokal"
                        description="JPG, PNG, WEBP. Maksimal 2MB. Tersimpan di browser admin."
                        message={mediaUploadMessage}
                        onFileSelect={(file) => handleMediaUpload(item.id, file)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kartu Kontak</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ubah isi setiap kotak kontak yang tampil di halaman depan dan footer.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={addContactItem}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d90429] px-4 py-3 text-[#d90429] hover:bg-[#d90429]/10"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Kontak
                  </button>
                  <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {contentForm.contacts.length} item
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {contentForm.contacts.map((contact) => (
                  <div key={contact.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-3 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeContactItem(contact.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Hapus kontak"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                      <div className="text-4xl">{contact.icon}</div>
                      <p className="mt-3 font-semibold text-gray-900 dark:text-white">{contact.title}</p>
                      <p className="mt-1 text-sm text-[#d90429]">{contact.value}</p>
                    </div>

                    <div className="space-y-4">
                      <Field label="Ikon">
                        <input
                          type="text"
                          value={contact.icon}
                          onChange={(e) => handleContactChange(contact.id, 'icon', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </Field>
                      <Field label="Judul">
                        <input
                          type="text"
                          value={contact.title}
                          onChange={(e) => handleContactChange(contact.id, 'title', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </Field>
                      <Field label="Informasi">
                        <input
                          type="text"
                          value={contact.value}
                          onChange={(e) => handleContactChange(contact.id, 'value', e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </Field>
                      <Field label="Link Tujuan">
                        <input
                          type="text"
                          value={contact.link}
                          onChange={(e) => handleContactChange(contact.id, 'link', e.target.value)}
                          placeholder="https://..., mailto:..., atau https://wa.me/..."
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'comments' && (
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Moderasi Komentar</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pantau komentar peserta dan hapus komentar yang tidak relevan.
                </p>
              </div>
              <div className="relative lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari komentar, penulis, atau judul berita..."
                  value={commentQuery}
                  onChange={(e) => setCommentQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d90429] transition-all"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredComments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Belum ada komentar yang cocok dengan pencarian.
                </div>
              ) : (
                filteredComments.map((item) => (
                  <CommentCard
                    key={item.id}
                    comment={item}
                    onDelete={() => handleDeleteComment(item.newsId, item.id)}
                    formatDate={formatDate}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'ads' && (
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pengaturan Iklan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kelola iklan Google AdSense dan iklan kustom untuk menghasilkan pendapatan.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adForm.enabled}
                    onChange={(e) => setAdForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-5 h-5 text-[#d90429] focus:ring-[#d90429] border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Aktifkan Iklan</span>
                </label>
              </div>

              {adForm.enabled && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipe Iklan
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="adType"
                            value="adsense"
                            checked={adForm.adType === 'adsense'}
                            onChange={(e) => setAdForm(prev => ({ ...prev, adType: e.target.value as 'adsense' | 'custom' }))}
                            className="text-[#d90429] focus:ring-[#d90429]"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">Google AdSense</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="adType"
                            value="custom"
                            checked={adForm.adType === 'custom'}
                            onChange={(e) => setAdForm(prev => ({ ...prev, adType: e.target.value as 'adsense' | 'custom' }))}
                            className="text-[#d90429] focus:ring-[#d90429]"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">Iklan Kustom</span>
                        </label>
                      </div>
                    </div>

                    {adForm.adType === 'adsense' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Publisher ID AdSense
                        </label>
                        <input
                          type="text"
                          value={adForm.adsensePublisherId || ''}
                          onChange={(e) => setAdForm(prev => ({ ...prev, adsensePublisherId: e.target.value }))}
                          placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Masukkan Publisher ID dari Google AdSense Anda (contoh: ca-pub-1234567890123456)
                        </p>
                      </div>
                    )}

                    {adForm.adType === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          HTML Iklan Kustom
                        </label>
                        <textarea
                          rows={6}
                          value={adForm.customAdHtml || ''}
                          onChange={(e) => setAdForm(prev => ({ ...prev, customAdHtml: e.target.value }))}
                          placeholder="<div>Iklan Anda di sini</div>"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white font-mono text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Masukkan HTML iklan kustom Anda. Pastikan aman dan tidak mengandung script berbahaya.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Posisi Iklan
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'header', label: 'Header' },
                          { key: 'sidebar', label: 'Sidebar' },
                          { key: 'footer', label: 'Footer' },
                          { key: 'betweenContent', label: 'Antara Konten' },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={adForm.adPositions[key as keyof typeof adForm.adPositions]}
                              onChange={(e) => setAdForm(prev => ({
                                ...prev,
                                adPositions: {
                                  ...prev.adPositions,
                                  [key]: e.target.checked
                                }
                              }))}
                              className="w-4 h-4 text-[#d90429] focus:ring-[#d90429] border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        updateAdSettings(adForm);
                        setSaveMessage('Pengaturan iklan berhasil disimpan!');
                        setTimeout(() => setSaveMessage(''), 3000);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#d90429] px-6 py-3 text-white font-medium hover:bg-[#ef233c] transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Simpan Pengaturan
                    </button>
                    {saveMessage && (
                      <span className="text-sm text-green-600 dark:text-green-400">{saveMessage}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint,
  capitalize = false,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tint: string;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold text-gray-900 dark:text-white ${capitalize ? 'capitalize' : ''}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-colors ${active ? 'bg-[#d90429] text-white' : 'bg-white text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300'}`}
    >
      {icon}
      {children}
    </button>
  );
}

function EditorCard({
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
    <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#d90429]/10 p-3">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
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

function CommentCard({
  comment,
  onDelete,
  formatDate,
}: {
  comment: NewsComment & { newsId: string; newsTitle: string; newsCategory: string };
  onDelete: () => void;
  formatDate: (dateString: string) => string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#d90429]/10 px-3 py-1 text-xs font-semibold text-[#d90429]">
              {comment.newsCategory}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</p>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{comment.newsTitle}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Oleh <span className="font-medium text-gray-700 dark:text-gray-200">{comment.userName}</span>
          </p>
          <p className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            {comment.content}
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:w-44">
          <Link
            to={`/berita/${comment.newsId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Lihat Berita
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Komentar
          </button>
        </div>
      </div>
    </article>
  );
}
