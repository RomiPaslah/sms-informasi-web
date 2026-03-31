import { useState } from 'react';
import { Send } from 'lucide-react';
import { useNews } from '@/context/NewsContext';

interface GuestCommentFormProps {
  newsId: string;
  onCommentAdded?: () => void;
}

export function GuestCommentForm({ newsId, onCommentAdded }: GuestCommentFormProps) {
  const { addComment } = useNews();
  const [formData, setFormData] = useState({
    userName: '',
    guestEmail: '',
    content: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const { userName, guestEmail, content } = formData;

    if (!userName.trim()) {
      setError('Nama harus diisi');
      return;
    }

    if (!guestEmail.trim()) {
      setError('Email harus diisi');
      return;
    }

    if (!content.trim()) {
      setError('Komentar tidak boleh kosong');
      return;
    }

    if (content.length > 1000) {
      setError('Komentar maksimal 1000 karakter');
      return;
    }

    setIsLoading(true);

    try {
      const success = await addComment(newsId, {
        userName: userName.trim(),
        guestEmail: guestEmail.trim(),
        content: content.trim(),
      });

      if (success) {
        setFormData({ userName: '', guestEmail: '', content: '' });
        setSuccess(true);
        onCommentAdded?.();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Gagal menambahkan komentar. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kesalahan saat menambahkan komentar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
        Tambah Komentar
      </h3>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Anda bisa menambahkan komentar tanpa perlu login. Isi data di bawah ini.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          ✓ Komentar Anda berhasil ditambahkan!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama *
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Nama Anda"
              maxLength={100}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="guestEmail"
              name="guestEmail"
              value={formData.guestEmail}
              onChange={handleChange}
              placeholder="email@contoh.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d90429] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Komentar *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Tulis komentar Anda di sini..."
            maxLength={1000}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d90429] resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {formData.content.length}/1000 karakter
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d90429] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#ef233c] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Mengirim...' : 'Kirim Komentar'}
        </button>
      </form>
    </div>
  );
}
