import { Suspense } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import Gallery from '../components/Gallery';
import Games from '../components/Games';
import GamesHub from '../components/GamesHub';
import { motion } from 'framer-motion';
import { getCategoryById, CATEGORIES } from '../lib/categories';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function Section() {
  const { id, mode } = useParams();
  const location = useLocation();
  const inCreativeJourney = location.pathname.startsWith('/creative/');
  if (!id) return null;

  const category = getCategoryById(id);
  const selectedMode = category?.gameModes?.find(gameMode => gameMode.id === mode);

  if (!category || (mode && !selectedMode)) {
    return (
      <div className="py-24 text-center space-y-6">
        <h2 className="text-3xl font-serif">Collection Not Found</h2>
        <p className="text-sm opacity-60">The requested collection does not exist.</p>
        <Link
          to={inCreativeJourney ? '/creative' : '/'}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  const isGameCollection = !!category.gameModes;
  const artworkSectionId = selectedMode ? `${category.id}-${selectedMode.id}` : id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`section-room section-room-${id}`}
    >
      {/* Breadcrumb / Back */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-accent transition-colors"
        >
          <ArrowLeft size={12} />
          <span>All Collections</span>
        </Link>
      </div>

      <motion.div
        layoutId={`room-cover-${category.id}`}
        className="relative mb-10 h-52 sm:h-64 md:h-[22rem] overflow-hidden rounded-3xl border border-ink/10 dark:border-white/10 bg-ink"
      >
        <img
          src={category.img}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        {id === 'pencil-arts' && (
          <svg aria-hidden="true" viewBox="0 0 600 150" className="pencil-room-stroke pointer-events-none absolute bottom-8 right-6 w-1/2 max-w-xl opacity-75">
            <path d="M12 112 C120 18 174 150 280 72 S444 16 588 96" fill="none" stroke="#e4c365" strokeWidth="1.5" />
            <path d="M90 114 C178 70 220 44 310 102 S468 124 540 42" fill="none" stroke="#e4c365" strokeWidth="1" />
          </svg>
        )}
        <span className="absolute bottom-6 left-6 text-xs font-mono tracking-[0.25em] uppercase text-white/70">
          Room {category.num} · Permanent Collection
        </span>
      </motion.div>

      {/* Section Header */}
      <div className="mb-[var(--heading-gap)]">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={14} className="text-accent" />
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-accent font-semibold">
            Collection {category.num} / {String(CATEGORIES.length).padStart(2, '0')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className={`section-room-title room-signature room-signature-${id} font-serif capitalize tracking-tight leading-none`}>
              {selectedMode?.label || category.label}
            </h1>
            <p className="mt-4 text-base md:text-lg opacity-60 font-serif italic max-w-xl">
              {selectedMode?.desc || category.desc}
            </p>
          </div>

          {/* Quick Collection Switcher Pills */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <Link
                key={c.id}
                to={`${inCreativeJourney ? '/creative' : '/section'}/${c.id}`}
                className={`text-[11px] font-mono tracking-wider uppercase px-3 py-1.5 rounded-full transition-all ${
                  c.id === id
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-ink/5 dark:bg-white/5 opacity-60 hover:opacity-100 hover:text-accent'
                }`}
              >
                {c.num} {c.label.split(' ')[0]}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 h-px bg-gradient-to-r from-accent via-accent/30 to-transparent" />
      </div>

      {isGameCollection ? (
        selectedMode ? (
          <Games mode={selectedMode.id} />
        ) : (
          <>
            <Suspense fallback={<div className="grid grid-cols-1 gap-[var(--content-gap)] md:grid-cols-2"><div className="h-[410px] rounded-3xl border border-accent/20 bg-paper dark:bg-[#111113]" /><div className="h-[410px] rounded-3xl border border-accent/20 bg-paper dark:bg-[#111113]" /></div>}>
              <GamesHub />
            </Suspense>
            <section aria-labelledby="uploaded-games-heading" className="mt-14">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">Curated play</p>
                  <h2 id="uploaded-games-heading" className="mt-1 font-serif text-2xl sm:text-3xl">Uploaded Games</h2>
                </div>
                <p className="text-sm opacity-60">Explore the games collection.</p>
              </div>
              <Gallery sectionId="games-hub" />
            </section>
          </>
        )
      ) : (
        <Gallery sectionId={artworkSectionId} />
      )}
    </motion.div>
  );
}
