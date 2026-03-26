import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, canAccessAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Berita', href: '/berita' },
    { name: 'Tentang', href: '/#about' },
    { name: 'Visi & Misi', href: '/#vision' },
    { name: 'Kontak', href: '/#contact' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('/#')) {
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDark = isScrolled || !isHomePage;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isDark ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/images/sms-logo.png" alt="SMS Logo" className={`h-10 w-auto transition-all duration-300 group-hover:scale-105 ${isDark ? '' : 'brightness-0 invert'}`} />
            <div className={`hidden sm:block ${isDark ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
              <span className="font-bold text-lg leading-tight block">SMS</span>
              <span className={`text-xs tracking-wider ${isDark ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'}`}>
                SINERGI MUDA STRATEGIS
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#')) {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }
                }}
                className={`relative text-sm font-medium transition-colors duration-300 group ${isDark ? 'text-gray-700 dark:text-gray-300 hover:text-[#d90429]' : 'text-white/90 hover:text-white'}`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#d90429] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDark ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-white/20 text-white hover:bg-white/30'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to={canAccessAdmin ? '/admin' : '/'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isDark ? 'bg-[#d90429] text-white hover:bg-[#ef233c]' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{canAccessAdmin ? 'Admin' : 'Akun'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${isDark ? 'text-[#d90429] hover:text-[#ef233c]' : 'text-white/80 hover:text-white'}`}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className={`px-4 py-2 rounded-lg font-medium transition-all ${isDark ? 'text-[#d90429] hover:text-[#ef233c] dark:text-[#d90429]' : 'text-white/80 hover:text-white'}`}>
                  Masuk
                </Link>
                <Link to="/register" className={`px-4 py-2 rounded-lg font-medium transition-all ${isDark ? 'bg-[#d90429] text-white hover:bg-[#ef233c]' : 'bg-white text-gray-900 hover:bg-white/90'}`}>
                  Daftar
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors duration-300 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#')) {
                    e.preventDefault();
                    scrollToSection(link.href);
                  } else {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#d90429] rounded-lg transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <Link
                  to={canAccessAdmin ? '/admin' : '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 bg-[#d90429] text-white rounded-lg font-medium"
                >
                  <User className="w-4 h-4" />
                  {canAccessAdmin ? 'Dashboard Admin' : 'Akun Saya'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-[#d90429] font-medium hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-[#d90429] text-white font-medium rounded-lg hover:bg-[#ef233c] transition-colors duration-300"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
