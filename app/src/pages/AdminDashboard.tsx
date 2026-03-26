import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Newspaper, 
  Eye, 
  EyeOff,
  Search,
  Home,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/context/NewsContext';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { news, deleteNews } = useNews();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredNews = news.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Header */}
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
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#d90429] transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#d90429]/10 rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-[#d90429]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Berita</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{news.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dipublikasikan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.filter((n) => n.published).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.filter((n) => !n.published).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
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
          <Link
            to="/admin/berita/baru"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#d90429] text-white rounded-xl font-medium hover:bg-[#ef233c] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Berita Baru
          </Link>
        </div>

        {/* News Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Berita
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
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
                          <img
                            src={item.image || '/images/hero-bg.jpg'}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {item.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.author}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-[#d90429]/10 dark:bg-[#d90429]/20 text-[#d90429] text-xs font-semibold rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                            item.published
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'
                          }`}
                        >
                          {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {item.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/berita/edit/${item.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              deleteConfirm === item.id
                                ? 'bg-red-600 text-white'
                                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
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
      </main>
    </div>
  );
}
