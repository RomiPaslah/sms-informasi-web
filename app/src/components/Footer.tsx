import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

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

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-black overflow-hidden"
    >
      {/* Red Accent Line */}
      <div
        className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-[#d90429] to-[#ef233c] transition-all duration-800 ${
          isVisible ? 'w-full' : 'w-0'
        }`}
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#d90429] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#d90429] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className={`md:col-span-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <Link to="/" className="inline-block group">
              <img
                src="/images/sms-logo.png"
                alt="SMS Logo"
                className="h-16 w-auto mb-4 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-white/60 mb-6 max-w-md">
              Sinergi Muda Strategis (SMS) — Platform media digital independen yang mengusung semangat "Digital Independen" untuk memperjuangkan keadilan.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-[#d90429] hover:text-white hover:scale-110 transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-0'}`}
                    style={{ transitionDelay: `${550 + index * 50}ms` }}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
            <h3 className="text-white font-semibold mb-4">Menu</h3>
            <nav className="space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-white/60 hover:text-[#d90429] transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <div className="space-y-3 text-white/60">
              <p>WhatsApp: 0821-1966-7132</p>
              <p>Email: info@sinergimudastrategis.com</p>
              <p>Website: sinergimudastrategis.com</p>
              <p className="pt-2 text-sm">Majalengka, Jawa Barat, Indonesia</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-white/10" />

        {/* Copyright */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>
          <p className="text-white/40 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Sinergi Muda Strategis. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Didirikan oleh Krispol Siregar, S.H. | Digital Independen — Memperjuangkan Keadilan
          </p>
        </div>
      </div>
    </footer>
  );
}
