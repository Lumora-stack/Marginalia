import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Loader2, Maximize2 } from 'lucide-react';
import type { Artwork } from '../lib/supabase';

interface LightboxProps {
  artworks: Artwork[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ artworks, currentIndex, onClose, onNavigate }: LightboxProps) {
  const current = artworks[currentIndex];
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Reset loading state when index changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

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

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe left -> Next
      onNavigate(currentIndex < artworks.length - 1 ? currentIndex + 1 : 0);
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> Prev
      onNavigate(currentIndex > 0 ? currentIndex - 1 : artworks.length - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Controls */}
        <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
          <div className="text-white/50 font-mono text-xs tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            {String(currentIndex + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <a
              href={current.image_url}
              target="_blank"
              rel="noreferrer"
              title="Open full resolution"
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <Maximize2 size={16} />
            </a>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Prev Arrow */}
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={e => { e.stopPropagation(); onNavigate(currentIndex > 0 ? currentIndex - 1 : artworks.length - 1); }}
          className="absolute left-3 md:left-6 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all z-20 hidden sm:flex items-center justify-center"
          aria-label="Previous artwork"
        >
          <ChevronLeft size={22} />
        </motion.button>

        {/* Artwork Image Container */}
        <div
          className="relative max-w-5xl max-h-[88vh] w-full px-4 sm:px-16 flex flex-col items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Spinner while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center min-h-[300px]">
                  <Loader2 size={32} className="animate-spin text-accent" />
                </div>
              )}

              <img
                src={current.image_url}
                alt={current.title}
                onLoad={() => setImageLoaded(true)}
                className={`max-w-full max-h-[68vh] md:max-h-[72vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <div className="mt-5 text-center max-w-xl px-4">
                <h3 className="text-xl md:text-2xl font-serif text-white tracking-tight">
                  {current.title}
                </h3>

                <div className="flex items-center justify-center gap-2 mt-1.5">
                  {current.created_at && (
                    <p className="text-[11px] font-mono text-white/60 tracking-wider">
                      {new Date(current.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  {current.year && current.created_at && (
                    <span className="text-accent/60 text-[10px]">•</span>
                  )}
                  {current.year && (
                    <p className="text-[11px] font-mono text-accent uppercase tracking-[0.2em]">
                      {current.year}
                    </p>
                  )}
                </div>

                {current.description && (
                  <p className="mt-2 text-xs md:text-sm text-white/60 font-serif italic leading-relaxed">
                    {current.description}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Arrow */}
        <motion.button
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={e => { e.stopPropagation(); onNavigate(currentIndex < artworks.length - 1 ? currentIndex + 1 : 0); }}
          className="absolute right-3 md:right-6 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all z-20 hidden sm:flex items-center justify-center"
          aria-label="Next artwork"
        >
          <ChevronRight size={22} />
        </motion.button>

        {/* Mobile Swipe Hint */}
        <div className="absolute bottom-4 text-[10px] font-mono text-white/30 sm:hidden">
          Swipe left / right to browse
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
