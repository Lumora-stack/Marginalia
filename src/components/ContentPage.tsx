import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[65vh] py-2"
    >
      <header className="mb-10 max-w-3xl">
        <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
        <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.055em] sm:text-6xl md:text-7xl">{title}</h1>
        <p className="mt-5 max-w-2xl font-serif text-base italic leading-relaxed opacity-65 sm:text-lg">{description}</p>
      </header>
      {children}
    </motion.div>
  );
}

export function EmptyCollection({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-ink/[0.025] px-6 py-10 dark:border-white/10 dark:bg-white/[0.025] sm:px-10 sm:py-14">
      <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-14 font-serif text-[10rem] leading-none text-accent/[0.07] sm:text-[14rem]">
        {number}
      </span>
      <div className="relative max-w-xl">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent">A new collection is taking shape</p>
        <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed opacity-60">{description}</p>
      </div>
    </div>
  );
}
