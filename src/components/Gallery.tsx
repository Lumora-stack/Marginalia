import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Artwork } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ImageOff } from 'lucide-react';
import Lightbox from './Lightbox';

export default function Gallery({ sectionId }: { sectionId: string }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isOwner, setIsOwner]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });

    const fetchArtworks = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('section', sectionId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (data) setArtworks(data as Artwork[]);
      setLoading(false);
    };

    fetchArtworks();
  }, [sectionId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (!error) {
      setArtworks(prev => prev.filter(a => a.id !== id));
    } else {
      alert('Failed to delete.');
    }
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="columns-2 lg:columns-3 gap-3 md:gap-5 space-y-3 md:space-y-5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="break-inside-avoid mb-3 md:mb-5 rounded-2xl bg-ink/5 dark:bg-white/5 shimmer-bg animate-pulse"
            style={{ height: `${180 + (i % 3) * 80}px` }}
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (artworks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-32 flex flex-col items-center justify-center text-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-ink/5 dark:bg-white/5 flex items-center justify-center">
          <ImageOff size={32} className="opacity-30" />
        </div>
        <div className="opacity-50">
          <p className="text-2xl font-serif mb-2">No artworks yet</p>
          {isOwner ? (
            <p className="text-sm font-mono">Use the ✦ upload button to add pieces.</p>
          ) : (
            <p className="text-sm font-mono">Check back soon!</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="columns-2 lg:columns-3 gap-3 md:gap-5 space-y-3 md:space-y-5">
        <AnimatePresence>
          {artworks.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ duration: 0.55, delay: Math.min(i, 8) * 0.07, ease: 'easeOut' }}
              className="break-inside-avoid mb-3 md:mb-5 cursor-zoom-in group"
              onClick={() => setLightboxIndex(i)}
            >
              <div
                className="relative rounded-2xl overflow-hidden bg-ink/5 dark:bg-white/5 transition-all duration-500 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] group-hover:-translate-y-1"
              >
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                  <p className="text-white font-serif text-sm md:text-base translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {artwork.title}
                  </p>
                  {artwork.year && (
                    <p className="text-white/50 font-mono text-xs mt-0.5">{artwork.year}</p>
                  )}
                </div>

                {/* Delete button — always visible on mobile, hover-only on desktop */}
                {isOwner && (
                  <button
                    onClick={e => handleDelete(e, artwork.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 hover:bg-red-600 transition-all z-20 shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          artworks={artworks}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
