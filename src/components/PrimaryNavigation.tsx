import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../lib/categories';
import { preloadRoute } from '../lib/preloadRoute';
import { SITE_NAME } from '../lib/site';
import ThemeToggle from './ThemeToggle';

const mainLinks = [
  { label: 'Home', to: '/' },
  { label: 'Creative', to: '/creative' },
  { label: 'Tech', to: '/tech' },
  { label: 'Places', to: '/places/food' },
  { label: 'Watched', to: '/watched' },
  { label: 'Settings', to: '/settings' },
];

const searchEntries = [
  ...mainLinks.map(link => ({
    ...link,
    description: link.label === 'Creative' ? 'Pencil art, doodles, sketches, crafts, and games' : `Explore ${link.label.toLowerCase()}`,
  })),
  { label: 'Food & Cafes', to: '/places/food', description: 'Places to eat and remember' },
  { label: 'Travel', to: '/places/travel', description: 'Destinations and trips' },
  { label: 'About', to: '/settings/about', description: 'Profile, interests, and contact' },
  ...CATEGORIES.map(category => ({
    label: category.label,
    to: `/creative/${category.id}`,
    description: category.desc,
  })),
];

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? searchEntries.filter(entry => `${entry.label} ${entry.description}`.toLowerCase().includes(term)).slice(0, 8)
      : searchEntries.slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setQuery('');
          setOpen(true);
        }}
        aria-label="Search the site"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors hover:border-accent/50 hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-white/15 dark:hover:bg-white/10"
      >
        <Search size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={event => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="global-search-title"
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-2xl dark:border-white/10 dark:bg-[#141416]"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center gap-3 border-b border-ink/10 px-5 dark:border-white/10">
                <Search size={18} className="shrink-0 text-accent" />
                <h2 id="global-search-title" className="sr-only">Search {SITE_NAME}</h2>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search collections and sections"
                  className="h-16 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-45"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                  className="rounded-full p-2 opacity-60 transition hover:bg-ink/5 hover:opacity-100 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto p-2">
                {results.length ? results.map((entry, index) => (
                  <Link
                    key={`${entry.to}-${index}`}
                    to={entry.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-accent/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span className="min-w-0">
                      <span className="block font-serif text-base">{entry.label}</span>
                      <span className="mt-0.5 block truncate text-xs opacity-55">{entry.description}</span>
                    </span>
                    <ArrowUpRight size={16} className="shrink-0 text-accent" />
                  </Link>
                )) : (
                  <p className="p-6 text-center text-sm opacity-55">No sections match “{query}”.</p>
                )}
              </div>
              <p className="border-t border-ink/10 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.18em] opacity-40 dark:border-white/10">
                Search across the Artville archive
              </p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function PrimaryNavigation() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/8 bg-paper/85 backdrop-blur-xl dark:border-white/8 dark:bg-[#0c0c0e]/85">
      <div className="site-container flex min-h-16 items-center justify-between gap-3 py-2">
        <Link to="/" className="group flex shrink-0 items-center gap-2 font-serif text-xl tracking-tight transition-colors hover:text-accent">
          <span aria-hidden="true" className="text-accent">✦</span>
          <span>{SITE_NAME}</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {mainLinks.map(link => {
            const active = link.to === '/'
              ? location.pathname === '/'
              : link.to === '/places/food'
                ? location.pathname.startsWith('/places')
                : location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onPointerEnter={() => { void preloadRoute(link.to); }}
                onFocus={() => { void preloadRoute(link.to); }}
                className={`relative rounded-full px-3 py-2 text-[10px] font-mono uppercase tracking-[0.12em] transition-colors ${
                  active ? 'text-accent' : 'opacity-65 hover:opacity-100 hover:text-accent'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="primary-nav-indicator"
                    className="absolute inset-x-3 bottom-1 h-px rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 430, damping: 34 }}
                  />
                )}
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <GlobalSearch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
