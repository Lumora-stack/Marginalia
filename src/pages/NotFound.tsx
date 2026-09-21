import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6 max-w-md"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <Sparkles size={28} />
        </div>
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-accent">
          404 — Exhibition Not Found
        </p>
        <h1 className="text-4xl sm:text-5xl font-serif">
          Lost in Imagination
        </h1>
        <p className="text-sm opacity-60 font-serif italic">
          The artwork or room you are searching for does not exist or has been moved to another exhibition.
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
