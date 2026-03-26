import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Tentang', href: '#about' },
    { name: 'Visi & Misi', href: '#vision' },
    { name: 'Pilar', href: '#pillars' },
    { name: 'Kontak', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-effect shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-3 group"
          >
            <img
              src="/images/sms-logo.png"
              alt="SMS Logo"
              className={`h-10 w-auto transition-all duration-300 group-hover:scale-105 ${
                isScrolled ? '' : 'brightness-0 invert'
              }`}
            />
            <div className={`hidden sm:block transition-colors duration-300 ${isScrolled ? 'text-black' : 'text-white'}`}>
              <span className="font-bold text-lg leading-tight block">SMS</span>
              <span className="text-xs tracking-wider">SINERGI MUDA STRATEGIS</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`relative text-sm font-medium transition-colors duration-300 group ${
                  isScrolled ? 'text-black hover:text-[#d90429]' : 'text-white hover:text-[#ef233c]'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#d90429] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact');
              }}
              className="btn-primary text-sm"
            >
              Gabung Sekarang
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors duration-300 ${
              isScrolled ? 'text-black' : 'text-white'
            }`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white rounded-xl shadow-xl p-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="block px-4 py-3 text-black font-medium hover:bg-[#f8f9fa] hover:text-[#d90429] rounded-lg transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact');
              }}
              className="btn-primary w-full text-center mt-4"
            >
              Gabung Sekarang
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
