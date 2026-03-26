import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { HomeContent } from '@/types';

interface SiteContentContextType {
  homeContent: HomeContent;
  updateHomeContent: (content: HomeContent) => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

const STORAGE_KEY = 'sms_home_content';

const DEFAULT_HOME_CONTENT: HomeContent = {
  aboutBadge: 'Tentang Kami',
  aboutTitle: 'Menyatukan Intelektual dan Aksi',
  aboutDescription:
    'Didirikan oleh Krispol Siregar, S.H., SMS lahir dari kesadaran bahwa pemuda harus menjadi motor penggerak perubahan yang berbasis data dan kolaborasi. SMS hadir sebagai wadah digital yang tidak hanya menyajikan berita, tetapi juga analisis strategis demi kepentingan publik.',
  aboutQuote:
    'Kami hadir untuk memastikan suara pemuda dan keadilan memiliki ruang yang jernih di dunia digital. SMS bukan sekadar portal berita, melainkan pusat pergerakan intelektual yang progresif.',
  aboutQuoteAuthor: 'Krispol Siregar, S.H., Ketum SMS',
  activitiesTitle: 'SMS Activities & Dokumentasi',
  activitiesDescription:
    'Dokumentasi kegiatan, liputan lapangan, dan media publikasi SMS yang dapat diperbarui langsung oleh admin.',
  activitiesMedia: [
    {
      id: 'activity-1',
      type: 'image',
      title: 'Kegiatan Lapangan',
      description: 'Dokumentasi advokasi dan penguatan jaringan SMS.',
      src: '/images/about-img.jpg',
    },
    {
      id: 'activity-2',
      type: 'image',
      title: 'Forum Diskusi',
      description: 'Ruang dialog strategis bersama pemuda dan masyarakat.',
      src: '/images/majalengka-collage.jpg',
    },
    {
      id: 'activity-3',
      type: 'image',
      title: 'Profil Tokoh',
      description: 'Dokumentasi figur dan kepemimpinan di dalam gerakan SMS.',
      src: '/images/krispol-siregar.jpg',
    },
  ],
};

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HOME_CONTENT));
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<HomeContent>;
      setHomeContent({
        ...DEFAULT_HOME_CONTENT,
        ...parsed,
        activitiesMedia: parsed.activitiesMedia?.length
          ? parsed.activitiesMedia
          : DEFAULT_HOME_CONTENT.activitiesMedia,
      });
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HOME_CONTENT));
    }
  }, []);

  const updateHomeContent = (content: HomeContent) => {
    setHomeContent(content);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  };

  return (
    <SiteContentContext.Provider value={{ homeContent, updateHomeContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }

  return context;
}
