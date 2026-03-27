import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { siteContentApi } from '@/lib/api';
import type { HomeContent, AdSettings } from '@/types';

interface SiteContentContextType {
  homeContent: HomeContent;
  updateHomeContent: (content: HomeContent) => Promise<void>;
  adSettings: AdSettings;
  updateAdSettings: (settings: AdSettings) => Promise<void>;
  isLoading: boolean;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

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
    { id: 'activity-1', type: 'image', title: 'Kegiatan Lapangan', description: 'Dokumentasi advokasi dan penguatan jaringan SMS.', src: '/images/about-img.jpg' },
    { id: 'activity-2', type: 'image', title: 'Forum Diskusi', description: 'Ruang dialog strategis bersama pemuda dan masyarakat.', src: '/images/majalengka-collage.jpg' },
    { id: 'activity-3', type: 'image', title: 'Profil Tokoh', description: 'Dokumentasi figur dan kepemimpinan di dalam gerakan SMS.', src: '/images/krispol-siregar.jpg' },
  ],
  contactBadge: 'Hubungi Kami',
  contactTitle: 'Kontak Media & Info',
  contactDescription: 'Kami siap mendengarkan dan berkolaborasi dengan Anda',
  contacts: [
    { id: 'contact-whatsapp', title: 'WhatsApp', icon: '💬', value: '0821-1966-7132', link: 'https://wa.me/6282119667132', highlight: true },
    { id: 'contact-website', title: 'Website', icon: '🌐', value: 'sinergimudastrategis.com', link: 'https://www.sinergimudastrategis.com/' },
    { id: 'contact-email', title: 'Email', icon: '✉️', value: 'info@sinergimudastrategis.com', link: 'mailto:info@sinergimudastrategis.com' },
  ],
  navLinks: [
    { id: 'nav-beranda', name: 'Beranda', href: '/#hero' },
    { id: 'nav-tentang', name: 'Tentang', href: '/#about' },
    { id: 'nav-visi', name: 'Visi & Misi', href: '/#vision' },
    { id: 'nav-pillars', name: 'Pilar', href: '/#pillars' },
    { id: 'nav-kontak', name: 'Kontak', href: '/#contact' },
    { id: 'nav-berita', name: 'Berita', href: '/berita' },
  ],
};

const DEFAULT_AD_SETTINGS: AdSettings = {
  enabled: false,
  adType: 'adsense',
  adsensePublisherId: '',
  customAdHtml: '',
  adPositions: {
    header: false,
    sidebar: false,
    footer: false,
    betweenContent: false,
  },
};

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [adSettings, setAdSettings] = useState<AdSettings>(DEFAULT_AD_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadContent = useCallback(async () => {
    try {
      const [homepageRes, adsRes] = await Promise.allSettled([
        siteContentApi.get('homepage'),
        siteContentApi.get('ad_settings'),
      ]);

      if (homepageRes.status === 'fulfilled' && homepageRes.value.data) {
        const parsed = homepageRes.value.data as Partial<HomeContent>;
        setHomeContent({
          ...DEFAULT_HOME_CONTENT,
          ...parsed,
          activitiesMedia: parsed.activitiesMedia?.length ? parsed.activitiesMedia : DEFAULT_HOME_CONTENT.activitiesMedia,
          contacts: parsed.contacts?.length ? parsed.contacts : DEFAULT_HOME_CONTENT.contacts,
          navLinks: parsed.navLinks?.length ? parsed.navLinks : DEFAULT_HOME_CONTENT.navLinks,
        });
      }

      if (adsRes.status === 'fulfilled' && adsRes.value.data) {
        setAdSettings({ ...DEFAULT_AD_SETTINGS, ...(adsRes.value.data as Partial<AdSettings>) });
      }
    } catch {
      // Use defaults on error
    }
  }, []);

  useEffect(() => {
    loadContent().finally(() => setIsLoading(false));
  }, [loadContent]);

  const updateHomeContent = async (content: HomeContent): Promise<void> => {
    setHomeContent(content);
    try {
      await siteContentApi.update('homepage', content);
    } catch (err) {
      console.error('[SiteContent] Failed to save homepage:', err);
      throw err;
    }
  };

  const updateAdSettings = async (settings: AdSettings): Promise<void> => {
    setAdSettings(settings);
    try {
      await siteContentApi.update('ad_settings', settings);
    } catch (err) {
      console.error('[SiteContent] Failed to save ad settings:', err);
      throw err;
    }
  };

  return (
    <SiteContentContext.Provider
      value={{ homeContent, updateHomeContent, adSettings, updateAdSettings, isLoading }}
    >
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
