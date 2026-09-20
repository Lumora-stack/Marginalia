import { Link, NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  { id: 'pencil-arts', label: 'Pencil Arts' },
  { id: 'pixel-arts', label: 'Pixel Arts' },
  { id: 'sketches', label: 'Sketches' },
  { id: 'doodles', label: 'Doodles' },
  { id: 'diy-crafts', label: 'DIY Crafts' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-paper/80 dark:bg-[#1a1a1c]/80 border-b border-ink/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-tight font-medium hover:text-accent transition-colors duration-300">
          Artville
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {sections.map(s => (
            <NavLink 
              key={s.id} 
              to={`/section/${s.id}`}
              className={({ isActive }) => 
                `text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${isActive ? 'text-accent' : 'opacity-70 hover:opacity-100 hover:text-accent'}`
              }
            >
              {s.label}
            </NavLink>
          ))}
          <NavLink 
            to="/about"
            className={({ isActive }) => 
              `text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${isActive ? 'text-accent' : 'opacity-70 hover:opacity-100 hover:text-accent'}`
            }
          >
            About
          </NavLink>
          <ThemeToggle />
          {isOwner && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-red-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-500/10"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </motion.button>
          )}
        </nav>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          {isOwner && (
            <button onClick={handleLogout} title="Logout" className="p-2 text-red-500 hover:text-red-600 transition-colors">
              <LogOut size={18} />
            </button>
          )}
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Menu" className="p-2">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-paper dark:bg-[#1a1a1c] border-b border-ink/5 dark:border-white/5 flex flex-col items-center py-8 gap-6 shadow-xl"
          >
            {sections.map(s => (
              <NavLink 
                key={s.id} 
                to={`/section/${s.id}`}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `text-lg font-serif transition-colors ${isActive ? 'text-accent' : 'hover:text-accent'}`
                }
              >
                {s.label}
              </NavLink>
            ))}
            <NavLink 
              to="/about"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `text-lg font-serif transition-colors ${isActive ? 'text-accent' : 'hover:text-accent'}`
              }
            >
              About
            </NavLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
