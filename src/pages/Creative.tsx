import { ArrowUpRight, Gamepad2, Palette, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ContentPage } from '../components/ContentPage';
import { CATEGORIES } from '../lib/categories';

const iconFor = (id: string) => id === 'games' ? Gamepad2 : Palette;

export default function Creative() {
  return (
    <ContentPage
      eyebrow="The archive · 01"
      title="Creative Journey"
      description="A home for pencil studies, wandering doodles, pixel worlds, handmade things, and games. The original collections remain right where they belong."
    >
      <div className="mb-6 flex items-center gap-2 text-xs opacity-55">
        <Sparkles size={14} className="text-accent" />
        <span>{String(CATEGORIES.length).padStart(2, '0')} collections · legacy galleries preserved</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((category, index) => {
          const Icon = iconFor(category.id);
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.045, duration: 0.35 }}
            >
              <Link
                to={`/creative/${category.id}`}
                className="publication-card group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-accent/10 via-transparent to-ink/[0.03] p-6 text-white transition duration-300 hover:border-accent/50 sm:min-h-60 sm:p-7"
              >
                <img
                  src={category.img}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-85"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/45 to-black/85" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-accent">{category.num}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-paper/60 text-accent transition duration-300 group-hover:scale-105 group-hover:bg-accent group-hover:text-white dark:bg-black/20">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="relative z-10">
                  <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">{category.label}</h2>
                  <p className="mt-2 max-w-xs text-sm opacity-60">{category.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
                    Enter collection <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </ContentPage>
  );
}
