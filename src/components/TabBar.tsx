import { motion } from 'framer-motion';
import { Compass, Film, Home, Palette, Settings, Terminal } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { preloadRoute } from '../lib/preloadRoute';
import { useSectionVisibility } from '../lib/section-visibility';

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
  const { isVisible } = useSectionVisibility();
  if (location.pathname.startsWith('/admin')) return null;
  const visibleTabs = tabs.filter(tab => {
    if (tab.label === 'Creative') return isVisible('creative');
    if (tab.label === 'Tech') return isVisible('tech');
    if (tab.label === 'Places') return isVisible('food') || isVisible('travel');
    if (tab.label === 'Watched') return isVisible('watched');
    if (tab.label === 'Settings') return isVisible('settings');
    return true;
  }).map(tab => tab.label === 'Places' && !isVisible('food')
    ? { ...tab, to: '/places/travel' }
    : tab);

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(20,18,14,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c0c0e]/95 md:hidden"
    >
      <div className="mx-auto flex max-w-xl justify-around">
        {visibleTabs.map(({ label, to, Icon }) => {
          const active = to === '/'
            ? location.pathname === '/'
            : to === '/places/food'
              ? location.pathname.startsWith('/places')
              : location.pathname === to || location.pathname.startsWith(`${to}/`);
          return (
            <NavLink
              key={to}
              to={to}
              onPointerEnter={() => { void preloadRoute(to); }}
              onFocus={() => { void preloadRoute(to); }}
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
