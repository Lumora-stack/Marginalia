import { Link } from 'react-router-dom';
import { CATEGORIES } from '../lib/categories';
import { ArrowUp, Mail, Phone, AtSign, Sparkles } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-24 border-t border-ink/10 dark:border-white/10 bg-paper/60 dark:bg-[#0c0c0e]/80 backdrop-blur-lg overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <span className="font-serif text-2xl tracking-tight">Artville</span>
            </div>
            <p className="text-sm font-mono tracking-widest text-accent uppercase">
              Gallery of Imagination
            </p>
            <p className="text-sm font-serif italic opacity-70 leading-relaxed max-w-sm">
              "Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍."
            </p>
            <div className="pt-2 text-xs font-mono opacity-50">
              Curated by Praveenkumar G
            </div>
          </div>

          {/* Collections */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-xs font-mono tracking-[0.25em] uppercase text-accent">
              Collections
            </p>
            <ul className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/section/${cat.id}`}
                    className="text-sm opacity-70 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-[10px] font-mono text-accent/60 group-hover:text-accent">{cat.num}</span>
                    <span>{cat.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/about"
                  className="text-sm opacity-70 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] font-mono text-accent/60">✦</span>
                  <span>About</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-sm opacity-40 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-2 font-mono text-xs"
                >
                  <span>Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-mono tracking-[0.25em] uppercase text-accent">
              Let's Connect
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:quantumvoyager2005@gmail.com"
                  className="opacity-70 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-2.5"
                >
                  <Mail size={14} className="text-accent" />
                  <span className="truncate">quantumvoyager2005@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919600404942"
                  className="opacity-70 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-2.5 font-mono text-xs"
                >
                  <Phone size={14} className="text-accent" />
                  <span>+91 96004 04942</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/crafted.strokes.42"
                  target="_blank"
                  rel="noreferrer"
                  className="opacity-70 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-2.5"
                >
                  <AtSign size={14} className="text-accent" />
                  <span>crafted.strokes.42</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator and Bottom Bar */}
        <div className="pt-8 border-t border-ink/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono opacity-60">
          <div>
            &copy; {new Date().getFullYear()} Artville Gallery of Imagination. All rights reserved.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:text-accent transition-colors group cursor-pointer"
          >
            <span>BACK TO TOP</span>
            <div className="w-7 h-7 rounded-full border border-ink/20 dark:border-white/20 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all">
              <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
