import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Artwork } from '../lib/supabase';

interface LightboxProps {
  artworks: Artwork[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ artworks, currentIndex, onClose, onNavigate }: LightboxProps) {
  const current = artworks[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(currentIndex > 0 ? currentIndex - 1 : artworks.length - 1);
      if (e.key === 'ArrowRight') onNavigate(currentIndex < artworks.length - 1 ? currentIndex + 1 : 0);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, onClose, onNavigate, artworks.length]);

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-paper/90 dark:bg-ink/95 backdrop-blur-xl"
        onClick={onClose}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-ink/10 dark:bg-white/10 hover:bg-ink/20 dark:hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex > 0 ? currentIndex - 1 : artworks.length - 1); }}
          className="absolute left-6 p-3 rounded-full bg-ink/10 dark:bg-white/10 hover:bg-ink/20 dark:hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div 
          className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
            src={current.image_url} 
            alt={current.title}
            className="max-w-full max-h-[75vh] object-contain rounded-sm shadow-2xl"
          />
          <div className="mt-6 text-center">
            <h3 className="text-xl font-serif mb-1">{current.title}</h3>
            {(current.medium || current.year) && (
              <p className="text-sm opacity-60 tracking-wider uppercase">
                {[current.medium, current.year].filter(Boolean).join(' • ')}
              </p>
            )}
            {current.description && (
              <p className="mt-2 text-sm opacity-80 max-w-xl mx-auto">{current.description}</p>
            )}
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex < artworks.length - 1 ? currentIndex + 1 : 0); }}
          className="absolute right-6 p-3 rounded-full bg-ink/10 dark:bg-white/10 hover:bg-ink/20 dark:hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
