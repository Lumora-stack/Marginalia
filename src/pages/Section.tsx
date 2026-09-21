import { useParams, Link } from 'react-router-dom';
import Gallery from '../components/Gallery';
import { motion } from 'framer-motion';
import { getCategoryById, CATEGORIES } from '../lib/categories';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function Section() {
  const { id } = useParams();
  if (!id) return null;

  const category = getCategoryById(id);

  if (!category) {
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
            Collection {category.num} / 05
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif capitalize tracking-tight leading-none">
              {category.label}
            </h1>
            <p className="mt-4 text-base md:text-lg opacity-60 font-serif italic max-w-xl">
              {category.desc}
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

      {/* Gallery Render */}
      <Gallery sectionId={id} />
    </motion.div>
  );
}
