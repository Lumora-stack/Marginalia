import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Phone, AtSign, Sparkles } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { SITE_NAME, SITE_TAGLINE } from '../lib/site';

const ScrollVelocity = lazy(() => import('./ScrollVelocity'));

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-[calc(var(--section-space)*0.25)] border-t border-ink/10 bg-paper/60 pb-[calc(5.75rem+env(safe-area-inset-bottom))] backdrop-blur-lg dark:border-white/10 dark:bg-[#0c0c0e]/80 md:pb-0 overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="site-container pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--content-gap)] mb-10">
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <span className="font-accent text-2xl tracking-tight">{SITE_NAME}</span>
            </div>
            <p className="text-sm font-accent italic tracking-wide text-accent">
              {SITE_TAGLINE}
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
                    className="text-sm opacity-70 hover:opacity-100 hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-[10px] font-mono text-accent group-hover:text-accent">{String(index + 1).padStart(2, '0')}</span>
                    <span>{area.label}</span>
                  </Link>
                </li>
              ))}
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

        <div aria-hidden="true" className="mb-8 overflow-hidden border-y border-ink/10 dark:border-white/10 py-4">
          <Suspense fallback={<p className="whitespace-nowrap font-serif text-4xl text-accent/25 sm:text-6xl">ART IS A WAY OF SEEING · ART IS A WAY OF SEEING ·</p>}>
            <ScrollVelocity
              texts={['ART IS A WAY OF SEEING']}
              velocity={18}
              numCopies={4}
              className="font-serif text-4xl text-accent/25 sm:text-6xl"
              draggable={false}
            />
          </Suspense>
        </div>

        {/* Separator and Bottom Bar */}
        <div className="pt-8 border-t border-ink/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono opacity-60">
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
