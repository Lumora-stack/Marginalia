import { useParams, Link } from 'react-router-dom';
import Gallery from '../components/Gallery';
import { motion } from 'framer-motion';
import { getCategoryById, CATEGORIES } from '../lib/categories';
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Section() {
  const { id, mode } = useParams();
  if (!id) return null;

  const category = getCategoryById(id);
  const selectedMode = category?.gameModes?.find(gameMode => gameMode.id === mode);

  if (!category || (mode && !selectedMode)) {
    return (
      <div className="py-24 text-center space-y-6">
        <h2 className="text-3xl font-serif">Collection Not Found</h2>
        <p className="text-sm opacity-60">The requested category does not exist in Artville.</p>
        <Link
          to="/"
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
      className="pb-12"
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

      {/* Section Header */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={14} className="text-accent" />
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-accent font-semibold">
            Collection {category.num} / {String(CATEGORIES.length).padStart(2, '0')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif capitalize tracking-tight leading-none">
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
                to={`/section/${c.id}`}
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

      {isGameCollection && !selectedMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {category.gameModes?.map(gameMode => (
            <Link
              key={gameMode.id}
              to={`/section/${category.id}/${gameMode.id}`}
              className="group relative min-h-64 overflow-hidden rounded-3xl border border-ink/10 dark:border-white/10 bg-ink p-7 md:p-9 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start justify-between gap-4">
                <span className="text-xs font-mono tracking-[0.2em] uppercase text-white/50">
                  {category.num} / {gameMode.id === 'singleplayer' ? 'A' : 'B'}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all group-hover:bg-accent group-hover:text-white">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <div className="relative">
                <h2 className="mb-2 text-3xl font-serif text-white transition-colors group-hover:text-accent">
                  {gameMode.label}
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-white/60">
                  {gameMode.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Gallery sectionId={artworkSectionId} />
      )}
    </motion.div>
  );
}
