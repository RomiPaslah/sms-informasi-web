import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Edit2,
  Eye,
  EyeOff,
  Home,
  ImagePlus,
  Key,
  LayoutPanelTop,
  LogOut,
  MessageSquare,
  Monitor,
  Newspaper,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/context/NewsContext';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { compressImageFile } from '@/lib/image-upload';
import { useSiteContent } from '@/context/SiteContentContext';
import { authApi } from '@/lib/api';
import type { HomeContent, NewsComment, User } from '@/types';

type AdminTab = 'news' | 'users' | 'homepage' | 'comments' | 'ads' | 'ai';

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

export function AdminDashboard() {
  const { user, logout, promoteUserToAdmin, approveUser, rejectUser, changePassword } = useAuth();
  const { news, deleteNews, deleteComment, togglePublish } = useNews();
  const { homeContent, updateHomeContent, adSettings, updateAdSettings } = useSiteContent();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('news');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [passwordTargetEmail, setPasswordTargetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userActionMessage, setUserActionMessage] = useState('');
  const [userActionSuccess, setUserActionSuccess] = useState(true);
  const [adminEmailToPromote, setAdminEmailToPromote] = useState('');
  const [promoteMessage, setPromoteMessage] = useState('');
  const [promoteSuccess, setPromoteSuccess] = useState(true);
  const [contentForm, setContentForm] = useState<HomeContent>(homeContent);
  const [saveMessage, setSaveMessage] = useState('');
  const [commentQuery, setCommentQuery] = useState('');
  const [mediaUploadMessage, setMediaUploadMessage] = useState('');
  const [adForm, setAdForm] = useState(adSettings);
  const [isSaving, setIsSaving] = useState(false);
  const focusedMediaId = searchParams.get('media');

  useEffect(() => {
    setContentForm(homeContent);
  }, [homeContent]);

  useEffect(() => {
    setAdForm(adSettings);
  }, [adSettings]);

  useEffect(() => {
    refreshUsers();
  }, []);

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
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
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

  const refreshUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { users: apiUsers } = await authApi.getUsers();
      setUsers(
        apiUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          approved: u.approved,
          createdAt: u.createdAt,
          authProvider: (u.authProvider as 'local') ?? 'local',
        }))
      );
    } catch {
      // silently fail
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleApproveUser = async (email: string) => {
    const ok = await approveUser(email);
    if (ok) {
      setUserActionSuccess(true);
      setUserActionMessage(`✅ Akun ${email} berhasil disetujui. User sekarang bisa login.`);
      await refreshUsers();
    } else {
      setUserActionSuccess(false);
      setUserActionMessage(`❌ Gagal menyetujui ${email}. Silakan coba lagi.`);
    }
  };

  const handleRejectUser = async (email: string) => {
    if (!window.confirm(`Yakin ingin menolak dan menghapus akun ${email}?`)) return;
    const ok = await rejectUser(email);
    if (ok) {
      setUserActionSuccess(true);
      setUserActionMessage(`🗑️ Akun ${email} ditolak dan dihapus dari sistem.`);
      await refreshUsers();
    } else {
      setUserActionSuccess(false);
      setUserActionMessage(`❌ Gagal menghapus ${email}. Mungkin akun ini tidak bisa dihapus.`);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordTargetEmail.trim() || !newPassword.trim()) {
      setUserActionSuccess(false);
      setUserActionMessage('Email dan password baru wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      setUserActionSuccess(false);
      setUserActionMessage('Password baru minimal 6 karakter');
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword(passwordTargetEmail, newPassword);
    setIsChangingPassword(false);

    if (result.success) {
      setUserActionSuccess(true);
      setUserActionMessage(`🔑 Password ${passwordTargetEmail} berhasil diubah.`);
      setPasswordTargetEmail('');
      setNewPassword('');
    } else {
      setUserActionSuccess(false);
      setUserActionMessage(`❌ ${result.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteNews(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handlePromoteAdmin = async () => {
    if (!adminEmailToPromote.trim()) {
      setPromoteSuccess(false);
      setPromoteMessage('Masukkan email user untuk dipromosi menjadi admin.');
      return;
    }

    const success = await promoteUserToAdmin(adminEmailToPromote);
    if (success) {
      setPromoteSuccess(true);
      setPromoteMessage(`✅ Berhasil promosikan ${adminEmailToPromote} menjadi admin.`);
      setAdminEmailToPromote('');
      await refreshUsers();
    } else {
      setPromoteSuccess(false);
      setPromoteMessage(`❌ User dengan email ${adminEmailToPromote} tidak ditemukan.`);
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

  const handleNavLinkChange = (id: string, field: 'name' | 'href', value: string) => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      navLinks: prev.navLinks.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addNavLink = () => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      navLinks: [
        ...prev.navLinks,
        {
          id: `nav-${Date.now()}`,
          name: 'Menu Baru',
          href: '/#',
        },
      ],
    }));
  };

  const removeNavLink = (id: string) => {
    setSaveMessage('');
    setContentForm((prev) => ({
      ...prev,
      navLinks: prev.navLinks.filter((item) => item.id !== id),
    }));
  };

  const moveNavLink = (id: string, direction: 'up' | 'down') => {
    setSaveMessage('');
    setContentForm((prev) => {
      const currentIndex = prev.navLinks.findIndex((item) => item.id === id);
      if (currentIndex === -1) return prev;
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.navLinks.length) return prev;
      const nextNav = [...prev.navLinks];
      const [selectedItem] = nextNav.splice(currentIndex, 1);
      nextNav.splice(targetIndex, 0, selectedItem);
      return {
        ...prev,
        navLinks: nextNav,
      };
    });
  };

  const resetHomepageEditor = () => {
    setContentForm(homeContent);
    setSaveMessage('Perubahan lokal dibatalkan.');
  };

  const handleSaveHomepage = async () => {
    setIsSaving(true);
    try {
      await updateHomeContent(contentForm);
      setSaveMessage('✅ Konten halaman depan berhasil disimpan ke database.');
    } catch {
      setSaveMessage('❌ Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
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
                <UserIcon className="w-5 h-5" />
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
          <StatCard label="Role" value={user?.role ?? '-'} icon={<UserIcon className="w-6 h-6 text-blue-600" />} tint="bg-blue-100 dark:bg-blue-900/20" capitalize />
        </div>

        {/* Promosi Admin - only visible to primary admin or admins */}
        <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#d90429]" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Promosikan User menjadi Admin</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              value={adminEmailToPromote}
              onChange={(e) => setAdminEmailToPromote(e.target.value)}
              placeholder="Masukkan email user yang akan dipromosikan"
              className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
            />
            <button
              onClick={handlePromoteAdmin}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Promosikan
            </button>
          </div>
          {promoteMessage && (
            <p className={`mt-2 text-sm ${promoteSuccess ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {promoteMessage}
            </p>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <TabButton active={activeTab === 'news'} onClick={() => switchTab('news')} icon={<Newspaper className="h-4 w-4" />}>
            Kelola Berita
          </TabButton>
          <TabButton active={activeTab === 'users'} onClick={() => switchTab('users')} icon={<UserIcon className="h-4 w-4" />}>
            Kelola Pengguna
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
          <TabButton active={activeTab === 'ai'} onClick={() => switchTab('ai')} icon={<Sparkles className="h-4 w-4" />}>
            AI Auto-Berita
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
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Berita</th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 sm:px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          Tidak ada berita ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredNews.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image || '/images/hero-bg.jpg'} alt={item.title} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-1 text-sm sm:text-base">{item.title}</p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{item.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="inline-block px-2 sm:px-3 py-1 bg-[#d90429]/10 dark:bg-[#d90429]/20 text-[#d90429] text-xs font-semibold rounded-full">{item.category}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${item.published ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'}`}>
                              {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span className="hidden sm:inline">{item.published ? 'Published' : 'Draft'}</span>
                              <span className="sm:hidden">{item.published ? 'Pub' : 'Draft'}</span>
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</td>
                          <td className="px-4 sm:px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <button
                                onClick={() => togglePublish(item.id)}
                                className={`px-2 py-1 text-xs rounded-lg font-semibold transition ${item.published ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                                title={item.published ? 'Set sebagai draft' : 'Terbitkan berita'}
                              >
                                {item.published ? '↓ Draft' : '↑ Publish'}
                              </button>
                              <Link to={`/admin/berita/edit/${item.id}`} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${deleteConfirm === item.id ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
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

        {activeTab === 'ai' && <AiNewsPanel />}

        {activeTab === 'users' && (
          <section className="space-y-6">
            {/* Notification */}
            {userActionMessage && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${userActionSuccess ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200'}`}>
                {userActionMessage}
              </div>
            )}

            {/* Users Table */}
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#d90429]" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kelola Pengguna</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Setujui atau tolak pendaftaran baru dari database.</p>
                  </div>
                </div>
                <button
                  onClick={refreshUsers}
                  disabled={isLoadingUsers}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Pending approval banner */}
              {users.filter(u => !u.approved && u.role !== 'admin').length > 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-4 py-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>{users.filter(u => !u.approved && u.role !== 'admin').length} pendaftaran</strong> menunggu persetujuan Anda.
                  </p>
                </div>
              )}

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="border-b border-gray-200 font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-2">Nama</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Peran</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-400">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#d90429] rounded-full animate-spin" />
                            Memuat data pengguna...
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada pengguna terdaftar</td>
                      </tr>
                    ) : (
                      users.map((usr) => (
                        <tr key={usr.id} className={`border-b border-gray-100 dark:border-gray-700 ${!usr.approved && usr.role !== 'admin' ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{usr.name}</td>
                          <td className="px-4 py-3 text-xs">{usr.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              usr.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                              usr.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>{usr.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            {usr.approved ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                                <CheckCircle className="w-3.5 h-3.5" /> Disetujui
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <ShieldCheck className="w-3.5 h-3.5" /> Menunggu
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5">
                            {!usr.approved && usr.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => handleApproveUser(usr.email)}
                                  className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-200 transition"
                                >
                                  ✓ Setujui
                                </button>
                                <button
                                  onClick={() => handleRejectUser(usr.email)}
                                  className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 transition"
                                >
                                  ✕ Tolak
                                </button>
                              </>
                            )}
                            {usr.role !== 'admin' && usr.approved && (
                              <button
                                onClick={() => handleRejectUser(usr.email)}
                                className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                                title="Hapus akun"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-4 dark:border-gray-700 mb-4">
                <Key className="w-5 h-5 text-[#d90429]" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Ubah Password Akun</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sebagai admin, Anda bisa mengubah password akun mana saja.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email target</label>
                  <input
                    type="email"
                    value={passwordTargetEmail}
                    onChange={(e) => setPasswordTargetEmail(e.target.value)}
                    placeholder="email@akun.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full rounded-lg bg-[#d90429] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#ef233c] disabled:opacity-50 transition"
                  >
                    {isChangingPassword ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </span>
                    ) : (
                      'Ubah Password'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
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
                      disabled={isSaving || !isHomepageDirty}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#d90429] px-4 py-3 font-medium text-white hover:bg-[#ef233c] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaving ? 'Menyimpan...' : 'Simpan ke Database'}
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
                    title="Menu Navigasi"
                    description="Kelola menu utama yang tampil pada header dan footer."
                    icon={<LayoutPanelTop className="h-5 w-5 text-[#d90429]" />}
                  >
                    <div className="space-y-3">
                      {contentForm.navLinks.map((nav, index) => (
                        <div key={nav.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Menu #{index + 1}</p>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveNavLink(nav.id, 'up')}
                                disabled={index === 0}
                                className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveNavLink(nav.id, 'down')}
                                disabled={index === contentForm.navLinks.length - 1}
                                className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => removeNavLink(nav.id)}
                                className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-600 hover:bg-red-200"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>

                          <Field label="Nama Menu">
                            <input
                              type="text"
                              value={nav.name}
                              onChange={(e) => handleNavLinkChange(nav.id, 'name', e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          </Field>

                          <Field label="URL / Hash">
                            <input
                              type="text"
                              value={nav.href}
                              onChange={(e) => handleNavLinkChange(nav.id, 'href', e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          </Field>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addNavLink}
                        className="rounded-xl border border-[#d90429] bg-[#d90429]/10 px-4 py-2 text-sm font-medium text-[#d90429] hover:bg-[#d90429]/20"
                      >
                        Tambah Item Menu
                      </button>
                    </div>
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
            <div className="border-b border-gray-200 pb-4 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kelola Iklan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tambahkan dan kelola iklan dengan gambar, deskripsi, dan posisi fleksibel.
                </p>
              </div>
              <button
                onClick={() => {
                  const newAd = {
                    id: `ad_${Date.now()}`,
                    title: 'Iklan Baru',
                    description: '',
                    image: '',
                    link: '',
                    enabled: true,
                    width: '300px',
                    height: '250px',
                    positions: ['header']
                  };
                  setAdForm(prev => ({
                    ...prev,
                    ads: [...(prev.ads || []), newAd]
                  }));
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#d90429] px-4 py-2 text-sm text-white font-medium hover:bg-[#ef233c] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Tambah Iklan
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Ads List */}
              <div className="space-y-4">
                {adForm.ads && adForm.ads.length > 0 ? (
                  adForm.ads.map((ad, idx) => (
                    <div key={ad.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={ad.title}
                            onChange={(e) => setAdForm(prev => ({
                              ...prev,
                              ads: prev.ads?.map((a, i) => i === idx ? { ...a, title: e.target.value } : a) || []
                            }))}
                            placeholder="Judul Iklan"
                            className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-[#d90429] mb-2"
                          />
                          <input
                            type="text"
                            value={ad.description}
                            onChange={(e) => setAdForm(prev => ({
                              ...prev,
                              ads: prev.ads?.map((a, i) => i === idx ? { ...a, description: e.target.value } : a) || []
                            }))}
                            placeholder="Deskripsi singkat iklan"
                            className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-[#d90429]"
                          />
                        </div>
                        <button
                          onClick={() => setAdForm(prev => ({
                            ...prev,
                            ads: prev.ads?.filter((_, i) => i !== idx) || []
                          }))}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            URL Gambar
                          </label>
                          <input
                            type="text"
                            value={ad.image}
                            onChange={(e) => setAdForm(prev => ({
                              ...prev,
                              ads: prev.ads?.map((a, i) => i === idx ? { ...a, image: e.target.value } : a) || []
                            }))}
                            placeholder="https://example.com/image.jpg"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            URL Tautan (Link)
                          </label>
                          <input
                            type="text"
                            value={ad.link}
                            onChange={(e) => setAdForm(prev => ({
                              ...prev,
                              ads: prev.ads?.map((a, i) => i === idx ? { ...a, link: e.target.value } : a) || []
                            }))}
                            placeholder="https://example.com"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Lebar
                          </label>
                          <input
                            type="text"
                            value={ad.width}
                            onChange={(e) => setAdForm(prev => ({
                              ...prev,
                              ads: prev.ads?.map((a, i) => i === idx ? { ...a, width: e.target.value } : a) || []
                            }))}
                            placeholder="300px"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tinggi
                          </label>
                          <input
                            type="text"
                            value={ad.height}
                            onChange={(e) => setAdForm(prev => ({
                              ...prev,
                              ads: prev.ads?.map((a, i) => i === idx ? { ...a, height: e.target.value } : a) || []
                            }))}
                            placeholder="250px"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={ad.enabled}
                            onChange={(e) => setAdForm(prev => ({
                              ...prev,
                              ads: prev.ads?.map((a, i) => i === idx ? { ...a, enabled: e.target.checked } : a) || []
                            }))}
                            className="w-4 h-4 text-[#d90429] focus:ring-[#d90429] border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Aktifkan Iklan</span>
                        </label>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tampilkan di Posisi
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {['header', 'sidebar', 'betweenContent', 'footer'].map(pos => (
                            <label key={pos} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ad.positions?.includes(pos) || false}
                                onChange={(e) => setAdForm(prev => ({
                                  ...prev,
                                  ads: prev.ads?.map((a, i) => 
                                    i === idx 
                                      ? { 
                                          ...a, 
                                          positions: e.target.checked
                                            ? [...(a.positions || []), pos]
                                            : (a.positions || []).filter(p => p !== pos)
                                        }
                                      : a
                                  ) || []
                                }))}
                                className="w-4 h-4 text-[#d90429] focus:ring-[#d90429] border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {pos === 'header' ? 'Header' : pos === 'sidebar' ? 'Sidebar' : pos === 'betweenContent' ? 'Antara Konten' : 'Footer'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Belum ada iklan. Klik tombol "Tambah Iklan" untuk membuat yang baru.</p>
                  </div>
                )}
              </div>

              {/* Position Settings */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Pengaturan Posisi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(adForm.positions || {}).map(([pos, settings]) => (
                    <div key={pos} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={settings.enabled}
                          onChange={(e) => setAdForm(prev => ({
                            ...prev,
                            positions: {
                              ...prev.positions,
                              [pos]: { ...settings, enabled: e.target.checked }
                            }
                          }))}
                          className="w-4 h-4 text-[#d90429] focus:ring-[#d90429] border-gray-300 rounded"
                        />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {pos === 'header' ? 'Header' : pos === 'sidebar' ? 'Sidebar' : pos === 'betweenContent' ? 'Antara Konten' : 'Footer'}
                        </span>
                      </label>
                      
                      {settings.enabled && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Lebar Posisi</label>
                            <input
                              type="text"
                              value={settings.width}
                              onChange={(e) => setAdForm(prev => ({
                                ...prev,
                                positions: {
                                  ...prev.positions,
                                  [pos]: { ...settings, width: e.target.value }
                                }
                              }))}
                              className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Tinggi Maksimal</label>
                            <input
                              type="text"
                              value={settings.maxHeight}
                              onChange={(e) => setAdForm(prev => ({
                                ...prev,
                                positions: {
                                  ...prev.positions,
                                  [pos]: { ...settings, maxHeight: e.target.value }
                                }
                              }))}
                              className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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

// ── AI Auto-Berita Panel ──────────────────────────────────────────────────────

function AiNewsPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const apiBase = window.location.origin + '/api';

  const handleRun = async () => {
    if (!secretKey.trim()) {
      setLog(['❌ Masukkan Secret Key terlebih dahulu.']);
      return;
    }
    setIsRunning(true);
    setLog(['🤖 Menghubungi AI generator...']);
    try {
      const res = await fetch(`${apiBase}/auto_news.php?secret=${encodeURIComponent(secretKey)}`, {
        method: 'GET',
      });
      const text = await res.text();
      if (res.ok) {
        setLog(['✅ Selesai! Cek tab Kelola Berita untuk melihat artikel baru.', '', '📋 Log dari server:', ...text.split('\n').filter(Boolean)]);
      } else {
        setLog([`❌ Server merespons ${res.status}:`, text.slice(0, 300)]);
      }
    } catch (err: unknown) {
      setLog([`❌ Gagal terhubung ke server: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#d90429] to-[#ef233c] p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7" />
          <h2 className="text-2xl font-black">AI Auto-Berita</h2>
        </div>
        <p className="text-white/80 text-sm max-w-2xl">
          Buat artikel berita secara otomatis menggunakan kecerdasan buatan (Google Gemini AI).
          Sistem ini dapat dijadwalkan berjalan 2x sehari via Cron Job cPanel, atau dipicu secara manual dari sini.
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#d90429]" />
          Langkah Pengaturan
        </h3>

        <div className="space-y-3">
          <Step number={1} title="Dapatkan Google Gemini API Key">
            <p>Kunjungi <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#d90429] underline">aistudio.google.com/app/apikey</a> dan buat API key gratis.</p>
          </Step>

          <Step number={2} title="Edit file auto_news.php">
            <p>Buka <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">public_html/api/auto_news.php</code> dan ganti:</p>
            <pre className="mt-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono overflow-x-auto">
{`define('GEMINI_API_KEY', 'GANTI_DENGAN_API_KEY_GEMINI_ANDA');
define('AUTO_NEWS_SECRET', 'buat-kode-rahasia-unik-anda');`}
            </pre>
          </Step>

          <Step number={3} title="Setting Cron Job di cPanel">
            <p>Masuk ke cPanel → <strong>Cron Jobs</strong> → tambahkan 2 jadwal:</p>
            <pre className="mt-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
{`# Pagi pukul 06:00 WIB
0 23 * * * php /home/AKUN/public_html/api/auto_news.php >> /home/AKUN/logs/autonews.log 2>&1

# Sore pukul 18:00 WIB  
0 11 * * * php /home/AKUN/public_html/api/auto_news.php >> /home/AKUN/logs/autonews.log 2>&1`}
            </pre>
            <p className="text-xs text-gray-500 mt-1">* Ganti <code>AKUN</code> dengan nama akun cPanel Anda (contoh: sinw8647)</p>
          </Step>

          <Step number={4} title="Uji manual dari sini">
            <p>Masukkan secret key yang sudah Anda tentukan di atas, lalu klik tombol Generate.</p>
          </Step>
        </div>
      </div>

      {/* Manual Trigger */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#d90429]" />
          Generate Berita Sekarang
        </h3>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Masukkan Secret Key dari auto_news.php"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#d90429] text-white rounded-xl font-semibold hover:bg-[#ef233c] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sedang Generate...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Sekarang
              </>
            )}
          </button>
        </div>

        {log.length > 0 && (
          <div className="bg-gray-950 rounded-xl p-4 font-mono text-xs text-green-400 max-h-64 overflow-y-auto space-y-1">
            {log.map((line, i) => (
              <div key={i}>{line || <br />}</div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
        <strong>⚠️ Catatan Penting:</strong> Artikel yang di-generate AI akan langsung dipublikasikan.
        Disarankan untuk meninjau dan mengedit gambar berita secara manual di tab <em>Kelola Berita</em>.
        Gemini API versi gratis memiliki batas 60 request/menit.
      </div>
    </section>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#d90429] text-white text-sm font-black flex items-center justify-center">
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
        <div className="text-sm text-gray-600 dark:text-gray-400">{children}</div>
      </div>
    </div>
  );
}
