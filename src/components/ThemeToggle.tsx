import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = !isDark;
    const bounds = event.currentTarget.getBoundingClientRect();
    document.documentElement.style.setProperty('--theme-x', `${bounds.left + bounds.width / 2}px`);
    document.documentElement.style.setProperty('--theme-y', `${bounds.top + bounds.height / 2}px`);
    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#0C0C0E' : '#F7F5F1');
      document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', next ? 'dark' : 'light');
      setIsDark(next);
    };
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };
    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  return (
    <button 
      onClick={toggle}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
