import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Phone, AtSign, Sparkles } from 'lucide-react';
import { SITE_NAME, SITE_TAGLINE } from '../lib/site';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-[calc(var(--section-space)*0.25)] border-t border-ink/10 bg-paper/60 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-lg dark:border-white/10 dark:bg-[#0c0c0e]/80 md:pb-0 overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="site-container pt-4 pb-2 sm:pt-12 sm:pb-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4 sm:gap-[var(--content-gap)] sm:mb-10 md:grid-cols-12">
          {/* Brand & Manifesto */}
          <div className="col-span-2 md:col-span-5 space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <span className="font-accent text-2xl tracking-tight">{SITE_NAME}</span>
            </div>
            <p className="text-xs font-accent italic tracking-wide text-accent sm:text-sm">
              {SITE_TAGLINE}
            </p>
            <p className="hidden text-sm font-serif italic opacity-70 leading-relaxed max-w-sm sm:block">
              "Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍."
            </p>
            <div className="hidden pt-2 text-xs font-mono opacity-50 sm:block">
              Curated by Praveenkumar G
            </div>
          </div>

          {/* Collections */}
          <div className="md:col-span-4 space-y-2 sm:space-y-4">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-accent sm:text-xs sm:tracking-[0.25em]">
              Collections
            </p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-2 sm:gap-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Creative Journey', to: '/creative' },
                { label: 'Tech', to: '/tech' },
                { label: 'Food & Cafes', to: '/places/food' },
                { label: 'Travel', to: '/places/travel' },
                { label: 'Watched', to: '/watched' },
                { label: 'Settings', to: '/settings' },
              ].map((area, index) => (
                <li key={area.to}>
                  <Link
                    to={area.to}
                    className="text-xs opacity-70 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-1.5 group sm:gap-2 sm:text-sm"
                  >
                    <span className="text-[10px] font-mono text-accent group-hover:text-accent">{String(index + 1).padStart(2, '0')}</span>
                    <span>{area.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3 space-y-2 sm:space-y-4">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-accent sm:text-xs sm:tracking-[0.25em]">
              Let's Connect
            </p>
            <ul className="space-y-2 text-xs sm:space-y-3 sm:text-sm">
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
        <div className="pt-3 sm:pt-8 border-t border-ink/10 dark:border-white/10 flex flex-row items-center justify-between gap-2 text-[9px] font-mono opacity-60 sm:gap-4 sm:text-xs">
          <div>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
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
