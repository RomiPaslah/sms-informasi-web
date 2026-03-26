import { useEffect, useRef, useState } from 'react';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
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
      { threshold: 0.15 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Tentang', href: '#about' },
    { name: 'Visi & Misi', href: '#vision' },
    { name: 'Pilar', href: '#pillars' },
    { name: 'Kontak', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#d90429] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#d90429] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          {/* Logo & Tagline */}
          <div
            className={`text-center md:text-left transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ 
              transitionDelay: '200ms',
              transitionTimingFunction: 'var(--ease-smooth)'
            }}
          >
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="inline-block group">
              <img
                src="/images/sms-logo.png"
                alt="SMS Logo"
                className="h-16 w-auto mx-auto md:mx-0 mb-4 transition-transform duration-300 group-hover:scale-105"
              />
            </a>
            <p className="text-white/60 text-sm">
              Digital Independen — Memperjuangkan Keadilan
            </p>
          </div>

          {/* Navigation */}
          <div
            className={`text-center transition-all duration-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <nav className="flex flex-wrap justify-center gap-6">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={`text-white/70 hover:text-[#d90429] text-sm font-medium transition-all duration-300 relative group ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ transitionDelay: `${350 + index * 50}ms` }}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d90429] transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div
            className={`text-center md:text-right transition-all duration-400 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="flex justify-center md:justify-end gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-[#d90429] hover:text-white hover:scale-110 transition-all duration-300 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                    style={{ 
                      transitionDelay: `${550 + index * 50}ms`,
                      transitionTimingFunction: 'var(--ease-elastic)'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-white/10" />

        {/* Copyright */}
        <div
          className={`text-center transition-all duration-400 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Sinergi Muda Strategis. All rights reserved.
          </p>
          <p className="text-white/30 text-xs mt-2">
            Didirikan oleh Krispol Siregar, S.H.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
