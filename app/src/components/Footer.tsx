import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useSiteContent } from '@/context/SiteContentContext';
import { Ad } from '@/components/Ad';

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { homeContent } = useSiteContent();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Berita', href: '/berita' },
    { name: 'Tentang', href: '/#about' },
    { name: 'Visi & Misi', href: '/#vision' },
    { name: 'Kontak', href: '/#contact' },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  const navigateToLink = (href: string) => {
    if (!href.startsWith('/#')) {
      navigate(href);
      return;
    }

    const hash = href.replace('/', '');
    if (location.pathname === '/') {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    navigate(`/${hash}`);
  };

  return (
    <footer ref={footerRef} className="relative w-full overflow-hidden bg-black">
      <div
        className={`absolute left-0 top-0 h-1 bg-gradient-to-r from-[#d90429] to-[#ef233c] transition-all duration-800 ${
          isVisible ? 'w-full' : 'w-0'
        }`}
      />

      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-[#d90429] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-[#d90429] blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 py-16 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div
            className={`md:col-span-2 transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <Link to="/" className="inline-block group">
              <img
                src="/images/sms-logo.png"
                alt="SMS Logo"
                className="mb-4 h-16 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="mb-6 max-w-md text-white/60">
              Sinergi Muda Strategis (SMS) adalah platform media digital independen yang
              mengusung semangat "Digital Independen" untuk memperjuangkan keadilan.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all duration-300 hover:scale-110 hover:bg-[#d90429] hover:text-white ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                    style={{ transitionDelay: `${550 + index * 50}ms` }}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div
            className={`transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h3 className="mb-4 font-semibold text-white">Menu</h3>
            <nav className="space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => navigateToLink(link.href)}
                  className="block text-left text-white/60 transition-colors duration-300 hover:text-[#d90429]"
                >
                  {link.name}
                </button>
              ))}
            </nav>
          </div>

          <div
            className={`transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <h3 className="mb-4 font-semibold text-white">Kontak</h3>
            <div className="space-y-3 text-white/60">
              {homeContent.contacts.map((contact) => (
                <p key={contact.id}>
                  {contact.title}: {contact.value}
                </p>
              ))}
              <p className="pt-2 text-sm">Majalengka, Jawa Barat, Indonesia</p>
            </div>
          </div>
        </div>

        <div className="my-10 border-t border-white/10" />

        <div
          className={`flex flex-col items-center justify-between gap-4 transition-all duration-400 sm:flex-row ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <p className="text-center text-sm text-white/40 sm:text-left">
            © {new Date().getFullYear()} Sinergi Muda Strategis. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Didirikan oleh Krispol Siregar, S.H. | Digital Independen - Memperjuangkan
            Keadilan
          </p>
        </div>
      </div>

      <Ad position="footer" />
    </footer>
  );
}
