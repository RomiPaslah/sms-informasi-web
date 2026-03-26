import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300 ${
            theme === 'dark' ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
          }`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 text-indigo-400 transition-all duration-300 ${
            theme === 'light' ? '-rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
          }`}
        />
      </div>
    </button>
  );
}
