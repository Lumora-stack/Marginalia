import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { LogOut, Sparkles } from 'lucide-react';
import { lazy, Suspense, useCallback, useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { CATEGORIES } from '../lib/categories';
import { motion, useReducedMotion } from 'framer-motion';
import { useQuality } from '../lib/quality-context';
import { useThemeColors } from '../lib/useThemeColors';
import type { StaggeredMenuItem } from './StaggeredMenu';

const StaggeredMenu = lazy(() => import('./StaggeredMenu'));
const DecryptedText = lazy(() => import('./DecryptedText'));

export default function Navbar() {
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { tier } = useQuality();
  const colors = useThemeColors();
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const isOpen = menuOpenPath === location.pathname;
  const openMenu = useCallback(() => setMenuOpenPath(location.pathname), [location.pathname]);
  const closeMenu = useCallback(() => setMenuOpenPath(null), []);
  const navigateFromMenu = useCallback((event: ReactMouseEvent<HTMLAnchorElement>, item: StaggeredMenuItem) => {
    event.preventDefault();
    navigate(item.link);
  }, [navigate]);

  // Scroll detection for dynamic blur
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const currentScrollY = window.scrollY;
        const nextScrolled = currentScrollY > 40;
        setScrolled(prev => (prev !== nextScrolled ? nextScrolled : prev));

        let nextHidden: boolean | null = null;
        if (currentScrollY > 120 && currentScrollY > lastScrollY.current + 4) {
          nextHidden = true;
        } else if (currentScrollY < 80 || currentScrollY < lastScrollY.current - 4) {
          nextHidden = false;
        }
        if (nextHidden !== null) {
          setHidden(prev => (prev !== nextHidden ? nextHidden : prev));
        }
        lastScrollY.current = currentScrollY;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Auth detection
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    void import('../lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (!active || !isSupabaseConfigured) return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (active) setIsOwner(!!session?.user);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        if (active) setIsOwner(!!session?.user);
      });
      unsubscribe = () => subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setIsOwner(false);
    navigate('/');
  };

  const navClass = scrolled
    ? 'bg-paper/85 dark:bg-[#0c0c0e]/85 backdrop-blur-xl shadow-sm border-b border-ink/8 dark:border-white/8'
    : 'bg-transparent border-b border-transparent';
  const menuItems: StaggeredMenuItem[] = [
    ...CATEGORIES.map(section => ({
      label: section.label,
      ariaLabel: `Open ${section.label} exhibition`,
      link: `/section/${section.id}`,
    })),
    { label: 'About', ariaLabel: 'About the artist', link: '/about' },
  ];
  const renderNavLabel = (text: string) => shouldReduceMotion || tier === 'low'
    ? <span>{text}</span>
    : (
      <Suspense fallback={<span>{text}</span>}>
        <DecryptedText
          text={text}
          animateOn="hover"
          effect="scramble"
          speed={32}
          maxIterations={8}
          scrambleColor={colors.accent}
        />
      </Suspense>
    );

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !isOpen ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-40 w-full transition-all duration-500 ${navClass}`}
      >
        <div className="site-container navbar-inner flex items-center justify-between gap-3 pt-[env(safe-area-inset-top)]">
          {/* Logo */}
          <Link
            to="/"
            className="group relative flex min-w-0 shrink items-center gap-2 font-serif text-xl font-medium tracking-tight transition-colors duration-300 hover:text-accent md:shrink-0"
          >
            <Sparkles size={16} className="shrink-0 text-accent opacity-80 transition-transform duration-500 group-hover:rotate-45" />
            <span className="truncate">Artville</span>
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
          </Link>

          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <nav className="hidden items-center gap-5 lg:gap-7 min-[1100px]:flex">
              {CATEGORIES.map(s => (
                <NavLink
                  key={s.id}
                  to={`/section/${s.id}`}
                  aria-label={s.label}
                  className={({ isActive }) =>
                    `relative whitespace-nowrap text-xs font-mono tracking-[0.14em] uppercase transition-colors duration-200 py-1 ${
                      isActive ? 'text-accent font-semibold' : 'opacity-65 hover:opacity-100 hover:text-accent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {renderNavLabel(s.label)}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              <NavLink
                to="/about"
                aria-label="About"
                className={({ isActive }) =>
                  `relative text-xs font-mono tracking-[0.14em] uppercase transition-colors duration-200 py-1 ${
                    isActive ? 'text-accent font-semibold' : 'opacity-65 hover:opacity-100 hover:text-accent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {renderNavLabel('About')}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                  </>
                )}
              </NavLink>

              {isOwner && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleLogout}
                  title="Logout"
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-mono tracking-[0.1em] uppercase text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </motion.button>
              )}
            </nav>

            <ThemeToggle />

            {isOwner && (
              <button
                onClick={handleLogout}
                title="Logout"
                aria-label="Log out"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/20 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500 min-[1100px]:hidden"
              >
                <LogOut size={18} />
              </button>
            )}

            <div className="relative h-11 w-11 min-[1100px]:hidden">
              <Suspense fallback={<button type="button" aria-label="Open menu" className="h-11 w-11 rounded-full border border-accent/30 text-accent">Menu</button>}>
                <StaggeredMenu
                  open={isOpen}
                  items={menuItems}
                  menuButtonColor={colors.accent}
                  accentColor={colors.accent}
                  panelBackground={colors.background}
                  panelTextColor={colors.isDark ? '#f0ede6' : '#29271f'}
                  headerContent={<ThemeToggle />}
                  onMenuOpen={openMenu}
                  onMenuClose={closeMenu}
                  onItemClick={navigateFromMenu}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </motion.header>

    </>
  );
}
