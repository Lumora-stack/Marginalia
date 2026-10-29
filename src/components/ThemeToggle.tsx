import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { setThemePreference } from '../lib/theme';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = !isDark;
    const bounds = event.currentTarget.getBoundingClientRect();
    document.documentElement.style.setProperty('--theme-x', `${bounds.left + bounds.width / 2}px`);
    document.documentElement.style.setProperty('--theme-y', `${bounds.top + bounds.height / 2}px`);
    const applyTheme = () => {
      setThemePreference(next ? 'dark' : 'light');
      setIsDark(next);
    };
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (!reduceMotion && !coarsePointer && transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  return (
    <button 
      onClick={toggle}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-white/15 dark:hover:bg-white/10 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
