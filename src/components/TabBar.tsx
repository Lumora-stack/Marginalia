import { motion } from 'framer-motion';
import { Compass, Film, Home, Palette, Settings, Terminal } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Home', to: '/', Icon: Home },
  { label: 'Creative', to: '/creative', Icon: Palette },
  { label: 'Tech', to: '/tech', Icon: Terminal },
  { label: 'Places', to: '/places/food', Icon: Compass },
  { label: 'Watched', to: '/watched', Icon: Film },
  { label: 'Settings', to: '/settings', Icon: Settings },
];

export default function TabBar() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(20,18,14,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c0c0e]/95 md:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-6">
        {tabs.map(({ label, to, Icon }) => {
          const active = to === '/'
            ? location.pathname === '/'
            : to === '/places/food'
              ? location.pathname.startsWith('/places')
              : location.pathname === to || location.pathname.startsWith(`${to}/`);
          return (
            <NavLink
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-1 px-0.5 pt-2 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                active ? 'text-accent' : 'opacity-55 hover:opacity-100'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                />
              )}
              <Icon size={17} strokeWidth={active ? 2 : 1.7} aria-hidden="true" />
              <span className="max-w-full truncate text-[9px] font-mono leading-none">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
