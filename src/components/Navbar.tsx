import { Link, NavLink, useNavigate } from 'react-router-dom';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { tier } = useQuality();
  const colors = useThemeColors();
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const navigateFromMenu = useCallback((event: ReactMouseEvent<HTMLAnchorElement>, item: StaggeredMenuItem) => {
    event.preventDefault();
    navigate(item.link);
  }, [navigate]);

  // Scroll detection for dynamic blur
  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);
      setHidden(currentScrollY > 120 && currentScrollY > lastScrollY.current + 4);
      if (currentScrollY < 80 || currentScrollY < lastScrollY.current - 4) setHidden(false);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-xl tracking-tight font-medium hover:text-accent transition-colors duration-300 relative group flex items-center gap-2"
          >
            <Sparkles size={16} className="text-accent opacity-80 group-hover:rotate-45 transition-transform duration-500" />
            <span>Artville</span>
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {CATEGORIES.map(s => (
              <NavLink
                key={s.id}
                to={`/section/${s.id}`}
                aria-label={s.label}
                className={({ isActive }) =>
                  `relative text-xs font-mono tracking-[0.14em] uppercase transition-colors duration-200 py-1 ${
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

            <ThemeToggle />

            {isOwner && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-1.5 text-xs font-mono tracking-[0.1em] uppercase text-red-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-500/10 border border-red-500/20"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </motion.button>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            {isOwner && (
              <button
                onClick={handleLogout}
                title="Logout"
                aria-label="Log out"
                className="p-2 text-red-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            )}
            <div className="relative h-11 w-11">
              <Suspense fallback={<button type="button" aria-label="Open menu" className="h-11 w-11 rounded-full border border-accent/30 text-accent">Menu</button>}>
                <StaggeredMenu
                  className="mobile-staggered-menu"
                  isFixed={false}
                  items={menuItems}
                  colors={colors.isDark ? ['#0d0d0f', '#8a6a20', '#d4af37'] : ['#f7f5f1', '#9a7b1f', '#e0c76c']}
                  displaySocials={false}
                  displayItemNumbering
                  menuButtonColor={colors.accent}
                  openMenuButtonColor={colors.isDark ? '#f0ede6' : '#29271f'}
                  accentColor={colors.accent}
                  panelBackground={colors.background}
                  panelTextColor={colors.isDark ? '#f0ede6' : '#29271f'}
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
