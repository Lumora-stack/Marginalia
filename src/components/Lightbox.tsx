import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Artwork } from '../lib/supabase';

interface LightboxProps {
  artworks: Artwork[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ artworks, currentIndex, onClose, onNavigate }: LightboxProps) {
  const current = artworks[currentIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onNavigate(currentIndex > 0 ? currentIndex - 1 : artworks.length - 1);
      if (e.key === 'ArrowRight')  onNavigate(currentIndex < artworks.length - 1 ? currentIndex + 1 : 0);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [currentIndex, onClose, onNavigate, artworks.length]);

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-2xl"
        onClick={onClose}
      >
        {/* Close */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-full glass text-white/70 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <X size={20} />
        </motion.button>

        {/* Counter */}
        <div className="absolute top-5 left-5 text-white/40 font-mono text-xs tracking-widest">
          {String(currentIndex + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
        </div>

        {/* Prev */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={e => { e.stopPropagation(); onNavigate(currentIndex > 0 ? currentIndex - 1 : artworks.length - 1); }}
          className="absolute left-4 md:left-6 p-3 rounded-full glass text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft size={24} />
        </motion.button>

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative max-w-5xl max-h-[85vh] w-full mx-16 flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={current.image_url}
              alt={current.title}
              className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-5 text-center">
              <h3 className="text-xl md:text-2xl font-serif text-white">{current.title}</h3>
              {(current.year) && (
                <p className="text-xs font-mono opacity-40 tracking-widest mt-1 uppercase">{current.year}</p>
              )}
              {current.description && (
                <p className="mt-2 text-sm opacity-60 max-w-lg mx-auto leading-relaxed">{current.description}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={e => { e.stopPropagation(); onNavigate(currentIndex < artworks.length - 1 ? currentIndex + 1 : 0); }}
          className="absolute right-4 md:right-6 p-3 rounded-full glass text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronRight size={24} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
