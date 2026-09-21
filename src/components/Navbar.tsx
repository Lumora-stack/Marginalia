import { Link, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Menu, X, LogOut, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/categories';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Scroll detection for dynamic blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsOwner(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOwner(false);
    navigate('/');
  };

  const navClass = scrolled
    ? 'bg-paper/85 dark:bg-[#0c0c0e]/85 backdrop-blur-xl shadow-sm border-b border-ink/8 dark:border-white/8'
    : 'bg-transparent border-b border-transparent';

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
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
                className={({ isActive }) =>
                  `relative text-xs font-mono tracking-[0.14em] uppercase transition-colors duration-200 py-1 ${
                    isActive ? 'text-accent font-semibold' : 'opacity-65 hover:opacity-100 hover:text-accent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {s.label}
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
              className={({ isActive }) =>
                `relative text-xs font-mono tracking-[0.14em] uppercase transition-colors duration-200 py-1 ${
                  isActive ? 'text-accent font-semibold' : 'opacity-65 hover:opacity-100 hover:text-accent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  About
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
                className="p-2 text-red-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="p-2.5 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Mobile Exhibition Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden bg-paper dark:bg-[#0c0c0e] flex flex-col justify-between px-8 py-10 overflow-y-auto"
          >
            {/* Header in modal */}
            <div className="flex items-center justify-between border-b border-ink/10 dark:border-white/10 pb-6">
              <span className="font-serif text-xl tracking-tight">Artville</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full border border-ink/10 dark:border-white/10 text-ink dark:text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Links List */}
            <div className="py-8 space-y-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
                Collections & Rooms
              </p>
              {CATEGORIES.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <NavLink
                    to={`/section/${s.id}`}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-baseline justify-between py-2 border-b border-ink/5 dark:border-white/5 group ${
                        isActive ? 'text-accent' : 'text-ink dark:text-white'
                      }`
                    }
                  >
                    <span className="text-2xl font-serif tracking-tight group-hover:translate-x-1.5 transition-transform duration-300">
                      {s.label}
                    </span>
                    <span className="font-mono text-xs opacity-40 group-hover:text-accent">
                      {s.num}
                    </span>
                  </NavLink>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * CATEGORIES.length, duration: 0.4 }}
              >
                <NavLink
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-baseline justify-between py-2 border-b border-ink/5 dark:border-white/5 group ${
                      isActive ? 'text-accent' : 'text-ink dark:text-white'
                    }`
                  }
                >
                  <span className="text-2xl font-serif tracking-tight group-hover:translate-x-1.5 transition-transform duration-300">
                    About the Artist
                  </span>
                  <span className="font-mono text-xs opacity-40 group-hover:text-accent">
                    ✦
                  </span>
                </NavLink>
              </motion.div>
            </div>

            {/* Footer in mobile modal */}
            <div className="pt-6 border-t border-ink/10 dark:border-white/10 text-xs font-mono opacity-60 space-y-1">
              <p className="font-serif italic text-sm text-accent opacity-90">
                "Creating art from tiny feelings..."
              </p>
              <p>Chennai, India</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
