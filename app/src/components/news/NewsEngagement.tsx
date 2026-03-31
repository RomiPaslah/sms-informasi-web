import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNews } from '@/context/NewsContext';
import type { News } from '@/types';

const REACTIONS = ['\u{1F44D}', '\u2764\uFE0F', '\u{1F44F}', '\u{1F525}', '\u{1F60D}', '\u{1F389}'];

interface NewsEngagementProps {
  news: News;
  showCommentsLink?: boolean;
}

export function NewsEngagement({ news, showCommentsLink = true }: NewsEngagementProps) {
  const { user } = useAuth();
  const { setReaction } = useNews();
  const [shareOpen, setShareOpen] = useState(false);
  const [guestId, setGuestId] = useState<string>('');

  // Generate or get guest ID from localStorage
  useEffect(() => {
    const generateGuestId = () => {
      let stored = localStorage.getItem('sms_guest_id');
      if (!stored) {
        stored = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('sms_guest_id', stored);
      }
      setGuestId(stored);
    };
    generateGuestId();
  }, []);

  const reactionCounts = useMemo(() => {
    return Object.values(news.reactions).reduce<Record<string, number>>((acc, emoji) => {
      if (!emoji) {
        return acc;
      }

      acc[emoji] = (acc[emoji] || 0) + 1;
      return acc;
    }, {});
  }, [news.reactions]);

  const articleUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/berita/${news.id}`
      : `/berita/${news.id}`;

  const handleReaction = (emoji: string) => {
    const reactorId = user ? user.id : guestId;
    if (!reactorId) {
      return;
    }

    setReaction(news.id, reactorId, emoji, !user ? guestId : undefined);
  };

  const handleShare = async (type: 'native' | 'copy' | 'whatsapp') => {
    const shareText = `${news.title} - ${articleUrl}`;

    if (type === 'native' && navigator.share) {
      await navigator.share({ title: news.title, text: news.excerpt, url: articleUrl });
      setShareOpen(false);
      return;
    }

    if (type === 'copy') {
      await navigator.clipboard.writeText(articleUrl);
      setShareOpen(false);
      return;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {REACTIONS.map((emoji) => {
          const currentId = user ? user.id : guestId;
          const active = currentId && news.reactions[currentId] === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => handleReaction(emoji)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${
                active
                  ? 'border-[#d90429] bg-[#d90429]/10 text-[#d90429]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#d90429] hover:text-[#d90429] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              <span>{emoji}</span>
              <span>{reactionCounts[emoji] || 0}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {showCommentsLink && (
          <Link
            to={`/berita/${news.id}#komentar`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d90429] dark:text-gray-300"
          >
            <MessageCircle className="h-4 w-4" />
            {news.comments.length} komentar
          </Link>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setShareOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d90429] dark:text-gray-300"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>

          {shareOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => void handleShare('native')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Send className="h-4 w-4" />
                Bagikan
              </button>
              <button
                type="button"
                onClick={() => void handleShare('copy')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4" />
                Salin link
              </button>
              <button
                type="button"
                onClick={() => void handleShare('whatsapp')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
