import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="viewport-min-70 min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6 max-w-md"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-28 h-32 mx-auto rounded-lg border-2 border-accent/70 bg-accent/5 shadow-[0_0_42px_rgba(212,175,55,.14)] flex items-center justify-center text-accent"
        >
          <Sparkles size={28} />
          <span className="absolute -right-8 top-1/2 h-px w-8 bg-accent/50" />
        </motion.div>
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-accent">
          404 — Exhibition Not Found
        </p>
        <h1 className="text-4xl sm:text-5xl font-serif">
          Lost in the Museum
        </h1>
        <p className="text-sm opacity-60 font-serif italic">
          This frame is empty. The room you’re looking for may have moved to another wing.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-sans text-xs font-medium tracking-widest uppercase hover:bg-accent-light transition-all hover:scale-105"
          >
            <ArrowLeft size={14} />
            <span>Return to Gallery</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
