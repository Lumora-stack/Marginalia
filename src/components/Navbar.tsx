import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const sections = [
  { id: 'pencil-arts', label: 'Pencil Arts' },
  { id: 'pixel-arts', label: 'Pixel Arts' },
  { id: 'sketches', label: 'Sketches' },
  { id: 'doodles', label: 'Doodles' },
  { id: 'diy-crafts', label: 'DIY Crafts' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-paper/80 dark:bg-[#1a1a1c]/80 border-b border-ink/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-tight font-medium">
          Praveenkumar G.
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {sections.map(s => (
            <NavLink 
              key={s.id} 
              to={`/section/${s.id}`}
              className={({ isActive }) => 
                `text-sm font-medium tracking-wide uppercase ${isActive ? 'text-accent' : 'hover:text-accent transition-colors'}`
              }
            >
              {s.label}
            </NavLink>
          ))}
          <NavLink 
            to="/about"
            className={({ isActive }) => 
              `text-sm font-medium tracking-wide uppercase ${isActive ? 'text-accent' : 'hover:text-accent transition-colors'}`
            }
          >
            About
          </NavLink>
          <ThemeToggle />
        </nav>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="md:hidden absolute top-20 left-0 w-full bg-paper dark:bg-[#1a1a1c] border-b border-ink/5 dark:border-white/5 flex flex-col items-center py-8 gap-6 shadow-xl">
          {sections.map(s => (
            <NavLink 
              key={s.id} 
              to={`/section/${s.id}`}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `text-lg font-serif ${isActive ? 'text-accent' : 'hover:text-accent'}`
              }
            >
              {s.label}
            </NavLink>
          ))}
          <NavLink 
            to="/about"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `text-lg font-serif ${isActive ? 'text-accent' : 'hover:text-accent'}`
            }
          >
            About
          </NavLink>
        </nav>
      )}
    </header>
  );
}
