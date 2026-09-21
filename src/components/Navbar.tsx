import { Link, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { id: 'pencil-arts', label: 'Pencil Arts' },
  { id: 'pixel-arts',  label: 'Pixel Arts'  },
  { id: 'sketches',    label: 'Sketches'    },
  { id: 'doodles',     label: 'Doodles'     },
  { id: 'diy-crafts',  label: 'DIY Crafts'  },
];

export default function Navbar() {
  const [isOpen, setIsOpen]   = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    ? 'bg-paper/85 dark:bg-[#111111]/85 backdrop-blur-xl shadow-sm border-b border-ink/8 dark:border-white/8'
    : 'bg-transparent border-b border-transparent';

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`sticky top-0 z-40 w-full transition-all duration-500 ${navClass}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-xl tracking-tight font-medium hover:text-accent transition-colors duration-300 relative group">
          Artville
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(s => (
            <NavLink
              key={s.id}
              to={`/section/${s.id}`}
              className={({ isActive }) =>
                `relative text-xs font-mono tracking-[0.12em] uppercase transition-colors duration-200 py-1 ${
                  isActive ? 'text-accent' : 'opacity-60 hover:opacity-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {s.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `relative text-xs font-mono tracking-[0.12em] uppercase transition-colors duration-200 py-1 ${
                isActive ? 'text-accent' : 'opacity-60 hover:opacity-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                About
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
              className="flex items-center gap-1.5 text-xs font-mono tracking-[0.1em] uppercase text-red-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </motion.button>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          {isOwner && (
            <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-500 transition-colors">
              <LogOut size={17} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
            className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="md:hidden overflow-hidden bg-paper/95 dark:bg-[#111111]/95 backdrop-blur-xl border-b border-ink/8 dark:border-white/8"
          >
            <div className="flex flex-col items-center py-8 gap-5 px-6">
              {navLinks.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={`/section/${s.id}`}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-serif transition-colors ${isActive ? 'text-accent' : 'hover:text-accent'}`
                    }
                  >
                    {s.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: navLinks.length * 0.05 }}>
                <NavLink
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `text-lg font-serif transition-colors ${isActive ? 'text-accent' : 'hover:text-accent'}`
                  }
                >
                  About
                </NavLink>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
